/**
 * Weather Controller - Hong Kong Observatory Official API Integration
 * Uses official HKO APIs for accurate Hong Kong weather data
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Official Hong Kong Observatory API endpoints
const HKO_CURRENT_WEATHER_URL = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en';
const HKO_WARNING_URL = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en';
const HKO_FORECAST_URL = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=en';

// API request timeout
const API_TIMEOUT = 10000;

// Default fallback data when APIs are unavailable
const FALLBACK_WEATHER = {
  temperature: 26,
  humidity: 75,
  uvIndex: 6.2,
  weatherCondition: 53,
  icon: 'partly-cloudy',
  timestamp: new Date(),
  alerts: [],
  windSpeed: null,
  visibility: null
};

/**
 * Fetch real-time weather data from Hong Kong Observatory
 */
async function fetchHKOWeatherData() {
  try {
    console.log('Fetching weather data from HKO APIs...');
    
    // Fetch all required data simultaneously
    const [currentResponse, warningResponse, forecastResponse] = await Promise.allSettled([
      axios.get(HKO_CURRENT_WEATHER_URL, { timeout: API_TIMEOUT }),
      axios.get(HKO_WARNING_URL, { timeout: API_TIMEOUT }),
      axios.get(HKO_FORECAST_URL, { timeout: API_TIMEOUT })
    ]);
    
    // Parse current weather data
    const currentData = currentResponse.status === 'fulfilled' ? currentResponse.value.data : null;
    const warningData = warningResponse.status === 'fulfilled' ? warningResponse.value.data : {};
    const forecastData = forecastResponse.status === 'fulfilled' ? forecastResponse.value.data : null;
    
    if (!currentData) {
      console.error('Failed to fetch current weather data from HKO');
      return FALLBACK_WEATHER;
    }
    
    console.log('HKO current weather data received');
    console.log('Active warnings:', Object.keys(warningData));
    console.log('Weather icon code:', currentData.icon?.[0]);
    
    // Extract weather information
    const temperature = currentData.temperature?.data?.[0]?.value || FALLBACK_WEATHER.temperature;
    const humidity = currentData.humidity?.data?.[0]?.value || FALLBACK_WEATHER.humidity;
    const uvIndex = currentData.uvindex?.data?.[0]?.value || FALLBACK_WEATHER.uvIndex;
    const weatherIcon = currentData.icon?.[0] || FALLBACK_WEATHER.weatherCondition;
    
    // Parse warnings and alerts
    const alerts = parseHKOWarnings(warningData, currentData.warningMessage || []);
    const hasActiveTyphoon = alerts.some(alert => alert.type === 'typhoon');
    
    // Determine weather icon
    const standardIcon = hasActiveTyphoon ? 'typhoon' : mapHKOIconToStandard(weatherIcon);
    
    return {
      temperature: temperature,
      humidity: humidity,
      uvIndex: uvIndex,
      weatherCondition: weatherIcon,
      icon: standardIcon,
      timestamp: new Date(),
      alerts: alerts,
      windSpeed: null, // Not available in rhrread API
      visibility: null, // Not available in rhrread API
      updateTime: currentData.updateTime,
      specialWxTips: currentData.specialWxTips || [],
      tcMessage: currentData.tcmessage || []
    };
    
  } catch (error) {
    console.error('Error fetching HKO weather data:', error.message);
    return FALLBACK_WEATHER;
  }
}

/**
 * Parse HKO warnings into standardized alert format
 */
function parseHKOWarnings(warningData, warningMessages = []) {
  const alerts = [];
  
  // Process each warning type
  Object.entries(warningData).forEach(([warningType, warning]) => {
    const alert = {
      id: warning.code || warningType,
      type: getAlertType(warningType),
      level: getAlertLevel(warningType, warning.type),
      title: warning.name || warningType,
      message: getWarningMessage(warningType, warning),
      issuedAt: warning.issueTime ? new Date(warning.issueTime) : new Date(),
      expiresAt: new Date(Date.now() + getWarningDuration(warningType)),
      affectedAreas: ['Hong Kong Island', 'Kowloon', 'New Territories'],
      actionCode: warning.actionCode,
      icon: getWarningIcon(warningType)
    };
    
    alerts.push(alert);
  });
  
  // Add warning messages as additional context
  warningMessages.forEach((message, index) => {
    if (message && !alerts.some(alert => alert.message.includes(message.substring(0, 20)))) {
      alerts.push({
        id: `msg_${index}`,
        type: 'weather',
        level: 'info',
        title: 'Weather Advisory',
        message: message,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        affectedAreas: ['Hong Kong Island', 'Kowloon', 'New Territories'],
        icon: '⚠️'
      });
    }
  });
  
  return alerts;
}

/**
 * Get alert type based on warning type
 */
function getAlertType(warningType) {
  if (warningType.includes('TC') || warningType === 'WTCSGNL') return 'typhoon';
  if (warningType.includes('RAIN') || warningType === 'WRAIN') return 'weather';
  if (warningType.includes('WL')) return 'landslip';
  if (warningType.includes('WFNT')) return 'flooding';
  return 'weather';
}

/**
 * Get alert level based on warning type and subtype
 */
function getAlertLevel(warningType, subType) {
  if (warningType.includes('TC') || warningType === 'WTCSGNL') {
    if (subType && (subType.includes('8') || subType.includes('9') || subType.includes('10'))) {
      return 'critical';
    }
    return 'warning';
  }
  
  if (warningType.includes('RAIN') || warningType === 'WRAIN') {
    if (subType === 'Black') return 'critical';
    if (subType === 'Red') return 'warning';
    return 'info';
  }
  
  return 'warning';
}

