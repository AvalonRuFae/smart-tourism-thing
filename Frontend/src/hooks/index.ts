/**
 * Custom React Hooks - Reusable business logic hooks
 * Professional custom hooks for tourism app functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services';
import { 
  RealTimeData, 
  TouristAttraction, 
  UserPreferences, 
  TripPlan,
  WeatherData,
  GovernmentAlert
} from '../types';
import { debounce } from '../utils';

// Real-time Data Hook
export const useRealTimeData = (refreshInterval: number = 30000) => {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const realTimeData = await apiService.getRealTimeData();
      setData(realTimeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};

// Attractions Hook
export const useAttractions = () => {
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttractions = useCallback(async (filters?: Partial<UserPreferences>) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getAttractions(filters);
      setAttractions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attractions');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchAttractions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setAttractions([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.searchAttractions(query);
      setAttractions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search attractions');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    attractions,
    loading,
    error,
    fetchAttractions,
    searchAttractions,
    clearAttractions: () => setAttractions([])
  };
};

// Text Analysis Hook
export const useTextAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UserPreferences | null>(null);

  const analyzeText = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const preferences = await apiService.analyzeUserText(text);
      setResult(preferences);
      return preferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze text');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    result,
    analyzeText,
    clearResult: () => setResult(null)
  };
};

// Trip Planning Hook
export const useTripPlanning = () => {
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTripPlan = useCallback(async (preferences: UserPreferences) => {
    setLoading(true);
    setError(null);
    
    try {
      const plan = await apiService.createTripPlan(preferences);
      setTripPlan(plan);
      return plan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTripPlan = useCallback(async (id: string, updates: Partial<TripPlan>) => {
    if (!tripPlan) return;

    setLoading(true);
    setError(null);
    
    try {
      const updatedPlan = await apiService.updateTripPlan(id, updates);
      setTripPlan(updatedPlan);
      return updatedPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trip plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tripPlan]);

  const loadTripPlan = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const plan = await apiService.getTripPlan(id);
      setTripPlan(plan);
      return plan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trip plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tripPlan,
    loading,
    error,
    createTripPlan,
    updateTripPlan,
    loadTripPlan,
    clearTripPlan: () => setTripPlan(null)
  };
};

// Local Storage Hook
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};

// Debounced Search Hook
export const useDebouncedSearch = <T>(
  searchFunction: (query: string) => Promise<T[]>,
  delay: number = 300
) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const searchResults = await searchFunction(searchQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay),
    [searchFunction, delay]
  );

  useEffect(() => {
    setLoading(true);
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => {
      setResults([]);
      setQuery('');
    }
  };
};

// Geolocation Hook
export const useGeolocation = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = 'Failed to get location';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    clearLocation: () => setLocation(null)
  };
};

// Window Resize Hook
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Online Status Hook
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Previous Value Hook
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};