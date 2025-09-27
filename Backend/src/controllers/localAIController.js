/**
 * Local AI Controller - Endpoints for local AI-powered tourism analysis
 * Uses Ollama with Llama 3.1 for complete privacy and offline operation
 */

const express = require('express');
const router = express.Router();
const localAIService = require('../services/localAIService');

// POST /api/local-ai/analyze-text
// Analyze natural language text using local AI model
router.post('/analyze-text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a meaningful description of your travel preferences (at least 10 characters)',
        timestamp: new Date()
      });
    }

    console.log('🤖 Analyzing user text with local AI:', text.substring(0, 100) + '...');
    
    const preferences = await localAIService.analyzeUserText(text.trim());
    
    console.log('✅ Local AI extracted preferences:', preferences);
    
    res.json({
      success: true,
      data: {
        originalText: text,
        extractedPreferences: preferences,
        analysisTimestamp: new Date(),
        aiProvider: preferences.aiProvider || 'Local AI',
        isPrivate: true,
        isOffline: true
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Local AI text analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze your travel preferences with local AI. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date()
    });
  }
});

// POST /api/local-ai/recommendations
// Get AI-powered attraction recommendations using local model
router.post('/recommendations', async (req, res) => {
  try {
    const { preferences, availableAttractions } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Valid user preferences are required',
        timestamp: new Date()
      });
    }

    console.log('🎯 Generating local AI recommendations for preferences:', {
      budget: preferences.budget,
      activities: preferences.preferredActivities,
      groupSize: preferences.groupSize
    });
    
    // Use provided attractions or load mock data
    let attractions = availableAttractions;
    if (!attractions) {
      // Use mock attractions data
      attractions = [
        {
          id: 'the-peak',
          name: 'Victoria Peak',
          description: 'Iconic mountain offering panoramic views of Hong Kong skyline and harbor.',
          location: { lat: 22.2708, lng: 114.1550, address: 'Peak Rd, Hong Kong' },
          category: 'nature',
          priceRange: 'medium',
          rating: 4.5,
          estimatedVisitTime: 180,
          accessibility: { wheelchairAccessible: true, hasElevator: true, hasRestrooms: true, audioGuide: true }
        },
        {
          id: 'tsim-sha-tsui',
          name: 'Tsim Sha Tsui Promenade',
          description: 'Waterfront walkway with stunning harbor views and Symphony of Lights show.',
          location: { lat: 22.2940, lng: 114.1722, address: 'Tsim Sha Tsui, Kowloon' },
          category: 'cultural',
          priceRange: 'free',
          rating: 4.3,
          estimatedVisitTime: 120,
          accessibility: { wheelchairAccessible: true, hasElevator: false, hasRestrooms: true, audioGuide: false }
        },
        {
          id: 'temple-street',
          name: 'Temple Street Night Market',
          description: 'Famous night market with street food, fortune tellers, and shopping.',
          location: { lat: 22.3069, lng: 114.1722, address: 'Temple St, Yau Ma Tei, Kowloon' },
          category: 'food',
          priceRange: 'low',
          rating: 4.2,
          estimatedVisitTime: 150,
          accessibility: { wheelchairAccessible: false, hasElevator: false, hasRestrooms: true, audioGuide: false }
        },
        {
          id: 'man-mo-temple',
          name: 'Man Mo Temple',
          description: 'Historic Taoist temple dedicated to the gods of literature and war.',
          location: { lat: 22.2814, lng: 114.1506, address: 'Hollywood Rd, Sheung Wan' },
          category: 'cultural',
          priceRange: 'free',
          rating: 4.4,
          estimatedVisitTime: 60,
          accessibility: { wheelchairAccessible: false, hasElevator: false, hasRestrooms: false, audioGuide: false }
        },
        {
          id: 'central-district',
          name: 'Central District',
          description: 'Hong Kong\'s main business district with shopping and dining.',
          location: { lat: 22.2855, lng: 114.1577, address: 'Central, Hong Kong Island' },
          category: 'shopping',
          priceRange: 'high',
          rating: 4.5,
          estimatedVisitTime: 240,
          accessibility: { wheelchairAccessible: true, hasElevator: true, hasRestrooms: true, audioGuide: false }
        }
      ];
    }
    
    const recommendations = await localAIService.getPersonalizedRecommendations(
      preferences, 
      attractions
    );
    
    console.log(`✅ Generated ${recommendations.length} local AI recommendations`);
    
    res.json({
      success: true,
      data: {
        preferences,
        recommendations,
        totalRecommendations: recommendations.length,
        aiProvider: 'Local AI (Llama 3.1)',
        isPrivate: true,
        isOffline: true,
        generatedAt: new Date()
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Local AI recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate personalized recommendations with local AI. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date()
    });
  }
});

