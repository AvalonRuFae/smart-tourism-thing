/**
 * Local AI Service - Ollama integration for tourism preference analysis
 * Uses local Llama 3.1 model running via Ollama for complete privacy
 */

const axios = require('axios');
const trafficService = require('./trafficService');

class LocalAIService {
  constructor() {
    this.ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    this.modelName = process.env.OLLAMA_MODEL || 'llama3.1:8b';
    this.isAvailable = false;
    this.currentRequest = null; // Track current request to prevent duplicates
    
    // Check if Ollama is available on startup
    this.checkOllamaAvailability();
  }

  /**
   * Check if Ollama is running and model is available
   */
  async checkOllamaAvailability() {
    try {
      const response = await axios.get(`${this.ollamaEndpoint}/api/tags`, { timeout: 5000 });
      const models = response.data.models || [];
      this.isAvailable = models.some(m => m.name.includes('llama3.1'));
      
      if (this.isAvailable) {
        console.log('✅ Ollama is available with Llama 3.1 model');
      } else {
        console.log('⚠️ Ollama running but Llama 3.1 model not found. Please run: ollama pull llama3.1:8b');
      }
    } catch (error) {
      this.isAvailable = false;
      console.log('⚠️ Ollama not available. Install from https://ollama.ai/ and run: ollama pull llama3.1:8b');
    }
  }

