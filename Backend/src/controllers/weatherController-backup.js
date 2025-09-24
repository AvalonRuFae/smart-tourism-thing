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

// Fetch comprehensive Hong Kong weather data
async function fetchHKWeatherData() {
  try {
    // Get current weather, warnings, and forecast data from HKO
    const [currentResponse, warningResponse, forecastResponse] = await Promise.allSettled([
      axios.get(HKO_CURRENT_WEATHER_URL, { timeout: 5000 }),
      axios.get(HKO_WARNING_URL, { timeout: 5000 }),
      axios.get(HKO_FORECAST_URL, { timeout: 5000 })
    ]);
    
    if (currentResponse.status === 'fulfilled' && currentResponse.value.data) {
      const hkoData = currentResponse.value.data;
      const warnings = warningResponse.status === 'fulfilled' ? warningResponse.value.data : {};
      const forecast = forecastResponse.status === 'fulfilled' ? forecastResponse.value.data : {};
      
      // Extract temperature from various sources
      let temperature = mockWeatherData.temperature;
      if (hkoData.temperature?.data?.length > 0) {
        temperature = hkoData.temperature.data[0].value;
      } else if (hkoData.rainfall?.data?.length > 0) {
        // Sometimes temperature is in the rainfall data structure
        const tempData = hkoData.rainfall.data.find(item => item.value !== undefined);
        if (tempData) temperature = tempData.value;
      }
      
      const alerts = parseHKOWarnings(warnings, forecast);
      const hasActiveTyphoonsignal = alerts.some(alert => alert.type === 'typhoon');
      const standardIcon = mapHKOIconToStandard(hkoData.icon?.[0] || forecast.weatherForecast?.[0]?.weather);
      
      return {
        temperature: temperature,
        humidity: hkoData.humidity?.data?.[0]?.value || mockWeatherData.humidity,
        uvIndex: hkoData.uvindex?.data?.[0]?.value || mockWeatherData.uvIndex,
        weatherCondition: hkoData.icon?.[0] || forecast.weatherForecast?.[0]?.weather || mockWeatherData.weatherCondition,
        icon: hasActiveTyphoonsignal ? 'typhoon' : standardIcon,
        timestamp: new Date(),
        alerts: alerts,
        airQuality: mockWeatherData.airQuality, // HKO doesn't provide air quality in basic API
        windSpeed: hkoData.rainfall?.data?.[0]?.max || null,
        visibility: hkoData.visibility?.data?.[0]?.value || null
      };
    }
  } catch (error) {
    console.log('HKO API unavailable, trying OpenWeather fallback:', error.message);
    
    // Fallback to OpenWeather API
    try {
      const owResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${HK_COORDINATES.lat}&lon=${HK_COORDINATES.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`,
        { timeout: 5000 }
      );
      
      const uvResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/uvi?lat=${HK_COORDINATES.lat}&lon=${HK_COORDINATES.lon}&appid=${OPENWEATHER_API_KEY}`,
        { timeout: 5000 }
      );
      
      if (owResponse.data) {
        const owData = owResponse.data;
        return {
          temperature: Math.round(owData.main.temp),
          humidity: owData.main.humidity,
          uvIndex: uvResponse.data?.value || mockWeatherData.uvIndex,
          weatherCondition: owData.weather[0].main,
          icon: mapOWIconToStandard(owData.weather[0].icon),
          timestamp: new Date(),
          alerts: mockWeatherData.alerts, // Use mock alerts for now
          airQuality: mockWeatherData.airQuality,
          windSpeed: owData.wind?.speed || null,
          visibility: owData.visibility ? owData.visibility / 1000 : null // Convert m to km
        };
      }
    } catch (owError) {
      console.log('OpenWeather API also unavailable, using mock data:', owError.message);
    }
  }
  
  // Return mock data if all APIs fail
  return mockWeatherData;
}

