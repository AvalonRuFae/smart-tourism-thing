/**
 * API Service - Centralized API communication layer
 * Professional service layer for handling all external API calls
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse,
  TouristAttraction, 
  RealTimeData, 
  UserPreferences,
  TripPlan,
  WeatherData,
  TrafficData,
  GovernmentAlert
} from '../types';

// API Configuration
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000') + '/api';
const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const TRAFFIC_API_KEY = process.env.REACT_APP_TRAFFIC_API_KEY;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 210000, // 3.5 minutes for comprehensive local AI processing
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Real-time Data Services
  async getRealTimeData(): Promise<RealTimeData> {
    try {
      const [weather, traffic, alerts] = await Promise.all([
        this.getWeatherData(),
        this.getTrafficData(),
        this.getGovernmentAlerts()
      ]);

      return {
        weather,
        traffic,
        alerts,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      throw error;
    }
  }

  async getWeatherData(): Promise<WeatherData> {
    try {
      // In production, this would call Hong Kong Observatory API
      const response = await this.api.get<ApiResponse<WeatherData>>('/weather/current');
      return response.data.data;
    } catch (error) {
      // Fallback to sample data for demo
      return {
        temperature: 27,
        humidity: 78,
        uvIndex: 6,
        airQuality: 85,
        weatherCondition: 'Partly Cloudy',
        icon: 'partly-cloudy',
        timestamp: new Date()
      };
    }
  }

  async getTrafficData(): Promise<TrafficData[]> {
    try {
      const response = await this.api.get<ApiResponse<TrafficData[]>>('/traffic/current');
      return response.data.data;
    } catch (error) {
      // Return sample traffic data for demo
      return [
        {
          routeId: 'central-tsim-sha-tsui',
          congestionLevel: 'medium',
          estimatedTime: 25,
          distance: 8.5,
          mode: 'public_transport'
        }
      ];
    }
  }

  async getGovernmentAlerts(): Promise<GovernmentAlert[]> {
    try {
      const response = await this.api.get<ApiResponse<GovernmentAlert[]>>('/alerts/current');
      return response.data.data;
    } catch (error) {
      // Return sample alerts for demo
      return [
        {
          id: '1',
          type: 'weather',
          level: 'warning',
          title: 'Hot Weather Warning',
          message: 'Very hot weather with maximum temperature reaching 33°C',
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          affectedAreas: ['Hong Kong Island', 'Kowloon', 'New Territories']
        }
      ];
    }
  }

  // Attraction Services
  async getAttractions(filters?: Partial<UserPreferences>): Promise<TouristAttraction[]> {
    try {
      const params = filters ? { filters: JSON.stringify(filters) } : {};
      const response = await this.api.get<ApiResponse<TouristAttraction[]>>('/attractions', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching attractions:', error);
      throw error;
    }
  }

  async searchAttractions(query: string): Promise<TouristAttraction[]> {
    try {
      const response = await this.api.get<ApiResponse<TouristAttraction[]>>('/attractions/search', {
        params: { q: query }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching attractions:', error);
      throw error;
    }
  }

  async getAttractionById(id: string): Promise<TouristAttraction> {
    try {
      const response = await this.api.get<ApiResponse<TouristAttraction>>(`/attractions/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching attraction:', error);
      throw error;
    }
  }

  // Local AI Services
  async analyzeUserText(text: string): Promise<UserPreferences> {
    try {
      console.log('🚀 Sending text to local AI:', text.substring(0, 50) + '...');
      console.log('🔗 API URL:', `${this.api.defaults.baseURL}/local-ai/analyze-text`);
      
      const response = await this.api.post<ApiResponse<any>>('/local-ai/analyze-text', {
        text
      });
      
      console.log('✅ Local AI response received:', response.data);
      return response.data.data.extractedPreferences;
    } catch (error: any) {
      console.error('❌ Error analyzing user text with local AI:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  }

  async getRecommendations(preferences: UserPreferences): Promise<TouristAttraction[]> {
    try {
      const response = await this.api.post<ApiResponse<any>>('/local-ai/recommendations', {
        preferences
      });
      return response.data.data.recommendations;
    } catch (error) {
      console.error('Error getting recommendations from local AI:', error);
      throw error;
    }
  }

  // Trip Planning Services (using Local AI)
  async createTripPlan(preferences: UserPreferences): Promise<TripPlan> {
    try {
      const response = await this.api.post<ApiResponse<any>>('/local-ai/trip-plan', {
        preferences
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating trip plan with local AI:', error);
      throw error;
    }
  }

  async generateTripPlan(preferences: UserPreferences, attractions: TouristAttraction[]): Promise<any> {
    try {
      const response = await this.api.post<ApiResponse<any>>('/local-ai/trip-plan', {
        preferences,
        attractions
      });
      return response.data.data;
    } catch (error) {
      console.error('Error generating trip plan with local AI:', error);
      throw error;
    }
  }

  // Direct Trip Planning - Single AI call from text to complete plan
  async generateDirectTripPlan(userText: string, attractions?: TouristAttraction[], realTimeData?: any): Promise<any> {
    try {
      console.log('🚀 Calling direct trip plan API with text:', userText.substring(0, 50) + '...');
      console.log('🌤️ Including real-time context:', {
        weather: realTimeData?.weather?.weatherCondition,
        temperature: realTimeData?.weather?.temperature,
        alerts: realTimeData?.alerts?.length || 0
      });
      
      const response = await this.api.post<ApiResponse<any>>('/local-ai/direct-plan', {
        text: userText,
        attractions,
        realTimeData: realTimeData
      }, {
        timeout: 200000 // 3.3 minutes for direct trip planning (longer than backend to avoid frontend timeout)
      });
      
      console.log('✅ Direct trip plan response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error generating direct trip plan:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }

  async getTripPlan(id: string): Promise<TripPlan> {
    try {
      const response = await this.api.get<ApiResponse<TripPlan>>(`/trips/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching trip plan:', error);
      throw error;
    }
  }

  async updateTripPlan(id: string, updates: Partial<TripPlan>): Promise<TripPlan> {
    try {
      const response = await this.api.put<ApiResponse<TripPlan>>(`/trips/${id}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Error updating trip plan:', error);
      throw error;
    }
  }

  // Route and Navigation Services
  async getRoute(from: { lat: number; lng: number }, to: { lat: number; lng: number }, mode: string): Promise<any> {
    try {
      const response = await this.api.post<ApiResponse<any>>('/routes/calculate', {
        from,
        to,
        mode
      });
      return response.data.data;
    } catch (error) {
      console.error('Error calculating route:', error);
      throw error;
    }
  }

  // Utility method for handling errors
  private handleApiError(error: any): never {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.message || 'Server error');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error(error.message || 'Unknown error');
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;