  /**
   * Analyze user text to extract tourism preferences using local AI
   * @param {string} userText - Natural language description of trip preferences
   * @returns {Promise<Object>} Structured preferences object
   */
  async analyzeUserText(userText) {
    try {
      if (!this.isAvailable) {
        console.log('🔄 Ollama not available, using fallback analysis');
        return this.getFallbackPreferences(userText);
      }

      const prompt = this.createAnalysisPrompt(userText);
      console.log('🤖 Analyzing text with local Llama model...');
      
      const response = await axios.post(`${this.ollamaEndpoint}/api/generate`, {
        model: this.modelName,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          num_predict: 300 // Reduced for faster response
        }
      }, { timeout: 60000 }); // Increased to 60 seconds for local AI processing

      const aiResponse = response.data.response;
      console.log('🧠 Local AI response:', aiResponse.substring(0, 200) + '...');
      
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const preferences = JSON.parse(jsonMatch[0]);
        return this.validatePreferences(preferences);
      } else {
        throw new Error('No valid JSON found in AI response');
      }

    } catch (error) {
      console.error('❌ Local AI Analysis Error:', error.message);
      return this.getFallbackPreferences(userText);
    }
  }

  /**
   * Generate personalized attraction recommendations using local AI
   * @param {Object} preferences - User preferences object
   * @param {Array} availableAttractions - List of all attractions
   * @returns {Promise<Array>} Filtered and ranked attractions
   */
  async getPersonalizedRecommendations(preferences, availableAttractions) {
    try {
      if (!this.isAvailable) {
        console.log('🔄 Ollama not available, using fallback recommendations');
        return this.getFallbackRecommendations(preferences, availableAttractions);
      }

      const prompt = this.createRecommendationPrompt(preferences, availableAttractions);
      console.log('🎯 Generating recommendations with local Llama model...');
      
      const response = await axios.post(`${this.ollamaEndpoint}/api/generate`, {
        model: this.modelName,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.4,
          top_p: 0.9,
          num_predict: 500 // Reduced for faster response
        }
      }, { timeout: 80000 }); // Increased to 80 seconds for recommendations

      const aiResponse = response.data.response;
      console.log('🧠 Local AI recommendation response:', aiResponse.substring(0, 200) + '...');
      
      // Extract JSON array from response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        return this.processRecommendations(recommendations, availableAttractions);
      } else {
        throw new Error('No valid JSON array found in AI response');
      }

    } catch (error) {
      console.error('❌ Local AI Recommendation Error:', error.message);
      return this.getFallbackRecommendations(preferences, availableAttractions);
    }
  }

  /**
   * Create analysis prompt for user text
   */
  createAnalysisPrompt(userText) {
    return `You are a Hong Kong tourism expert. Analyze this user request and extract preferences in EXACT JSON format.

User Request: "${userText}"

You must respond with ONLY a valid JSON object, no additional text or explanation.

Required JSON format:
{
  "budget": number (in HK$, estimate: budget=300, mid=800, luxury=1500),
  "maxTravelTime": number (minutes per location, 15-180),
  "preferredActivities": ["cultural","nature","entertainment","shopping","food","historical","museum","nightlife"],
  "groupSize": number,
  "hasChildren": boolean,
  "accessibilityNeeds": boolean,
  "transportMode": "walking"|"driving"|"public_transport"|"mixed",
  "confidence": number (0-1),
  "extractedKeywords": ["keyword1","keyword2"]
}

Analyze the text for:
- Budget mentions or lifestyle indicators
- Activities, interests, and attractions mentioned
- Group size and family composition
- Special needs or accessibility requirements
- Transportation preferences

Respond with only the JSON object:`;
  }

  /**
   * Create recommendation prompt
   */
  createRecommendationPrompt(preferences, attractions) {
    const attractionsList = attractions.slice(0, 20).map(a => 
      `${a.id}: ${a.name} (${a.category}, ${a.priceRange}, ${a.estimatedVisitTime}min)`
    ).join('\n');

    return `You are a Hong Kong tourism expert. Select and rank the best attractions for this user.

User Preferences:
${JSON.stringify(preferences, null, 2)}

Available Attractions:
${attractionsList}

You must respond with ONLY a valid JSON array, no additional text.

Required JSON format:
[
  {
    "attractionId": "string",
    "recommendationScore": number (0-1),
    "matchingReasons": ["reason1", "reason2"],
    "suggestedVisitTime": "HH:MM",
    "suggestedDuration": number (minutes),
    "personalizedTips": ["tip1", "tip2"]
  }
]

Rules:
- Select 5-8 best matching attractions
- Score based on budget, activities, group needs, accessibility
- Suggest optimal visit times based on preferences
- Provide personalized tips for the user's situation

Respond with only the JSON array:`;
  }

  /**
   * Validate and sanitize preferences object
   */
  validatePreferences(preferences) {
    const validCategories = ['cultural', 'nature', 'entertainment', 'shopping', 'food', 'historical', 'museum', 'nightlife'];
    const validTransport = ['walking', 'driving', 'public_transport', 'mixed'];

    return {
      budget: Math.max(100, Math.min(10000, preferences.budget || 1000)),
      maxTravelTime: Math.max(15, Math.min(300, preferences.maxTravelTime || 60)),
      preferredActivities: (preferences.preferredActivities || []).filter(cat => validCategories.includes(cat)),
      groupSize: Math.max(1, Math.min(20, preferences.groupSize || 2)),
      hasChildren: Boolean(preferences.hasChildren),
      accessibilityNeeds: Boolean(preferences.accessibilityNeeds),
      transportMode: validTransport.includes(preferences.transportMode) ? preferences.transportMode : 'mixed',
      confidence: Math.max(0, Math.min(1, preferences.confidence || 0.8)),
      extractedKeywords: Array.isArray(preferences.extractedKeywords) ? preferences.extractedKeywords : [],
      aiProvider: 'Local Llama 3.1'
    };
  }

  /**
   * Process AI recommendations with actual attraction data
   */
  processRecommendations(recommendations, availableAttractions) {
    const attractionMap = new Map(availableAttractions.map(a => [a.id, a]));
    
    return recommendations
      .filter(rec => attractionMap.has(rec.attractionId))
      .map(rec => ({
        ...attractionMap.get(rec.attractionId),
        aiRecommendation: {
          score: rec.recommendationScore,
          reasons: rec.matchingReasons,
          suggestedVisitTime: rec.suggestedVisitTime,
          suggestedDuration: rec.suggestedDuration,
          personalizedTips: rec.personalizedTips,
          aiProvider: 'Local Llama 3.1'
        }
      }))
      .sort((a, b) => b.aiRecommendation.score - a.aiRecommendation.score);
  }

  /**
   * Fallback when Ollama is unavailable - keyword-based analysis
   */
  getFallbackPreferences(userText) {
    console.log('🔄 Using keyword-based fallback analysis');
    
    const text = userText.toLowerCase();
    const preferences = {
      budget: 1000,
      maxTravelTime: 60,
      preferredActivities: [],
      groupSize: 2,
      hasChildren: false,
      accessibilityNeeds: false,
      transportMode: 'mixed',
      confidence: 0.6,
      extractedKeywords: [],
      aiProvider: 'Keyword Fallback'
    };

    // Extract budget
    if (text.includes('budget') || text.includes('cheap') || text.includes('affordable')) preferences.budget = 500;
    if (text.includes('luxury') || text.includes('expensive') || text.includes('premium')) preferences.budget = 2000;
    if (text.match(/\$\d+|\d+\s*hk/i)) {
      const budgetMatch = text.match(/\$?(\d+)/);
      if (budgetMatch) preferences.budget = parseInt(budgetMatch[1]);
    }

    // Extract activities
    if (text.includes('culture') || text.includes('temple') || text.includes('heritage')) preferences.preferredActivities.push('cultural');
    if (text.includes('nature') || text.includes('mountain') || text.includes('park')) preferences.preferredActivities.push('nature');
    if (text.includes('food') || text.includes('eat') || text.includes('dim sum')) preferences.preferredActivities.push('food');
    if (text.includes('shop') || text.includes('market') || text.includes('mall')) preferences.preferredActivities.push('shopping');
    if (text.includes('museum') || text.includes('gallery')) preferences.preferredActivities.push('museum');
    if (text.includes('night') || text.includes('bar') || text.includes('club')) preferences.preferredActivities.push('nightlife');

    // Extract group info
    if (text.includes('family') || text.includes('children') || text.includes('kids')) {
      preferences.hasChildren = true;
      preferences.groupSize = 4;
    }
    if (text.includes('couple') || text.includes('two')) preferences.groupSize = 2;
    if (text.includes('solo') || text.includes('alone')) preferences.groupSize = 1;

    // Extract accessibility
    if (text.includes('wheelchair') || text.includes('accessible') || text.includes('mobility')) {
      preferences.accessibilityNeeds = true;
    }

    // Extract transport
    if (text.includes('walk') || text.includes('walking')) preferences.transportMode = 'walking';
    if (text.includes('drive') || text.includes('car')) preferences.transportMode = 'driving';
    if (text.includes('mtr') || text.includes('bus') || text.includes('public')) preferences.transportMode = 'public_transport';

    return preferences;
  }

  /**
   * Fallback recommendations using simple filtering
   */
  getFallbackRecommendations(preferences, availableAttractions) {
    console.log('🔄 Using rule-based fallback recommendations');
    
    const priceRangeValues = { free: 0, low: 25, medium: 125, high: 350, luxury: 750 };
    
    return availableAttractions
      .filter(attraction => {
        // Budget filter
        const attractionPrice = priceRangeValues[attraction.priceRange] || 0;
        if (attractionPrice > preferences.budget) return false;
        
        // Category filter
        if (preferences.preferredActivities.length > 0 && 
            !preferences.preferredActivities.includes(attraction.category)) return false;
        
        // Accessibility filter
        if (preferences.accessibilityNeeds && !attraction.accessibility?.wheelchairAccessible) return false;
        
        return true;
      })
      .slice(0, 6)
      .map((attraction, index) => ({
        ...attraction,
        aiRecommendation: {
          score: 0.8 - (index * 0.1),
          reasons: ['Matches your preferences', 'Within budget', 'Popular destination'],
          suggestedVisitTime: '10:00',
          suggestedDuration: attraction.estimatedVisitTime,
          personalizedTips: ['Book in advance', 'Bring comfortable shoes'],
          aiProvider: 'Rule-based Fallback'
        }
      }));
  }

  /**
   * Get service status
   */
  async getStatus() {
    await this.checkOllamaAvailability();
    return {
      isAvailable: this.isAvailable,
      endpoint: this.ollamaEndpoint,
      model: this.modelName,
      provider: this.isAvailable ? 'Local Llama 3.1' : 'Fallback System'
    };
  }

  /**
   * Generate complete trip plan directly from user text (single AI call)
   * @param {string} userText - Natural language description of trip preferences
   * @param {Array} availableAttractions - List of available attractions
   * @param {Object} realTimeData - Current weather, traffic, and alerts
   * @returns {Promise<Object>} Complete trip plan object
   */
  async generateDirectTripPlan(userText, availableAttractions, realTimeData = null) {
    // Simple deduplication to prevent double requests
    const requestKey = `${userText.substring(0, 50)}-${Date.now()}`;
    if (this.currentRequest === requestKey) {
      console.log('🚫 Duplicate request detected, skipping');
      return this.getDirectFallbackTripPlan(userText, availableAttractions, realTimeData);
    }
    this.currentRequest = requestKey;
    
    try {
      if (!this.isAvailable) {
        console.log('🔄 Ollama not available, using direct fallback trip plan');
        // Fetch traffic data even for fallback to improve scheduling
        const trafficData = await trafficService.getTrafficMatrix(availableAttractions);
        const enhancedRealTimeData = { ...realTimeData, traffic: trafficData };
        return this.getDirectFallbackTripPlan(userText, availableAttractions, enhancedRealTimeData);
      }

      // Fetch traffic data for AI consideration
      console.log('🚗 Fetching traffic conditions for AI analysis...');
      const trafficData = await trafficService.getTrafficMatrix(availableAttractions);
      
      // Add traffic data to realTimeData for fallback function
      const enhancedRealTimeData = {
        ...realTimeData,
        traffic: trafficData
      };

      const prompt = this.createDirectTripPlanPrompt(userText, availableAttractions, enhancedRealTimeData, trafficData);
      console.log('🎯 Generating complete trip plan with single AI call...');
      
      const response = await axios.post(`${this.ollamaEndpoint}/api/generate`, {
        model: this.modelName,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.0,  // Most deterministic
          top_p: 0.5,        // Reduced randomness
          num_predict: 800   // Increased for complete JSON
        }
      }); // No timeout - testing AI accuracy first

      const aiResponse = response.data.response;
      console.log('🧠 Direct AI trip plan response:', aiResponse.substring(0, 200) + '...');
      console.log('🧠 Full AI response length:', aiResponse.length);
      console.log('🧠 Full AI response:', aiResponse);

      // Extract JSON from response with smart reconstruction
      let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      // If no complete JSON found or JSON is truncated, try intelligent reconstruction
      if (!jsonMatch || !aiResponse.includes('totalDuration') || !aiResponse.includes('estimatedCost')) {
        console.log('🔧 JSON incomplete or truncated, attempting smart reconstruction');
        
        // Extract the attractions array even if incomplete
        const attractionsMatch = aiResponse.match(/"selectedAttractions"\s*:\s*\[[\s\S]*/);
        if (attractionsMatch) {
          console.log('🔍 Found attractions data, reconstructing complete JSON');
          
          let attractionsStr = attractionsMatch[0];
          
          // If the attractions array is not closed, try to close it intelligently
          if (!attractionsStr.includes(']')) {
            // Find the last complete attraction object
            const lastBrace = attractionsStr.lastIndexOf('}');
            if (lastBrace > -1) {
              attractionsStr = attractionsStr.substring(0, lastBrace + 1) + ']';
            }
          }
          
          // Calculate estimated values based on found attractions
          const attractionMatches = attractionsStr.match(/"duration"\s*:\s*(\d+)/g) || [];
          const totalDuration = attractionMatches.reduce((sum, match) => {
            const duration = parseInt(match.match(/\d+/)[0]);
            return sum + duration;
          }, 0) || 270;
          
          const estimatedCost = totalDuration > 200 ? 800 : 600;
          
          // Reconstruct complete JSON
          const reconstructedJson = `{${attractionsStr},"totalDuration":${totalDuration},"estimatedCost":${estimatedCost}}`;
          jsonMatch = [reconstructedJson];
          console.log('✅ Successfully reconstructed JSON from partial response');
        }
      }
      
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];
        
        // Log the original JSON before cleaning
        console.log('🔍 Original JSON (first 500 chars):', jsonStr.substring(0, 500));
        
        // Targeted JSON cleaning to fix specific AI formatting issues
        jsonStr = jsonStr
          // First, normalize whitespace and newlines completely
          .replace(/\n\s*/g, ' ')     // Replace ALL newlines with spaces
          .replace(/\s+/g, ' ')       // Normalize multiple spaces to single space
          .trim()                     // Remove leading/trailing whitespace
          
          // Fix trailing commas before closing brackets/braces
          .replace(/,(\s*[}\]])/g, '$1')
          
          // Ensure proper spacing around colons and commas
          .replace(/:\s+"/g, ': "')
          .replace(/",\s+/g, '", ')
          
          // Fix any incomplete closing braces/brackets at end
          .replace(/,\s*$/, '')       // Remove trailing comma at end
          
          // Ensure the JSON structure is complete
          .replace(/}\s*$/, '}')      // Clean ending
          
          // Fix the specific "null," pattern we see in logs
          .replace(/"null,"/g, 'null')
          .replace(/": "null,"/g, '": null')
          
          // Fix the specific broken time pattern: "09: "00"," -> "09:00"
          .replace(/": "(\d{1,2}):\s*"(\d{2})","/g, '": "$1:$2"')
          .replace(/": "(\d{1,2}):\s*"(\d{2})"/g, '": "$1:$2"')
          
          // Fix the specific number pattern: "123 }" -> 123}
          .replace(/": "(\d+)\s*}"/g, '": $1}')
          .replace(/": "(\d+)\s*",/g, '": $1,')
          .replace(/": "(\d+)"/g, '": $1')
          
          // Fix visitOrder pattern: "1," -> 1
          .replace(/"visitOrder": "(\d+),"/g, '"visitOrder": $1')
          
          // Fix boolean and null values that got incorrectly quoted
          .replace(/": "true"/g, '": true')
          .replace(/": "false"/g, '": false')
          .replace(/": "null"/g, '": null')
          
          // Fix unquoted string values that should be numbers
          .replace(/": low,/g, '": 400,')
          .replace(/": medium,/g, '": 800,')
          .replace(/": high,/g, '": 1500,')
          .replace(/": low$/g, '": 400')
          .replace(/": medium$/g, '": 800')
          .replace(/": high$/g, '": 1500')
          .replace(/": low"/g, '": 400')
          .replace(/": medium"/g, '": 800')
          .replace(/": high"/g, '": 1500')
          .replace(/: low,/g, ': 400,')
          .replace(/: medium,/g, ': 800,')
          .replace(/: high,/g, ': 1500,')
          .replace(/: low$/g, ': 400')
          .replace(/: medium$/g, ': 800')
          .replace(/: high$/g, ': 1500')
          
          // Clean up any remaining malformed quotes
          .replace(/"{2,}/g, '"')  // Replace multiple consecutive quotes with single quote
          .replace(/",+/g, '",')   // Fix multiple commas after quotes
        
        console.log('🔧 Cleaned JSON string (first 500 chars):', jsonStr.substring(0, 500));
        
        try {
          const tripPlan = JSON.parse(jsonStr);
          return this.processDirectTripPlan(tripPlan, userText, availableAttractions, trafficData);
        } catch (parseError) {
          console.error('❌ JSON Parse Error after cleaning:', parseError.message);
          console.error('❌ Problematic JSON (first 1000 chars):', jsonStr.substring(0, 1000));
          
          // Try extracting key information manually if JSON parsing fails
          const fallbackPlan = this.extractTripPlanFromText(aiResponse, userText, availableAttractions);
          if (fallbackPlan) {
            console.log('✅ Using fallback text extraction method');
            return fallbackPlan;
          }
          
          throw new Error(`Invalid JSON format: ${parseError.message}`);
        }
      } else {
        throw new Error('No valid JSON found in AI trip plan response');
      }

    } catch (error) {
      console.error('❌ Direct AI Trip Planning Error:', error.message);
      // Fetch traffic data for fallback scheduling
      const trafficData = await trafficService.getTrafficMatrix(availableAttractions);
      const enhancedRealTimeData = { ...realTimeData, traffic: trafficData };
      return this.getDirectFallbackTripPlan(userText, availableAttractions, enhancedRealTimeData);
    }
  }

  /**
   * Create prompt for direct trip planning from user text
   */
  createDirectTripPlanPrompt(userText, attractions, realTimeData = null, trafficData = null) {
    const attractionsList = attractions.slice(0, 15).map(a => 
      `${a.id}: ${a.name} - ${a.description} (${a.category}, ${a.priceRange}, ${a.estimatedVisitTime}min)`
    ).join('\n');

    // Build real-time context section
    let contextSection = '';
    if (realTimeData) {
      const weather = realTimeData.weather || {};
      const alerts = realTimeData.alerts || [];
      
      contextSection = `
IMPORTANT - Current Real-Time Conditions:
- Weather: ${weather.weatherCondition || 'Unknown'} (${weather.temperature || '?'}°C)
- Air Quality Index: ${weather.airQuality || 'Unknown'}
- UV Index: ${weather.uvIndex || 'Unknown'}
- Active Alerts: ${alerts.length > 0 ? alerts.map(a => a.title).join(', ') : 'None'}

Weather-Based Recommendations:
- If weather is rainy/stormy: Prioritize indoor attractions (museums, shopping malls)
- If very hot (>30°C) or UV high (>8): Suggest indoor activities during peak hours
- If air quality poor (<50): Recommend indoor attractions, avoid outdoor activities
- If typhoon/severe weather alerts: Strongly favor indoor, accessible attractions

Transportation Recommendations:
- Poor weather conditions: Suggest MTR over buses (more reliable)
- Good weather: Walking and outdoor transport options are viable
`;
    }

    const firstFewAttractions = attractionsList.split('\n').slice(0, 8).join('\n'); // Only first 8 attractions for speed
    
    // Add traffic information if available
    let trafficSection = '';
    if (trafficData) {
      trafficSection = trafficService.generateTrafficSummary(trafficData);
    }
    
    return `Create Hong Kong trip plan for: "${userText}"
${contextSection}
${trafficSection}

Available attractions:
${firstFewAttractions}

RETURN ONLY VALID JSON with this exact structure:
{
  "selectedAttractions": [
    {
      "attractionId": "exact-id-from-list",
      "name": "exact name from list",
      "reason": "why selected",
      "visitOrder": 1,
      "suggestedTime": "09:00",
      "duration": 90
    }
  ],
  "totalDuration": 270,
  "estimatedCost": 800
}

Rules:
- Select 3-4 attractions matching "${userText}"
- Schedule starting 9:00 AM with realistic 2-3 hour gaps
- Use exact attractionId and name from list above
- Medium budget = 600-1000 HKD
- Return ONLY the JSON, no other text`;
  }

  /**
   * Extract trip plan information from text when JSON parsing fails
   */
  extractTripPlanFromText(aiResponse, userText, availableAttractions) {
    try {
      console.log('🔍 Attempting text extraction from AI response...');
      
      // First, try to extract structured information from the AI response
      const attractions = [];
      
      // Look for attraction patterns in the AI response
      const attractionBlocks = aiResponse.split(/(?=\s*{\s*"attractionId")/);
      
      for (const block of attractionBlocks) {
        if (!block.includes('attractionId')) continue;
        
        // Extract key information using regex
        const idMatch = block.match(/"attractionId":\s*"([^"]+)"/);
        const nameMatch = block.match(/"name":\s*"([^"]+)"/);
        const timeMatch = block.match(/"suggestedTime":\s*"([^"]+)"/);
        const durationMatch = block.match(/"duration":\s*(\d+)/);
        const reasonMatch = block.match(/"reason":\s*"([^"]+)"/);
        
        if (idMatch && nameMatch) {
          const attractionId = idMatch[1];
          const foundAttraction = availableAttractions.find(a => a.id === attractionId);
          
          if (foundAttraction) {
            attractions.push({
              attraction: foundAttraction,
              suggestedTime: timeMatch ? timeMatch[1] : '09:00',
              duration: durationMatch ? parseInt(durationMatch[1]) : foundAttraction.estimatedVisitTime,
              reason: reasonMatch ? reasonMatch[1] : 'Selected by AI'
            });
          }
        }
      }
      
      console.log(`🎯 Extracted ${attractions.length} attractions from AI response`);
      
      if (attractions.length === 0) {
        // Fallback to simple name matching
        const mentionedAttractions = availableAttractions.filter(attraction => 
          aiResponse.toLowerCase().includes(attraction.name.toLowerCase())
        );
        
        if (mentionedAttractions.length === 0) {
          return null;
        }
        
        // Convert to expected format
        attractions.push(...mentionedAttractions.slice(0, 4).map((attraction, index) => ({
          attraction,
          suggestedTime: `${9 + index * 2}:00`,
          duration: attraction.estimatedVisitTime,
          reason: 'Mentioned in AI response'
        })));
      }

      // Create a proper trip plan structure using extracted attractions
      const plannedAttractions = attractions.map((item, index) => {
        const [hours, minutes] = item.suggestedTime.split(':').map(n => parseInt(n));
        const startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + item.duration);

        return {
          attraction: {
            ...item.attraction,
            aiRecommendation: {
              reason: item.reason,
              visitOrder: index + 1,
              priority: index + 1
            }
          },
          plannedStartTime: item.suggestedTime, // Send as string
          plannedEndTime: endTime,
          estimatedCost: this.getPriceEstimate(item.attraction.priceRange),
          priority: index + 1,
          suggestedTime: item.suggestedTime,     // Multiple formats
          startTime: item.suggestedTime          // for compatibility
        };
      });

      return {
        id: `trip-${Date.now()}`,
        name: "AI Generated Trip Plan",
        description: `Generated from: ${userText}`,
        plannedAttractions,
        startDate: new Date(),
        endDate: new Date(),
        totalEstimatedCost: plannedAttractions.reduce((sum, pa) => sum + pa.estimatedCost, 0),
        aiProvider: "Local Llama 3.1 (Text Extraction)",
        preferences: {
          extractedFromText: userText,
          method: "text_extraction_fallback"
        }
      };
    } catch (error) {
      console.error('❌ Text extraction fallback failed:', error.message);
      return null;
    }
  }

  /**
   * Process and validate direct trip plan
   */
  processDirectTripPlan(aiTripPlan, userText, availableAttractions, trafficData = null) {
    // Create proper TripPlan structure
    const today = new Date();
    
    // Create planned attractions from AI selection with traffic-aware scheduling
    let currentTime = 9; // Start at 9:00 AM
    const plannedAttractions = (aiTripPlan.selectedAttractions || []).map((selected, index) => {
      const attraction = availableAttractions.find(a => a.id === selected.attractionId) || availableAttractions[0];
      
      // Use traffic-aware start time for attractions after the first one
      let startTimeStr;
      if (index === 0) {
        startTimeStr = selected.suggestedTime || '09:00';
        const [hours, minutes] = startTimeStr.split(':');
        currentTime = parseInt(hours) + parseInt(minutes) / 60;
      } else {
        // Calculate start time based on previous attraction + duration + traffic time
        const hours = Math.floor(currentTime);
        const minutes = Math.round((currentTime % 1) * 60);
        startTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      
      const startTime = new Date();
      const [hours, minutes] = startTimeStr.split(':');
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const duration = selected.duration || attraction.estimatedVisitTime || 120;
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      // Calculate travel time to next attraction using traffic data
      const nextIndex = index + 1;
      if (nextIndex < aiTripPlan.selectedAttractions.length) {
        const nextAttraction = availableAttractions.find(a => 
          a.id === aiTripPlan.selectedAttractions[nextIndex].attractionId
        );
        
        let travelTimeMinutes = 90; // Default 1.5 hours
        
        if (trafficData && attraction && nextAttraction) {
          const trafficTime = trafficService.getTrafficTime(
            trafficData,
            attraction.name,
            nextAttraction.name
          );
          if (trafficTime > 0) {
            travelTimeMinutes = trafficTime;
            console.log(`🚗 Traffic-aware travel time from ${attraction.name} to ${nextAttraction.name}: ${trafficTime} minutes`);
          }
        }
        
        // Update current time for next attraction: current end + travel time
        currentTime += (duration / 60) + (travelTimeMinutes / 60);
      }

      return {
        attraction: {
          ...attraction,
          aiRecommendation: {
            reason: selected.reason,
            visitOrder: selected.visitOrder || (index + 1),
            priority: index + 1
          }
        },
        plannedStartTime: startTimeStr, // Send as string in HH:MM format
        plannedEndTime: endTime,
        estimatedCost: this.getPriceEstimate(attraction.priceRange),
        priority: selected.visitOrder || (index + 1),
        suggestedTime: startTimeStr, // Also add as suggestedTime for compatibility
        startTime: startTimeStr      // Multiple formats for compatibility
      };
    });

    // Create day itinerary
    const dayItinerary = {
      date: today,
      attractions: plannedAttractions,
      totalTime: aiTripPlan.totalDuration || plannedAttractions.reduce((total, pa) => 
        total + (pa.attraction.estimatedVisitTime || 120), 0
      ),
      totalCost: aiTripPlan.estimatedCost || plannedAttractions.reduce((total, pa) => total + pa.estimatedCost, 0),
      transportRoutes: []
    };

    return {
      id: `direct_trip_${Date.now()}`,
      title: `AI-Powered Hong Kong Trip`,
      description: aiTripPlan.userIntent || `Custom trip plan based on: "${userText.substring(0, 100)}..."`,
      startDate: today,
      endDate: today,
      totalBudget: aiTripPlan.extractedPreferences?.budget || 1000,
      estimatedCost: dayItinerary.totalCost,
      itinerary: [dayItinerary],
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Direct AI specific fields
      userText: userText,
      extractedPreferences: aiTripPlan.extractedPreferences,
      recommendations: plannedAttractions.map(pa => pa.attraction),
      plannedAttractions: plannedAttractions,  // Add this for frontend compatibility!
      aiProvider: 'Local Llama 3.1',
      isPrivate: true,
      isOffline: true,
      processingTime: 'Single AI call'
    };
  }

  /**
   * Fallback trip plan when AI is unavailable
   */
  getDirectFallbackTripPlan(userText, availableAttractions, realTimeData = null) {
    const text = userText.toLowerCase();
    
    // Weather-aware filtering
    let weatherPreference = 'any';
    if (realTimeData?.weather) {
      const weather = realTimeData.weather;
      const hasAlerts = realTimeData.alerts?.length > 0;
      
      // Safely check weather condition with better error handling
      let weatherCondition = '';
      if (weather.weatherCondition && typeof weather.weatherCondition === 'string') {
        weatherCondition = weather.weatherCondition.toLowerCase();
      } else if (weather.condition && typeof weather.condition === 'string') {
        weatherCondition = weather.condition.toLowerCase();
      } else if (weather.description && typeof weather.description === 'string') {
        weatherCondition = weather.description.toLowerCase();
      }
      
      if (weatherCondition.includes('rain') || 
          weatherCondition.includes('storm') ||
          weatherCondition.includes('shower') ||
          hasAlerts) {
        weatherPreference = 'indoor';
        console.log('🌧️ Bad weather detected, prioritizing indoor attractions');
      } else if (weather.temperature > 30 || weather.uvIndex > 8) {
        weatherPreference = 'mixed'; // Mix of indoor/outdoor
        console.log('🌡️ Hot weather detected, suggesting mixed indoor/outdoor activities');
      } else if (weather.airQuality < 50) {
        weatherPreference = 'indoor';
        console.log('🏭 Poor air quality detected, prioritizing indoor attractions');
      }
    }
    
    // Enhanced keyword matching for fallback with better cultural + food logic
    let selectedAttractions = [];
    
    // First, handle specific combinations like "cultural + dimsum/food"
    if (text.includes('cultural') && (text.includes('dimsum') || text.includes('dim sum') || text.includes('food') || text.includes('lunch'))) {
      console.log('🎯 Detected cultural + food request, creating specialized plan');
      
      // Get cultural attractions that fit weather conditions
      const culturalAttractions = availableAttractions.filter(a => {
        if (weatherPreference === 'indoor' && !['museum', 'cultural', 'shopping'].includes(a.category)) {
          return false;
        }
        return a.category === 'cultural' || a.name.toLowerCase().includes('temple') ||
               a.name.toLowerCase().includes('museum') || a.name.toLowerCase().includes('heritage');
      }).slice(0, 2);
      
      // Get food attractions, prioritizing dimsum/markets
      const foodAttractions = availableAttractions.filter(a => 
        a.category === 'food' || 
        a.name.toLowerCase().includes('market') || 
        a.name.toLowerCase().includes('restaurant') || 
        a.name.toLowerCase().includes('dim sum') ||
        a.name.toLowerCase().includes('tea') || 
        a.description?.toLowerCase().includes('dim sum')
      ).slice(0, 2);
      
      selectedAttractions = [...culturalAttractions, ...foodAttractions];
      console.log('🍽️ Selected cultural + food plan:', selectedAttractions.map(a => `${a.name} (${a.category})`).join(', '));
    } else {
      // Original single-category filtering
      selectedAttractions = availableAttractions.filter(a => {
        // Weather-based filtering
        if (weatherPreference === 'indoor') {
          if (!['museum', 'cultural', 'shopping', 'food'].includes(a.category)) {
            return false;
          }
        }
        
        // Content-based filtering
        if (text.includes('cultural') || text.includes('harbor') || text.includes('history')) {
          return a.category === 'cultural';
        }
        if (text.includes('nature') || text.includes('peak') || text.includes('mountain')) {
          return weatherPreference !== 'indoor' && a.category === 'nature';
        }
        if (text.includes('food') || text.includes('market') || text.includes('eat') || text.includes('dimsum')) {
          return a.category === 'food';
        }
        return true;
      }).slice(0, 5);
    }

    // Ensure we have at least some attractions
    if (selectedAttractions.length === 0) {
      console.log('🔄 No specific matches found, using general selection');
      selectedAttractions = availableAttractions.slice(0, 4);
    } else if (selectedAttractions.length < 3) {
      // Add more attractions if we don't have enough
      const additionalAttractions = availableAttractions
        .filter(a => !selectedAttractions.some(s => s.id === a.id))
        .slice(0, 4 - selectedAttractions.length);
      selectedAttractions = [...selectedAttractions, ...additionalAttractions];
    }
    
    console.log(`✅ Fallback selected ${selectedAttractions.length} attractions:`, 
      selectedAttractions.map(a => `${a.name} (${a.category})`).join(', '));

    // Create basic trip plan structure with proper timing
    const today = new Date();
    let currentTime = 9; // Start at 9 AM
    
    const plannedAttractions = selectedAttractions.map((attraction, index) => {
      const startTime = new Date();
      startTime.setHours(Math.floor(currentTime), (currentTime % 1) * 60, 0, 0);
      
      const visitDuration = attraction.estimatedVisitTime || 120;
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + visitDuration);
      
      // Add travel time and break (30-60 minutes) for next attraction - traffic-aware
      if (index < selectedAttractions.length - 1) {
        const nextAttraction = selectedAttractions[index + 1];
        let travelTimeHours = 1.5; // Default 1.5 hours
        
        // Try to get traffic-aware travel time if available
        if (realTimeData && realTimeData.traffic) {
          const trafficTime = trafficService.getTrafficTime(
            realTimeData.traffic,
            attraction.name,
            nextAttraction.name
          );
          if (trafficTime > 0) {
            travelTimeHours = trafficTime / 60; // Convert minutes to hours
            console.log(`🚗 Using traffic time: ${attraction.name} → ${nextAttraction.name} = ${trafficTime} minutes`);
          }
        }
        
        currentTime += (visitDuration / 60) + travelTimeHours;
      }

      return {
        attraction: {
          ...attraction,
          aiRecommendation: {
            reason: `Matches keywords from your request`,
            visitOrder: index + 1,
            priority: index + 1
          }
        },
        plannedStartTime: startTime,
        plannedEndTime: endTime,
        estimatedCost: this.getPriceEstimate(attraction.priceRange),
        priority: index + 1
      };
    });

    const dayItinerary = {
      date: today,
      attractions: plannedAttractions,
      totalTime: plannedAttractions.reduce((total, pa) => total + pa.attraction.estimatedVisitTime, 0),
      totalCost: plannedAttractions.reduce((total, pa) => total + pa.estimatedCost, 0),
      transportRoutes: []
    };

    return {
      id: `fallback_trip_${Date.now()}`,
      title: `Hong Kong Trip Plan`,
      description: `Trip plan based on: "${userText.substring(0, 100)}..."`,
      startDate: today,
      endDate: today,
      totalBudget: 1000,
      estimatedCost: dayItinerary.totalCost,
      itinerary: [dayItinerary],
      createdAt: new Date(),
      updatedAt: new Date(),
      
      userText: userText,
      extractedPreferences: {
        budget: 1000,
        preferredActivities: this.guessActivitiesFromText(text),
        groupSize: 2,
        transportMode: this.getRecommendedTransportMode(realTimeData)
      },
      recommendations: plannedAttractions.map(pa => pa.attraction),
      weatherContext: realTimeData ? {
        condition: realTimeData.weather?.weatherCondition,
        temperature: realTimeData.weather?.temperature,
        recommendation: this.getWeatherRecommendation(realTimeData)
      } : null,
      aiProvider: 'Keyword Fallback',
      isPrivate: true,
      isOffline: true,
      processingTime: 'Instant fallback'
    };
  }

  /**
   * Get price estimate from price range
   */
  getPriceEstimate(priceRange) {
    const priceRangeValues = { 
      free: 0, 
      low: 25, 
      medium: 125, 
      high: 350, 
      luxury: 750 
    };
    return priceRangeValues[priceRange] || 0;
  }

  /**
   * Guess activities from text for fallback
   */
  guessActivitiesFromText(text) {
    const activities = [];
    if (text.includes('culture') || text.includes('temple') || text.includes('heritage')) activities.push('cultural');
    if (text.includes('nature') || text.includes('mountain') || text.includes('park')) activities.push('nature');
    if (text.includes('food') || text.includes('eat') || text.includes('market')) activities.push('food');
    if (text.includes('shop') || text.includes('mall')) activities.push('shopping');
    if (text.includes('museum') || text.includes('gallery')) activities.push('museum');
    return activities.length > 0 ? activities : ['cultural'];
  }

  /**
   * Get recommended transport mode based on weather conditions
   */
  getRecommendedTransportMode(realTimeData) {
    if (!realTimeData?.weather) return 'mixed';
    
    const weather = realTimeData.weather;
    const hasAlerts = realTimeData.alerts?.length > 0;
    
    // Safely handle weather condition
    let weatherCondition = '';
    if (weather.weatherCondition && typeof weather.weatherCondition === 'string') {
      weatherCondition = weather.weatherCondition.toLowerCase();
    } else if (weather.condition && typeof weather.condition === 'string') {
      weatherCondition = weather.condition.toLowerCase();
    }
    
    if (weatherCondition.includes('rain') || 
        weatherCondition.includes('storm') ||
        hasAlerts) {
      return 'public_transport'; // MTR is more reliable in bad weather
    }
    
    if (weather.temperature > 32) {
      return 'public_transport'; // Air conditioning
    }
    
    return 'mixed'; // Walking + public transport
  }

  /**
   * Generate weather-based recommendation text
   */
  getWeatherRecommendation(realTimeData) {
    if (!realTimeData?.weather) return 'No weather data available';
    
    const weather = realTimeData.weather;
    const alerts = realTimeData.alerts || [];
    
    let recommendations = [];
    
    // Safely handle weather condition
    let weatherCondition = '';
    if (weather.weatherCondition && typeof weather.weatherCondition === 'string') {
      weatherCondition = weather.weatherCondition.toLowerCase();
    } else if (weather.condition && typeof weather.condition === 'string') {
      weatherCondition = weather.condition.toLowerCase();
    }
    
    if (weatherCondition.includes('rain')) {
      recommendations.push('Rainy weather - indoor attractions recommended');
    }
    
    if (weather.temperature > 30) {
      recommendations.push('Hot weather - seek air-conditioned venues during peak hours');
    }
    
    if (weather.uvIndex > 8) {
      recommendations.push('High UV index - bring sun protection or stay indoors 11AM-3PM');
    }
    
    if (weather.airQuality < 50) {
      recommendations.push('Poor air quality - indoor activities strongly recommended');
    }
    
    if (alerts.length > 0) {
      recommendations.push(`Active weather alerts: ${alerts.map(a => a.title).join(', ')}`);
    }
    
    return recommendations.length > 0 ? recommendations.join('; ') : 'Good conditions for outdoor activities';
  }
}

module.exports = new LocalAIService();