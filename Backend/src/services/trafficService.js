/**
 * Traffic Service - Google Maps Distance Matrix API integration
 * Provides real-time traffic conditions for route optimization
 */

const axios = require('axios');

class TrafficService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    this.isAvailable = this.apiKey && this.apiKey.trim() !== '';
    
    if (!this.isAvailable) {
      console.log('🚗 Google Maps API key not configured - Traffic data disabled');
    } else {
      console.log('🚗 Traffic service initialized with Google Maps API');
    }
  }

  /**
   * Get traffic-aware travel times between attractions
   * @param {Array} attractions - Array of attraction objects with location data
   * @returns {Promise<Object>} Traffic matrix with travel times and conditions
   */
  async getTrafficMatrix(attractions) {
    if (!this.isAvailable) {
      console.log('⚠️ Traffic data unavailable - API key not configured');
      return null;
    }

    try {
      // Limit to first 10 attractions to avoid API quota issues
      const limitedAttractions = attractions.slice(0, 10);
      
      // Create origins and destinations arrays
      const locations = limitedAttractions.map(attraction => 
        `${attraction.location.lat},${attraction.location.lng}`
      );

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
      const params = {
        origins: locations.join('|'),
        destinations: locations.join('|'),
        departure_time: 'now', // Current time for real-time traffic
        traffic_model: 'best_guess',
        units: 'metric',
        key: this.apiKey
      };

      console.log('🚗 Fetching traffic data for', limitedAttractions.length, 'attractions...');
      
      const response = await axios.get(url, { 
        params,
        timeout: 10000 // 10 second timeout
      });

      if (response.data.status !== 'OK') {
        console.error('❌ Google Maps API error:', response.data.status);
        return null;
      }

      // Process the response into a usable format
      const trafficMatrix = this.processTrafficMatrix(
        response.data, 
        limitedAttractions
      );

      console.log('✅ Traffic data fetched successfully');
      return trafficMatrix;

    } catch (error) {
      console.error('❌ Traffic service error:', error.message);
      return null;
    }
  }

  /**
   * Process Google Maps Distance Matrix response
   * @param {Object} data - Google Maps API response
   * @param {Array} attractions - Original attractions array
   * @returns {Object} Processed traffic matrix
   */
  processTrafficMatrix(data, attractions) {
    const matrix = {
      routes: [],
      summary: {
        averageTrafficDelay: 0,
        totalRoutes: 0,
        heavyTrafficRoutes: 0
      }
    };

    let totalDelay = 0;
    let validRoutes = 0;

    data.rows.forEach((row, originIndex) => {
      row.elements.forEach((element, destIndex) => {
        // Skip same origin-destination
        if (originIndex === destIndex) return;
        
        if (element.status === 'OK') {
          const origin = attractions[originIndex];
          const destination = attractions[destIndex];
          
          const normalDuration = element.duration ? element.duration.value : 0;
          const trafficDuration = element.duration_in_traffic ? 
            element.duration_in_traffic.value : normalDuration;
          
          const trafficDelay = trafficDuration - normalDuration;
          const delayPercent = normalDuration > 0 ? 
            (trafficDelay / normalDuration) * 100 : 0;

          // Categorize traffic condition
          let trafficCondition = 'light';
          if (delayPercent > 50) trafficCondition = 'heavy';
          else if (delayPercent > 25) trafficCondition = 'moderate';

          const route = {
            from: origin.name,
            to: destination.name,
            fromId: origin.id,
            toId: destination.id,
            normalDuration: Math.ceil(normalDuration / 60), // Convert to minutes
            trafficDuration: Math.ceil(trafficDuration / 60), // Convert to minutes
            trafficDelay: Math.ceil(trafficDelay / 60), // Convert to minutes
            trafficCondition,
            delayPercent: Math.round(delayPercent)
          };

          matrix.routes.push(route);
          
          totalDelay += trafficDelay;
          validRoutes++;
          
          if (trafficCondition === 'heavy') {
            matrix.summary.heavyTrafficRoutes++;
          }
        }
      });
    });

    matrix.summary.averageTrafficDelay = validRoutes > 0 ? 
      Math.ceil(totalDelay / validRoutes / 60) : 0; // Convert to minutes
    matrix.summary.totalRoutes = validRoutes;

    return matrix;
  }

  /**
   * Get maximum traffic time between two specific attractions
   * @param {Object} trafficMatrix - Traffic matrix data
   * @param {string} fromId - Origin attraction ID
   * @param {string} toId - Destination attraction ID
   * @returns {number} Maximum traffic time in minutes
   */
  getTrafficTime(trafficMatrix, fromId, toId) {
    if (!trafficMatrix || !trafficMatrix.routes) {
      return 30; // Default 30 minutes if no traffic data
    }

    const route = trafficMatrix.routes.find(r => 
      r.fromId === fromId && r.toId === toId
    );

    return route ? route.trafficDuration : 30; // Default 30 minutes
  }

  /**
   * Generate traffic summary for AI prompt
   * @param {Object} trafficMatrix - Traffic matrix data
   * @returns {string} Formatted traffic summary
   */
  generateTrafficSummary(trafficMatrix) {
    if (!trafficMatrix) {
      return 'Traffic data: Not available (API key not configured)';
    }

    const { routes, summary } = trafficMatrix;
    
    let trafficSummary = `
REAL-TIME TRAFFIC CONDITIONS:
- Total routes analyzed: ${summary.totalRoutes}
- Heavy traffic routes: ${summary.heavyTrafficRoutes}
- Average traffic delay: ${summary.averageTrafficDelay} minutes

Key Routes with Traffic:`;

    // Add top 10 routes with significant delays
    const significantRoutes = routes
      .filter(r => r.trafficDelay > 5) // Only routes with >5 min delay
      .sort((a, b) => b.trafficDelay - a.trafficDelay)
      .slice(0, 10);

    significantRoutes.forEach(route => {
      trafficSummary += `\n- ${route.from} → ${route.to}: ${route.trafficDuration}min (${route.trafficCondition} traffic, +${route.trafficDelay}min delay)`;
    });

    if (significantRoutes.length === 0) {
      trafficSummary += '\n- No significant traffic delays detected';
    }

    trafficSummary += `

TRAFFIC-AWARE RECOMMENDATIONS:
- Routes with heavy traffic (>50% delay): Consider alternatives or timing adjustments
- Peak hour awareness: Cross-harbor routes may have delays
- MTR/Public transport: More reliable during heavy traffic periods
- Allow extra time: Build in traffic buffer for realistic scheduling`;

    return trafficSummary;
  }

  /**
   * Get traffic-aware travel time between two attractions
   * @param {Object} trafficMatrix - Traffic matrix data from processTrafficMatrix
   * @param {string} fromAttractionName - Source attraction name
   * @param {string} toAttractionName - Destination attraction name
   * @returns {number} Travel time in minutes (0 if not found)
   */
  getTrafficTime(trafficMatrix, fromAttractionName, toAttractionName) {
    if (!trafficMatrix || !trafficMatrix.routes) {
      return 0;
    }

    try {
      // Find matching route in the traffic matrix
      const route = trafficMatrix.routes.find(r => {
        const fromMatch = r.from.toLowerCase().includes(fromAttractionName.toLowerCase()) ||
                         fromAttractionName.toLowerCase().includes(r.from.toLowerCase());
        const toMatch = r.to.toLowerCase().includes(toAttractionName.toLowerCase()) ||
                       toAttractionName.toLowerCase().includes(r.to.toLowerCase());
        return fromMatch && toMatch;
      });

      if (route && route.trafficDuration > 0) {
        console.log(`🚗 Found traffic time: ${fromAttractionName} → ${toAttractionName} = ${route.trafficDuration} minutes`);
        return route.trafficDuration;
      }

      console.log(`⚠️ Traffic data not found for route: ${fromAttractionName} → ${toAttractionName}`);
      return 0;
    } catch (error) {
      console.error('Error getting traffic time:', error);
      return 0;
    }
  }
}

module.exports = new TrafficService();