/**
 * Utility Functions - Common helper functions for the application
 * Professional utility functions for data formatting, validation, etc.
 */

import { format, isValid, parseISO } from 'date-fns';
import { TouristAttraction, UserPreferences, AttractionCategory, PriceRange } from '../types';

// Date and Time Utilities
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, 'MMM dd, yyyy') : 'Invalid date';
};

export const formatTime = (date: Date | string, format24h: boolean = true): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid time';
  
  return format24h 
    ? format(dateObj, 'HH:mm')
    : format(dateObj, 'h:mm a');
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, 'MMM dd, yyyy HH:mm') : 'Invalid date';
};

export const getTimeAgo = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

// Price and Currency Utilities
export const formatPrice = (price: number, currency: string = 'HKD'): string => {
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatPriceRange = (priceRange: PriceRange): string => {
  const ranges = {
    [PriceRange.FREE]: 'Free',
    [PriceRange.LOW]: 'HK$0-50',
    [PriceRange.MEDIUM]: 'HK$50-200',
    [PriceRange.HIGH]: 'HK$200-500',
    [PriceRange.LUXURY]: 'HK$500+'
  };
  return ranges[priceRange] || 'N/A';
};

export const getPriceRangeColor = (priceRange: PriceRange): string => {
  const colors = {
    [PriceRange.FREE]: '#4CAF50',      // Green
    [PriceRange.LOW]: '#8BC34A',       // Light Green
    [PriceRange.MEDIUM]: '#FF9800',    // Orange
    [PriceRange.HIGH]: '#FF5722',      // Deep Orange
    [PriceRange.LUXURY]: '#9C27B0'     // Purple
  };
  return colors[priceRange] || '#757575';
};

// Distance and Location Utilities
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// Travel Time Utilities
export const formatTravelTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

export const estimateTravelTime = (distance: number, mode: string): number => {
  const speeds = {
    walking: 5,           // km/h
    cycling: 15,          // km/h
    driving: 30,          // km/h (city traffic)
    public_transport: 25  // km/h (average)
  };
  
  const speed = speeds[mode as keyof typeof speeds] || speeds.walking;
  return Math.ceil((distance / speed) * 60); // Convert to minutes
};

// Rating and Review Utilities
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return '#4CAF50';      // Excellent - Green
  if (rating >= 4.0) return '#8BC34A';      // Very Good - Light Green
  if (rating >= 3.5) return '#FFC107';      // Good - Amber
  if (rating >= 3.0) return '#FF9800';      // Average - Orange
  return '#F44336';                         // Poor - Red
};

export const getRatingStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '☆';
  
  const emptyStars = 5 - Math.ceil(rating);
  stars += '☆'.repeat(Math.max(0, emptyStars));
  
  return stars;
};

// Category Utilities
export const getCategoryDisplayName = (category: AttractionCategory): string => {
  const names = {
    [AttractionCategory.CULTURAL]: '文化 Cultural',
    [AttractionCategory.NATURE]: '自然 Nature',
    [AttractionCategory.ENTERTAINMENT]: '娛樂 Entertainment',
    [AttractionCategory.SHOPPING]: '購物 Shopping',
    [AttractionCategory.FOOD]: '美食 Food',
    [AttractionCategory.HISTORICAL]: '歷史 Historical',
    [AttractionCategory.ADVENTURE]: '冒險 Adventure',
    [AttractionCategory.RELIGIOUS]: '宗教 Religious',
    [AttractionCategory.MUSEUM]: '博物館 Museum',
    [AttractionCategory.NIGHTLIFE]: '夜生活 Nightlife'
  };
  return names[category] || category;
};

export const getCategoryColor = (category: AttractionCategory): string => {
  const colors = {
    [AttractionCategory.CULTURAL]: '#2196F3',      // Blue
    [AttractionCategory.NATURE]: '#4CAF50',        // Green
    [AttractionCategory.ENTERTAINMENT]: '#E91E63', // Pink
    [AttractionCategory.SHOPPING]: '#9C27B0',      // Purple
    [AttractionCategory.FOOD]: '#FF9800',          // Orange
    [AttractionCategory.HISTORICAL]: '#795548',    // Brown
    [AttractionCategory.ADVENTURE]: '#FF5722',     // Deep Orange
    [AttractionCategory.RELIGIOUS]: '#607D8B',     // Blue Grey
    [AttractionCategory.MUSEUM]: '#3F51B5',        // Indigo
    [AttractionCategory.NIGHTLIFE]: '#673AB7'      // Deep Purple
  };
  return colors[category] || '#757575';
};

// Filtering and Sorting Utilities
export const filterAttractionsByPreferences = (
  attractions: TouristAttraction[],
  preferences: UserPreferences
): TouristAttraction[] => {
  return attractions.filter(attraction => {
    // Filter by preferred activities
    if (preferences.preferredActivities.length > 0) {
      if (!preferences.preferredActivities.includes(attraction.category)) {
        return false;
      }
    }
    
    // Filter by budget (simplified price range check)
    const priceRangeValues = {
      [PriceRange.FREE]: 0,
      [PriceRange.LOW]: 25,
      [PriceRange.MEDIUM]: 125,
      [PriceRange.HIGH]: 350,
      [PriceRange.LUXURY]: 750
    };
    
    const attractionPrice = priceRangeValues[attraction.priceRange as PriceRange] || 0;
    if (attractionPrice > preferences.budget) {
      return false;
    }
    
    // Filter by accessibility needs
    if (preferences.accessibilityNeeds && !attraction.accessibility.wheelchairAccessible) {
      return false;
    }
    
    return true;
  });
};

export const sortAttractionsByRelevance = (
  attractions: TouristAttraction[],
  preferences: UserPreferences
): TouristAttraction[] => {
  return [...attractions].sort((a, b) => {
    // Higher rating first
    if (a.rating !== b.rating) {
      return b.rating - a.rating;
    }
    
    // Preferred categories first
    const aIsPreferred = preferences.preferredActivities.includes(a.category);
    const bIsPreferred = preferences.preferredActivities.includes(b.category);
    
    if (aIsPreferred && !bIsPreferred) return -1;
    if (!aIsPreferred && bIsPreferred) return 1;
    
    // Shorter visit time for families with children
    if (preferences.hasChildern) {
      return a.estimatedVisitTime - b.estimatedVisitTime;
    }
    
    return 0;
  });
};

// Validation Utilities
export const validateUserPreferences = (preferences: UserPreferences): string[] => {
  const errors: string[] = [];
  
  if (preferences.budget < 0) {
    errors.push('Budget must be a positive number');
  }
  
  if (preferences.groupSize < 1 || preferences.groupSize > 50) {
    errors.push('Group size must be between 1 and 50');
  }
  
  if (preferences.maxTravelTime < 15 || preferences.maxTravelTime > 480) {
    errors.push('Travel time must be between 15 minutes and 8 hours');
  }
  
  return errors;
};

// URL and Sharing Utilities
export const generateShareUrl = (tripPlanId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/trip/${tripPlanId}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Local Storage Utilities
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};