/**
 * Get warning message
 */
function getWarningMessage(warningType, warning) {
  const baseMessage = warning.name || warningType;
  const typeDetails = warning.type ? ` (${warning.type})` : '';
  const actionDetails = warning.actionCode ? ` - ${warning.actionCode}` : '';
  
  return `${baseMessage}${typeDetails}${actionDetails}`;
}

/**
 * Get warning duration in milliseconds
 */
function getWarningDuration(warningType) {
  if (warningType.includes('TC') || warningType === 'WTCSGNL') return 12 * 60 * 60 * 1000; // 12 hours
  if (warningType.includes('RAIN') || warningType === 'WRAIN') return 6 * 60 * 60 * 1000; // 6 hours
  return 3 * 60 * 60 * 1000; // 3 hours default
}

/**
 * Get warning icon
 */
function getWarningIcon(warningType) {
  if (warningType.includes('TC') || warningType === 'WTCSGNL') return '🌀';
  if (warningType.includes('RAIN') || warningType === 'WRAIN') return '🌧️';
  if (warningType.includes('WL')) return '⛰️';
  if (warningType.includes('WFNT')) return '🌊';
  return '⚠️';
}

/**
 * Map HKO weather icon codes to standard weather descriptions
 */
function mapHKOIconToStandard(iconCode) {
  const iconMap = {
    50: 'sunny',
    51: 'partly-cloudy',
    52: 'partly-cloudy',
    53: 'partly-cloudy',
    54: 'cloudy',
    60: 'cloudy',
    61: 'rainy',
    62: 'heavy-rain',
    63: 'rainy',
    64: 'heavy-rain',
    65: 'thunderstorm',
    70: 'foggy',
    71: 'foggy',
    72: 'foggy',
    73: 'foggy',
    74: 'foggy',
    75: 'foggy',
    76: 'cloudy',
    77: 'overcast'
  };
  
  return iconMap[iconCode] || 'partly-cloudy';
}

// API Routes

/**
 * GET /current - Get current weather conditions
 */
router.get('/current', async (req, res) => {
  try {
    console.log('Weather API request received');
    const weatherData = await fetchHKOWeatherData();
    
    res.json({
      success: true,
      data: weatherData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data',
      timestamp: new Date()
    });
  }
});

/**
 * GET /warnings - Get active weather warnings
 */
router.get('/warnings', async (req, res) => {
  try {
    const warningResponse = await axios.get(HKO_WARNING_URL, { timeout: API_TIMEOUT });
    const warningData = warningResponse.data;
    
    const alerts = parseHKOWarnings(warningData);
    
    res.json({
      success: true,
      data: {
        warnings: warningData,
        alerts: alerts,
        count: alerts.length
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Warning API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch warning data',
      timestamp: new Date()
    });
  }
});

/**
 * GET /forecast - Get weather forecast
 */
router.get('/forecast', async (req, res) => {
  try {
    const forecastResponse = await axios.get(HKO_FORECAST_URL, { timeout: API_TIMEOUT });
    const forecastData = forecastResponse.data;
    
    res.json({
      success: true,
      data: {
        generalSituation: forecastData.generalSituation,
        forecast: forecastData.weatherForecast?.map(day => ({
          date: day.forecastDate,
          week: day.week,
          weather: day.forecastWeather,
          wind: day.forecastWind,
          maxTemp: day.forecastMaxtemp,
          minTemp: day.forecastMintemp,
          maxHumidity: day.forecastMaxrh,
          minHumidity: day.forecastMinrh,
          icon: day.ForecastIcon,
          rainProbability: day.PSR
        })),
        updateTime: forecastData.updateTime
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Forecast API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forecast data',
      timestamp: new Date()
    });
  }
});

/**
 * GET /test-typhoon - Test endpoint for typhoon simulation
 */
router.get('/test-typhoon', async (req, res) => {
  try {
    const testTyphoonData = {
      temperature: 28,
      humidity: 95,
      uvIndex: 0.1,
      weatherCondition: 65,
      icon: 'typhoon',
      timestamp: new Date(),
      alerts: [
        {
          id: 'TC8SE',
          type: 'typhoon',
          level: 'critical',
          title: 'Tropical Cyclone Signal No. 8 Southeast',
          message: 'Tropical Cyclone Warning Signal No. 8 Southeast Gale or Storm Signal is in force. Winds with sustained speeds of 63 to 87 km/h are expected.',
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
          affectedAreas: ['Hong Kong Island', 'Kowloon', 'New Territories'],
          actionCode: 'ISSUE',
          icon: '🌀'
        },
        {
          id: 'WRAINA',
          type: 'weather',
          level: 'warning',
          title: 'Amber Rainstorm Warning',
          message: 'Amber Rainstorm Warning Signal - Heavy rain has fallen or is expected to fall generally over Hong Kong, exceeding 50 millimetres in an hour.',
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
          affectedAreas: ['Hong Kong Island', 'Kowloon', 'New Territories'],
          actionCode: 'ISSUE',
          icon: '🌧️'
        }
      ],
      windSpeed: 75,
      visibility: 2000,
      specialWxTips: ['Localised Heavy Rain Advisory: There is exceptionally severe rainstorm in some areas.'],
      tcMessage: ['Here is the information on Severe Typhoon Ragasa at current time: Location: 21.6 degrees north, 112.1 degrees east; Maximum sustained wind near its centre: 155 km/h.']
    };

    res.json({
      success: true,
      data: testTyphoonData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Test typhoon API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate test typhoon data',
      timestamp: new Date()
    });
  }
});

module.exports = router;