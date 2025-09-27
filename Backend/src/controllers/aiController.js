/**
 * AI Controller - Endpoints for Local LLM-powered tourism analysis
 * Handles text analysis and intelligent recommendations using Ollama/Llama
 */

const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// POST /api/ai/analyze-text
// Analyze natural language text to extract tourism preferences
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

    console.log('🤖 Analyzing user text with Local LLM:', text.substring(0, 100) + '...');
    
    const startTime = Date.now();
    const preferences = await aiService.analyzeUserText(text.trim());
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Analysis completed in ${processingTime}ms:`, preferences);
    
    res.json({
      success: true,
      data: {
        originalText: text,
        extractedPreferences: preferences,
        processingTimeMs: processingTime,
        analysisTimestamp: new Date(),
        aiProvider: 'Local LLM (Llama 3.1)'
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Text analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze your travel preferences. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date()
    });
  }
});

// POST /api/ai/recommendations
// Get AI-powered attraction recommendations based on preferences
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

    console.log('🎯 Generating Local LLM recommendations for:', {
      budget: preferences.budget,
      activities: preferences.preferredActivities,
      groupSize: preferences.groupSize
    });
    
    // Use provided attractions or load sample data
    let attractions = availableAttractions;
    if (!attractions) {
      // Load sample attractions (you can replace with database call)
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
          location: { lat: 22.3115, lng: 114.1717, address: 'Temple St, Yau Ma Tei' },
          category: 'food',
          priceRange: 'low',
          rating: 4.2,
          estimatedVisitTime: 90,
          accessibility: { wheelchairAccessible: false, hasElevator: false, hasRestrooms: true, audioGuide: false }
        },
        {
          id: 'man-mo-temple',
          name: 'Man Mo Temple',
          description: 'Historic Taoist temple dedicated to literature and war gods.',
          location: { lat: 22.2816, lng: 114.1499, address: '124-126 Hollywood Rd, Sheung Wan' },
          category: 'cultural',
          priceRange: 'free',
          rating: 4.4,
          estimatedVisitTime: 60,
          accessibility: { wheelchairAccessible: false, hasElevator: false, hasRestrooms: false, audioGuide: false }
        },
        {
          id: 'ifc-mall',
          name: 'IFC Mall',
          description: 'Luxury shopping mall with high-end brands and harbor views.',
          location: { lat: 22.2855, lng: 114.1577, address: '8 Finance St, Central' },
          category: 'shopping',
          priceRange: 'high',
          rating: 4.3,
          estimatedVisitTime: 150,
          accessibility: { wheelchairAccessible: true, hasElevator: true, hasRestrooms: true, audioGuide: false }
        },
        {
          id: 'star-ferry',
          name: 'Star Ferry',
          description: 'Historic ferry service offering scenic harbor crossings.',
          location: { lat: 22.2943, lng: 114.1685, address: 'Tsim Sha Tsui Pier' },
          category: 'cultural',
          priceRange: 'low',
          rating: 4.6,
          estimatedVisitTime: 30,
          accessibility: { wheelchairAccessible: true, hasElevator: false, hasRestrooms: true, audioGuide: false }
        }
      ];
    }
    
    const startTime = Date.now();
    const recommendations = await aiService.getPersonalizedRecommendations(preferences, attractions);
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Generated ${recommendations.length} recommendations in ${processingTime}ms`);
    
    res.json({
      success: true,
      data: {
        preferences,
        recommendations,
        totalRecommendations: recommendations.length,
        processingTimeMs: processingTime,
        aiProvider: 'Local LLM (Llama 3.1)',
        generatedAt: new Date()
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate personalized recommendations. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date()
    });
  }
});

// POST /api/ai/trip-plan
// Generate complete trip plan with AI optimization
router.post('/trip-plan', async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Valid user preferences are required for trip planning',
        timestamp: new Date()
      });
    }

    console.log('📅 Generating complete trip plan with Local LLM...');
    
    // Sample attractions for trip planning
    const attractions = [
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
        estimatedVisitTime: 90
      }
    ];
    
    const startTime = Date.now();
    const recommendations = await aiService.getPersonalizedRecommendations(preferences, attractions);
    const processingTime = Date.now() - startTime;
    
    // Generate trip plan structure
    const tripPlan = {
      id: `trip_${Date.now()}`,
      title: `AI-Powered Hong Kong Adventure`,
      description: `Custom trip plan generated by Local LLM based on your preferences`,
      preferences,
      attractions: recommendations,
      totalEstimatedTime: recommendations.reduce((total, attr) => 
        total + (attr.aiRecommendation?.suggestedDuration || attr.estimatedVisitTime), 0
      ),
      totalEstimatedCost: recommendations.reduce((total, attr) => {
        const priceRangeValues = { free: 0, low: 25, medium: 125, high: 350, luxury: 750 };
        return total + (priceRangeValues[attr.priceRange] || 0);
      }, 0),
      optimizationNotes: [
        'Attractions selected and ordered by Local AI',
        'Visit times optimized based on your preferences',
        'Budget-conscious selections made',
        'Generated privately on your server'
      ],
      processingTimeMs: processingTime,
      aiProvider: 'Local LLM (Llama 3.1)',
      createdAt: new Date()
    };
    
    console.log(`✅ Generated AI trip plan with ${recommendations.length} attractions in ${processingTime}ms`);
    
    res.json({
      success: true,
      data: tripPlan,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Trip planning error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate trip plan. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date()
    });
  }
});

// GET /api/ai/health
// Health check for Local AI service
router.get('/health', async (req, res) => {
  try {
    const aiService = require('../services/aiService');
    const isOllamaHealthy = await aiService.checkOllamaHealth();
    
    res.json({
      success: true,
      data: {
        aiServiceStatus: isOllamaHealthy ? 'active' : 'fallback_mode',
        ollamaConfigured: isOllamaHealthy,
        ollamaEndpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
        modelName: process.env.OLLAMA_MODEL || 'llama3.1:8b',
        message: isOllamaHealthy 
          ? 'Local AI service is ready with Ollama/Llama integration' 
          : 'Local AI service running in fallback mode (Ollama not available)',
        privateProcessing: true,
        costPerRequest: 0,
        aiProvider: 'Local LLM (Llama 3.1)',
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        aiServiceStatus: 'fallback_mode',
        ollamaConfigured: false,
        message: 'Local AI service running in fallback mode (health check failed)',
        error: error.message,
        timestamp: new Date()
      }
    });
  }
});

module.exports = router;
