/**
 * Core TypeScript type definitions for Hong Kong Tourism App
 * Professional-grade type safety for tourism planning application
 */

// Weather and Environmental Data Types
export interface WeatherData {
  temperature: number;
  humidity: number;
  uvIndex: number;
  airQuality: number;
  weatherCondition: string;
  icon: string;
  timestamp: Date;
}

// Traffic and Transportation Types
export interface TrafficData {
  routeId: string;
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  estimatedTime: number;
  distance: number;
  mode: 'walking' | 'driving' | 'public_transport' | 'cycling';
}

// Location and Place Types
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface TouristAttraction {
  id: string;
  name: string;
  description: string;
  location: Location;
  category: AttractionCategory;
  priceRange: PriceRange;
  rating: number;
  imageUrl: string;
  tags: string[];
  openingHours: OpeningHours;
  estimatedVisitTime: number; // in minutes
  accessibility: AccessibilityInfo;
}

export interface OpeningHours {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday: TimeSlot;
  sunday: TimeSlot;
}

export interface TimeSlot {
  open: string; // "09:00"
  close: string; // "18:00"
  isClosed: boolean;
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  hasElevator: boolean;
  hasRestrooms: boolean;
  audioGuide: boolean;
}

// User Input and Preferences Types
export interface UserPreferences {
  budget: number;
  maxTravelTime: number; // in minutes
  preferredActivities: AttractionCategory[];
  groupSize: number;
  hasChildern: boolean;
  accessibilityNeeds: boolean;
  transportMode: 'walking' | 'driving' | 'public_transport' | 'mixed';
}

export interface TripPlan {
  id: string;
  userId?: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  estimatedCost: number;
  itinerary: DayItinerary[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DayItinerary {
  date: Date;
  attractions: PlannedAttraction[];
  totalTime: number;
  totalCost: number;
  transportRoutes: TransportRoute[];
}

export interface PlannedAttraction {
  attraction: TouristAttraction;
  plannedStartTime: Date;
  plannedEndTime: Date;
  estimatedCost: number;
  priority: number;
}

export interface TransportRoute {
  from: Location;
  to: Location;
  mode: 'walking' | 'driving' | 'public_transport' | 'cycling';
  estimatedTime: number;
  estimatedCost: number;
  instructions: string[];
}

// Government and Alert Types
export interface GovernmentAlert {
  id: string;
  type: 'weather' | 'traffic' | 'health' | 'security' | 'general' | 'typhoon';
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  issuedAt: Date;
  expiresAt?: Date;
  affectedAreas: string[];
  icon?: string; // Optional emoji/icon for display
}

// Enum Types
export enum AttractionCategory {
  CULTURAL = 'cultural',
  NATURE = 'nature',
  ENTERTAINMENT = 'entertainment',
  SHOPPING = 'shopping',
  FOOD = 'food',
  HISTORICAL = 'historical',
  ADVENTURE = 'adventure',
  RELIGIOUS = 'religious',
  MUSEUM = 'museum',
  NIGHTLIFE = 'nightlife'
}

export enum PriceRange {
  FREE = 'free',
  LOW = 'low',        // Under HK$50
  MEDIUM = 'medium',  // HK$50-200
  HIGH = 'high',      // HK$200-500
  LUXURY = 'luxury'   // Over HK$500
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Real-time Data Types
export interface RealTimeData {
  weather: WeatherData;
  traffic: TrafficData[];
  alerts: GovernmentAlert[];
  timestamp: Date;
}

// Component Props Types
export interface HeaderProps {
  realTimeData: RealTimeData;
}

export interface MapProps {
  attractions: TouristAttraction[];
  selectedAttraction?: TouristAttraction;
  onAttractionSelect: (attraction: TouristAttraction) => void;
  tripPlan?: TripPlan;
  showTraffic?: boolean;
}

export interface UserInputProps {
  onPreferencesSubmit: (preferences: UserPreferences) => void;
  onTextAnalysis: (text: string) => void;
  onTripPlan?: (preferences: UserPreferences) => void;
  isLoading?: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}