// POST /api/local-ai/trip-plan
// Generate complete trip plan using local AI
router.post('/trip-plan', async (req, res) => {
  try {
    const { preferences, attractions } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Valid user preferences are required for trip planning',
        timestamp: new Date()
      });
    }

    console.log('📅 Generating complete trip plan with local AI...');
    
    // Use provided attractions or fallback to mock data
    const availableAttractions = attractions || [
      {
        id: 'the-peak',
        name: 'Victoria Peak',
        category: 'nature',
        priceRange: 'medium',
        estimatedVisitTime: 180
      },
      {
        id: 'tsim-sha-tsui',
        name: 'Tsim Sha Tsui Promenade',
        category: 'cultural',
        priceRange: 'free',
        estimatedVisitTime: 120
      },
      {
        id: 'temple-street',
        name: 'Temple Street Night Market',
        category: 'food',
        priceRange: 'low',
        estimatedVisitTime: 150
      }
    ];
    
    // Get recommendations from local AI
    const recommendations = await localAIService.getPersonalizedRecommendations(
      preferences, 
      availableAttractions
    );
    
    // Calculate costs
    const totalEstimatedCost = recommendations.reduce((total, attr) => {
      const priceRangeValues = { free: 0, low: 25, medium: 125, high: 350, luxury: 750 };
      return total + (priceRangeValues[attr.priceRange] || 0);
    }, 0);

    // Create planned attractions with time slots
    const plannedAttractions = recommendations.map((attraction, index) => {
      const startTime = new Date();
      startTime.setHours(9 + (index * 2), 0, 0, 0); // Start at 9 AM, 2 hours apart
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (attraction.estimatedVisitTime || 120));

      return {
        attraction: attraction,
        plannedStartTime: startTime,
        plannedEndTime: endTime,
        estimatedCost: (() => {
          const priceRangeValues = { free: 0, low: 25, medium: 125, high: 350, luxury: 750 };
          return priceRangeValues[attraction.priceRange] || 0;
        })(),
        priority: attraction.aiRecommendation?.priority || (index + 1)
      };
    });

    // Create day itinerary
    const today = new Date();
    const dayItinerary = {
      date: today,
      attractions: plannedAttractions,
      totalTime: recommendations.reduce((total, attr) => 
        total + (attr.estimatedVisitTime || 120), 0
      ),
      totalCost: totalEstimatedCost,
      transportRoutes: [] // Would be populated by route optimization
    };

    // Generate proper TripPlan structure
    const tripPlan = {
      id: `local_trip_${Date.now()}`,
      title: `Private AI-Powered Hong Kong Adventure`,
      description: `Custom trip plan generated by local AI (Llama 3.1) - completely private and offline`,
      startDate: today,
      endDate: today, // Single day trip
      totalBudget: preferences.budget || 1000,
      estimatedCost: totalEstimatedCost,
      itinerary: [dayItinerary], // Array of daily itineraries
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Additional local AI specific fields
      preferences,
      recommendations: recommendations, // Keep this for easier access
      aiProvider: 'Local AI (Llama 3.1)',
      isPrivate: true,
      isOffline: true,
      optimizationNotes: [
        'Attractions selected by local Llama 3.1 AI model',
        'Completely private - no data sent to cloud',
        'Works offline after initial setup',
        'Personalized based on your specific preferences'
      ]
    };
    
    console.log(`✅ Generated local AI trip plan with ${recommendations.length} attractions`);
    
    res.json({
      success: true,
      data: tripPlan,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Local AI trip planning error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate trip plan with local AI. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date()
    });
  }
});

