/**
 * Attractions Controller - Tourist attractions API endpoints
 * Manages attraction data, search, filtering, and recommendations
 */

const express = require('express');
const router = express.Router();

// Mock attractions data
const mockAttractions = [
  {
    id: '1',
    name: 'Victoria Peak',
    description: 'Iconic mountain offering panoramic views of Hong Kong skyline and harbor.',
    location: { lat: 22.2708, lng: 114.1550, address: 'Peak Rd, Hong Kong' },
    category: 'nature',
    priceRange: 'medium',
    rating: 4.5,
    imageUrl: '/images/victoria-peak.jpg',
    tags: ['views', 'nature', 'iconic', 'photography'],
    openingHours: {
      monday: { open: '10:00', close: '23:00', isClosed: false },
      tuesday: { open: '10:00', close: '23:00', isClosed: false },
      wednesday: { open: '10:00', close: '23:00', isClosed: false },
      thursday: { open: '10:00', close: '23:00', isClosed: false },
      friday: { open: '10:00', close: '23:00', isClosed: false },
      saturday: { open: '08:00', close: '23:00', isClosed: false },
      sunday: { open: '08:00', close: '23:00', isClosed: false }
    },
    estimatedVisitTime: 180,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasRestrooms: true,
      audioGuide: true
    }
  },
  {
    id: '2',
    name: 'Tsim Sha Tsui Promenade',
    description: 'Waterfront walkway with stunning harbor views and Symphony of Lights show.',
    location: { lat: 22.2940, lng: 114.1722, address: 'Tsim Sha Tsui, Kowloon' },
    category: 'cultural',
    priceRange: 'free',
    rating: 4.3,
    imageUrl: '/images/tsim-sha-tsui.jpg',
    tags: ['waterfront', 'views', 'free', 'evening'],
    openingHours: {
      monday: { open: '00:00', close: '23:59', isClosed: false },
      tuesday: { open: '00:00', close: '23:59', isClosed: false },
      wednesday: { open: '00:00', close: '23:59', isClosed: false },
      thursday: { open: '00:00', close: '23:59', isClosed: false },
      friday: { open: '00:00', close: '23:59', isClosed: false },
      saturday: { open: '00:00', close: '23:59', isClosed: false },
      sunday: { open: '00:00', close: '23:59', isClosed: false }
    },
    estimatedVisitTime: 120,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: false,
      hasRestrooms: true,
      audioGuide: false
    }
  }
  // Add more mock attractions...
];

// GET /api/attractions
// Get all attractions with optional filtering
router.get('/', async (req, res) => {
  try {
    let attractions = mockAttractions;
    const { filters } = req.query;
    
    if (filters) {
      const parsedFilters = JSON.parse(filters);
      
      // Filter by category
      if (parsedFilters.preferredActivities && parsedFilters.preferredActivities.length > 0) {
        attractions = attractions.filter(attraction =>
          parsedFilters.preferredActivities.includes(attraction.category)
        );
      }
      
      // Filter by price range based on budget
      if (parsedFilters.budget) {
        const priceRangeValues = { free: 0, low: 25, medium: 125, high: 350, luxury: 750 };
        attractions = attractions.filter(attraction => {
          const attractionPrice = priceRangeValues[attraction.priceRange] || 0;
          return attractionPrice <= parsedFilters.budget;
        });
      }
      
      // Filter by accessibility
      if (parsedFilters.accessibilityNeeds) {
        attractions = attractions.filter(attraction =>
          attraction.accessibility.wheelchairAccessible
        );
      }
    }

    res.json({
      success: true,
      data: attractions,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Attractions API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attractions',
      timestamp: new Date()
    });
  }
});

// GET /api/attractions/search
// Search attractions by query
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({
        success: true,
        data: [],
        timestamp: new Date()
      });
    }
    
    const query = q.toLowerCase();
    const results = mockAttractions.filter(attraction =>
      attraction.name.toLowerCase().includes(query) ||
      attraction.description.toLowerCase().includes(query) ||
      attraction.tags.some(tag => tag.toLowerCase().includes(query))
    );

    res.json({
      success: true,
      data: results,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search attractions',
      timestamp: new Date()
    });
  }
});

// GET /api/attractions/:id
// Get specific attraction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attraction = mockAttractions.find(a => a.id === id);
    
    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: 'Attraction not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: attraction,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Attraction API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attraction',
      timestamp: new Date()
    });
  }
});

module.exports = router;