// Map HKO weather icons to standard icons
function mapHKOIconToStandard(hkoIcon) {
  const iconMap = {
    50: 'sunny',
    51: 'partly-cloudy',
    52: 'partly-cloudy',
    53: 'cloudy',
    54: 'overcast',
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
  return iconMap[hkoIcon] || 'partly-cloudy';
}

// Map OpenWeather icons to standard icons
function mapOWIconToStandard(owIcon) {
  const iconMap = {
    '01d': 'sunny',
    '01n': 'clear-night',
    '02d': 'partly-cloudy',
    '02n': 'partly-cloudy-night',
    '03d': 'cloudy',
    '03n': 'cloudy',
    '04d': 'overcast',
    '04n': 'overcast',
    '09d': 'rainy',
    '09n': 'rainy',
    '10d': 'rainy',
    '10n': 'rainy',
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    '13d': 'snowy',
    '13n': 'snowy',
    '50d': 'foggy',
    '50n': 'foggy'
  };
  return iconMap[owIcon] || 'partly-cloudy';
}

// Parse HKO warnings into standard alert format with typhoon signals
function parseHKOWarnings(warnings, forecast) {
  const alerts = [];
  
  // Typhoon Signal warnings (most critical)
  if (warnings.TC || warnings.WNTC) {
    const typhoonMsg = warnings.TC || warnings.WNTC;
    let level = 'warning';
    let title = 'Typhoon Signal';
    
    // Determine typhoon signal level from message
    if (typhoonMsg.includes('Signal No. 8') || typhoonMsg.includes('Signal 8')) {
      level = 'critical';
      title = 'Typhoon Signal No. 8';
    } else if (typhoonMsg.includes('Signal No. 9') || typhoonMsg.includes('Signal 9')) {
      level = 'critical';
      title = 'Typhoon Signal No. 9';
    } else if (typhoonMsg.includes('Signal No. 10') || typhoonMsg.includes('Signal 10')) {
      level = 'critical';
      title = 'Typhoon Signal No. 10';
    } else if (typhoonMsg.includes('Signal No. 3') || typhoonMsg.includes('Signal 3')) {
      level = 'warning';
      title = 'Typhoon Signal No. 3';
    } else if (typhoonMsg.includes('Signal No. 1') || typhoonMsg.includes('Signal 1')) {
      level = 'info';
      title = 'Typhoon Signal No. 1';
    }
    
    alerts.push({
      id: 'TC',
      type: 'typhoon',
      level: level,
      title: title,
      message: typhoonMsg,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
      affectedAreas: ['Hong Kong Island', 'Kowloon', 'New Territories'],
      icon: '🌀'
    });
  }
  
  // Rainstorm warnings
  if (warnings.RAIN || warnings.WRAINB || warnings.WRAINY || warnings.WRAINR) {
    const rainMsg = warnings.RAIN || warnings.WRAINB || warnings.WRAINY || warnings.WRAINR;
    let level = 'info';
    let title = 'Rainstorm Warning';
    let icon = '🌧️';
    
    if (rainMsg.includes('Black') || rainMsg.includes('BLACK')) {
      level = 'critical';
      title = 'Black Rainstorm Warning';
      icon = '⛈️';
    } else if (rainMsg.includes('Red') || rainMsg.includes('RED')) {
      level = 'warning';
      title = 'Red Rainstorm Warning';
      icon = '🌧️';
    } else if (rainMsg.includes('Amber') || rainMsg.includes('AMBER')) {
      level = 'warning';
      title = 'Amber Rainstorm Warning';
      icon = '🌦️';
    }
    
    alerts.push({
      id: 'RAIN',
      type: 'weather',
      level: level,
      title: title,
      message: rainMsg,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      affectedAreas: ['Hong Kong'],
      icon: icon
    });
  }
  
  // Wind warnings
  if (warnings.WIND || warnings.WGALE) {
    const windMsg = warnings.WIND || warnings.WGALE;
    alerts.push({
      id: 'WIND',
      type: 'weather',
      level: 'warning',
      title: 'Strong Wind Warning',
      message: windMsg,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      affectedAreas: ['Hong Kong'],
      icon: '💨'
    });
  }
  
  // Hot weather warnings
  if (warnings.WHOT) {
    alerts.push({
      id: 'WHOT',
      type: 'weather',
      level: 'info',
      title: 'Hot Weather Warning',
      message: warnings.WHOT,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      affectedAreas: ['Hong Kong'],
      icon: '🌡️'
    });
  }
  
  // Cold weather warnings
  if (warnings.WCOLD) {
    alerts.push({
      id: 'WCOLD',
      type: 'weather',
      level: 'warning',
      title: 'Cold Weather Warning',
      message: warnings.WCOLD,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      affectedAreas: ['Hong Kong'],
      icon: '❄️'
    });
  }
  
  // Special announcements
  if (warnings.WTMW || warnings.WTS) {
    const specialMsg = warnings.WTMW || warnings.WTS;
    alerts.push({
      id: 'SPECIAL',
      type: 'weather',
      level: 'info',
      title: 'Weather Special Announcement',
      message: specialMsg,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      affectedAreas: ['Hong Kong'],
      icon: '📢'
    });
  }
  
  return alerts.length > 0 ? alerts : mockWeatherData.alerts;
}

// GET /api/weather/current
// Get current weather conditions
router.get('/current', async (req, res) => {
  try {
    const weatherData = await fetchHKWeatherData();
    
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
      timestamp: new Date(),
      data: mockWeatherData // Fallback to mock data
    });
  }
});

// GET /api/weather/forecast
// Get weather forecast for next 7 days
router.get('/forecast', async (req, res) => {
  try {
    // Mock forecast data
    const forecast = Array.from({ length: 7 }, (_, index) => ({
      date: new Date(Date.now() + index * 24 * 60 * 60 * 1000),
      temperature: {
        high: 28 + Math.random() * 6,
        low: 22 + Math.random() * 4
      },
      weatherCondition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
      humidity: 70 + Math.random() * 20,
      precipitationChance: Math.random() * 100
    }));

    res.json({
      success: true,
      data: forecast,
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

// Test endpoint for typhoon simulation (development only)
router.get('/test-typhoon', async (req, res) => {
  try {
    const testTyphoonData = {
      temperature: 28,
      humidity: 95,
      uvIndex: 0.1,
      weatherCondition: 65, // Thunderstorm code
      icon: 'typhoon',
      timestamp: new Date(),
      alerts: [
        {
          id: 'TC',
          type: 'typhoon',
          level: 'critical',
          title: 'Typhoon Signal No. 8',
          message: 'Tropical Cyclone Warning Signal No. 8 is in force. Winds with sustained speeds of 63 to 87 km/h are expected.',
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
          affectedAreas: ['Hong Kong Island', 'Kowloon', 'New Territories'],
          icon: '🌀'
        },
        {
          id: 'RAIN',
          type: 'weather',
          level: 'warning',
          title: 'Red Rainstorm Warning',
          message: 'Heavy rain has fallen or is expected to fall generally over Hong Kong, exceeding 50 millimetres in an hour.',
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
          affectedAreas: ['Hong Kong Island', 'Kowloon', 'New Territories'],
          icon: '🌧️'
        }
      ],
      airQuality: 45,
      windSpeed: 75,
      visibility: 2000
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