// GET /api/local-ai/health
// Health check for local AI service
router.get('/health', async (req, res) => {
  try {
    const status = await localAIService.getStatus();
    
    res.json({
      success: true,
      data: {
        aiServiceStatus: status.isAvailable ? 'active' : 'fallback_mode',
        ollamaConfigured: status.isAvailable,
        endpoint: status.endpoint,
        model: status.model,
        provider: status.provider,
        message: status.isAvailable 
          ? 'Local AI service is ready with Llama 3.1 model' 
          : 'Local AI running in fallback mode. Install Ollama and run: ollama pull llama3.1:8b',
        isPrivate: true,
        isOffline: status.isAvailable,
        benefits: [
          'Complete privacy - data never leaves your computer',
          'Works offline after setup',
          'No API costs or rate limits',
          'Available 24/7 regardless of internet restrictions'
        ],
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check local AI service status',
      timestamp: new Date()
    });
  }
});

// POST /api/local-ai/direct-plan
// Generate trip plan directly from user text (single AI call)
router.post('/direct-plan', async (req, res) => {
  try {
    const { text, attractions, realTimeData } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a meaningful description of your travel preferences (at least 10 characters)',
        timestamp: new Date()
      });
    }

    console.log('🚀 Generating direct trip plan from user text:', text.substring(0, 100) + '...');
    
    // Log real-time context if provided
    if (realTimeData) {
      console.log('🌤️ Real-time context included:', {
        weather: realTimeData.weather?.weatherCondition,
        temperature: realTimeData.weather?.temperature + '°C',
        alerts: realTimeData.alerts?.length || 0,
        airQuality: realTimeData.weather?.airQuality
      });
    }
    
    // Use provided attractions or fallback to mock data
    const availableAttractions = attractions || [
      {
        id: 'the-peak',
        name: 'Victoria Peak',
        category: 'nature',
        priceRange: 'medium',
        estimatedVisitTime: 180,
        description: 'Iconic mountain peak with panoramic city views'
      },
      {
        id: 'tsim-sha-tsui',
        name: 'Tsim Sha Tsui Promenade',
        category: 'cultural',
        priceRange: 'free',
        estimatedVisitTime: 120,
        description: 'Waterfront promenade with harbor views'
      },
      {
        id: 'temple-street',
        name: 'Temple Street Night Market',
        category: 'food',
        priceRange: 'low',
        estimatedVisitTime: 150,
        description: 'Famous night market with street food and shopping'
      },
      {
        id: 'victoria-harbor',
        name: 'Victoria Harbor',
        category: 'cultural',
        priceRange: 'free',
        estimatedVisitTime: 90,
        description: 'Historic harbor with stunning city skyline views'
      },
      {
        id: 'star-ferry',
        name: 'Star Ferry',
        category: 'cultural',
        priceRange: 'low',
        estimatedVisitTime: 30,
        description: 'Historic ferry service across Victoria Harbor'
      }
    ];
    
    // Generate complete trip plan directly from text with real-time context
    const tripPlan = await localAIService.generateDirectTripPlan(text.trim(), availableAttractions, realTimeData);
    
    console.log(`✅ Generated direct trip plan with ${tripPlan.recommendations?.length || 0} attractions`);
    
    res.json({
      success: true,
      data: tripPlan,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Direct trip planning error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate trip plan from your request. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date()
    });
  }
});

module.exports = router;