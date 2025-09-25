/**
 * GoogleMapView Component - Google Maps integration for Hong Kong tourism
 * Features: Real-time traffic, transit directions, place details, route planning
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Loader } from '@googlemaps/js-api-loader';
import { 
  LocationIcon,
  StarIcon,
  ClockIcon,
  MoneyIcon,
  TrafficIcon,
  InfoOutlineIcon,
  RestaurantIcon,
  MuseumIcon,
  ShoppingIcon,
  NatureIcon
} from '../common/Icons';
import { theme } from '../../styles/theme';
import { 
  TouristAttraction, 
  AttractionCategory, 
  UserPreferences
} from '../../types';
import { Card, Button, Flex } from '../../styles/theme';

// Styled Components
const MapContainer = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  background: ${theme.colors.background};
`;

const GoogleMapContainer = styled.div`
  flex: 1;
  height: 100%;
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
`;

const AttractionsPanel = styled(Card)`
  width: 350px;
  margin-left: ${theme.spacing.md};
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.surfaceDark};
  background: ${theme.colors.surface};
  
  h3 {
    margin: 0 0 ${theme.spacing.md} 0;
    color: ${theme.colors.textPrimary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const ControlsRow = styled(Flex)`
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const ToggleButton = styled(Button)<{ active?: boolean }>`
  background: ${props => props.active ? theme.colors.primary : theme.colors.surface};
  color: ${props => props.active ? 'white' : theme.colors.textSecondary};
  border: 1px solid ${props => props.active ? theme.colors.primary : theme.colors.surfaceDark};
  font-size: 0.875rem;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  
  &:hover {
    background: ${props => props.active ? theme.colors.primaryDark : theme.colors.surface};
  }
`;

const AttractionsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.md};
`;

const AttractionCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.surfaceDark};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.sm};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const AttractionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
`;

const AttractionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
  flex-shrink: 0;
`;

const AttractionInfo = styled.div`
  flex: 1;
`;

const AttractionName = styled.h4`
  margin: 0 0 ${theme.spacing.xs} 0;
  color: ${theme.colors.textPrimary};
  font-size: 1rem;
  font-weight: 600;
`;

const AttractionMeta = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  font-size: 0.875rem;
  color: ${theme.colors.textSecondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const AttractionDescription = styled.p`
  margin: 0;
  color: ${theme.colors.textSecondary};
  font-size: 0.875rem;
  line-height: 1.4;
`;

const TransitInfo = styled.div`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.sm};
  font-size: 0.875rem;
`;

const TransitStep = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TransitIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  
  &.bus { background: #FF6B35; }
  &.mtr { background: #E31E24; }
  &.walk { background: #4CAF50; }
`;

// Props interface
interface GoogleMapViewProps {
  attractions: TouristAttraction[];
  onAttractionSelect?: (attraction: TouristAttraction) => void;
  userPreferences?: UserPreferences;
  selectedAttraction?: any;
  className?: string;
}

// Hong Kong center coordinates
const HK_CENTER = { lat: 22.3193, lng: 114.1694 };

// Sample Hong Kong attractions for demo
const SAMPLE_HK_ATTRACTIONS = [
  {
    id: '1',
    name: 'The Peak',
    description: 'Iconic mountain offering panoramic views of Hong Kong skyline',
    location: { lat: 22.2705, lng: 114.1505 }, // Corrected coordinates for The Peak
    rating: 4.8,
    highlights: ['Sky Terrace 428', 'Peak Tram', 'Stunning city views']
  },
  {
    id: '2',
    name: 'Tsim Sha Tsui Promenade',
    description: 'Waterfront promenade with stunning harbor views and cultural attractions',
    location: { lat: 22.2952, lng: 114.1722 },
    rating: 4.6,
    highlights: ['Symphony of Lights', 'Clock Tower', 'Harbor views']
  },
  {
    id: '3',
    name: 'Central District',
    description: 'Hong Kong\'s main business district with shopping and dining',
    location: { lat: 22.2855, lng: 114.1577 },
    rating: 4.5,
    highlights: ['IFC Mall', 'Star Ferry', 'Business hub']
  },
  {
    id: '4',
    name: 'Ocean Park',
    description: 'Marine life theme park with thrilling rides and animal exhibits',
    location: { lat: 22.2461, lng: 114.1628 },
    rating: 4.7,
    highlights: ['Pandas', 'Ocean Theatre', 'Cable car']
  }
];

const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  attractions,
  onAttractionSelect,
  userPreferences,
  selectedAttraction,
  className
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const transitLayerRef = useRef<google.maps.TransitLayer | null>(null);
  
  const [showTraffic, setShowTraffic] = useState(false);
  const [showTransit, setShowTransit] = useState(true);
  const [internalSelectedAttraction, setInternalSelectedAttraction] = useState<TouristAttraction | null>(null);
  const [transitDirections, setTransitDirections] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Google Maps
  const initializeMap = useCallback(async () => {
    try {
      const loader = new Loader({
        apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      await loader.load();
      
      if (!mapRef.current) return;

      // Create map instance
      const map = new google.maps.Map(mapRef.current, {
        center: HK_CENTER,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ],
        // Remove UI controls for cleaner map view
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true, // Keep zoom control for usability
        scaleControl: false,
        rotateControl: false,
        panControl: false
      });

      mapInstanceRef.current = map;

      // Initialize services
      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: theme.colors.primary,
          strokeWeight: 4
        }
      });
      directionsRendererRef.current.setMap(map);

      // Initialize layers
      trafficLayerRef.current = new google.maps.TrafficLayer();
      transitLayerRef.current = new google.maps.TransitLayer();

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setIsLoading(false);
    }
  }, []);

  // Add markers for attractions with numbered labels
  const addMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    attractions.forEach((attraction, index) => {
      // Check if this attraction is selected
      const isSelected = selectedAttraction?.id === attraction.id;
      
      // Create numbered marker with selection-based styling
      const marker = new google.maps.Marker({
        position: { lat: attraction.location.lat, lng: attraction.location.lng },
        map: mapInstanceRef.current,
        title: `${index + 1}. ${attraction.name}`,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 20 : 15, // Larger when selected
          fillColor: isSelected ? theme.colors.primary : getCategoryColor(attraction.category),
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: isSelected ? 4 : 3, // Thicker stroke when selected
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        try {
          console.log('🎯 Marker clicked for attraction:', attraction.name);
          handleAttractionClick(attraction);
        } catch (error) {
          console.error('Error handling marker click:', error);
        }
      });

      markersRef.current.push(marker);
    });
  }, [attractions, selectedAttraction]);

  // Handle attraction click
  const handleAttractionClick = useCallback(async (attraction: TouristAttraction) => {
    try {
      console.log('🎯 Pin clicked for:', attraction.name);
      setInternalSelectedAttraction(attraction);
      
      // Only call onAttractionSelect if it's different from current selection
      if (attraction.id !== internalSelectedAttraction?.id) {
        onAttractionSelect?.(attraction);
      }

      // Zoom to the clicked attraction
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter({
          lat: attraction.location.lat,
          lng: attraction.location.lng
        });
        mapInstanceRef.current.setZoom(16); // Closer zoom for better detail
      }

      // Get transit directions from HK center to attraction
      if (directionsServiceRef.current && userPreferences) {
        const request: google.maps.DirectionsRequest = {
          origin: HK_CENTER,
          destination: { lat: attraction.location.lat, lng: attraction.location.lng },
          travelMode: google.maps.TravelMode.TRANSIT,
          transitOptions: {
            modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.SUBWAY],
            routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
          },
          unitSystem: google.maps.UnitSystem.METRIC
        };

        directionsServiceRef.current.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current?.setDirections(result);
            setTransitDirections(result);
          } else {
            console.warn('Directions request failed:', status);
          }
        });
      }
    } catch (error) {
      console.error('Error in handleAttractionClick:', error);
    }
  }, [onAttractionSelect, userPreferences, internalSelectedAttraction]);

  // Toggle traffic layer
  const toggleTraffic = useCallback(() => {
    if (!trafficLayerRef.current || !mapInstanceRef.current) return;
    
    if (showTraffic) {
      trafficLayerRef.current.setMap(null);
    } else {
      trafficLayerRef.current.setMap(mapInstanceRef.current);
    }
    setShowTraffic(!showTraffic);
  }, [showTraffic]);

  // Toggle transit layer
  const toggleTransit = useCallback(() => {
    if (!transitLayerRef.current || !mapInstanceRef.current) return;
    
    if (showTransit) {
      transitLayerRef.current.setMap(null);
    } else {
      transitLayerRef.current.setMap(mapInstanceRef.current);
    }
    setShowTransit(!showTransit);
  }, [showTransit]);

  // Get category icon
  const getCategoryIcon = (category: AttractionCategory) => {
    switch (category) {
      case AttractionCategory.FOOD:
        return <RestaurantIcon />;
      case AttractionCategory.MUSEUM:
      case AttractionCategory.CULTURAL:
        return <MuseumIcon />;
      case AttractionCategory.SHOPPING:
        return <ShoppingIcon />;
      case AttractionCategory.NATURE:
        return <NatureIcon />;
      default:
        return <LocationIcon />;
    }
  };

  // Get category color
  const getCategoryColor = (category: AttractionCategory): string => {
    switch (category) {
      case AttractionCategory.FOOD:
        return '#FF6B35';
      case AttractionCategory.MUSEUM:
      case AttractionCategory.CULTURAL:
        return '#8E44AD';
      case AttractionCategory.SHOPPING:
        return '#E91E63';
      case AttractionCategory.NATURE:
        return '#4CAF50';
      default:
        return theme.colors.primary;
    }
  };

  // Format price range
  const formatPriceRange = (priceRange: string) => {
    const ranges: { [key: string]: string } = {
      'free': 'Free',
      'low': 'HK$0-100',
      'medium': 'HK$100-300',
      'high': 'HK$300+'
    };
    return ranges[priceRange] || priceRange;
  };

  // Format transit directions
  const formatTransitStep = (step: any) => {
    if (step.travel_mode === 'WALKING') {
      return {
        mode: 'walk',
        text: `Walk ${step.distance?.text || ''}`
      };
    } else if (step.travel_mode === 'TRANSIT') {
      const transitDetails = step.transit;
      const line = transitDetails?.line;
      const vehicle = line?.vehicle;
      
      let mode = 'bus';
      let routeName = line?.short_name || line?.name || '';
      
      if (vehicle?.type === 'SUBWAY' || vehicle?.type === 'HEAVY_RAIL') {
        mode = 'mtr';
      }
      
      return {
        mode,
        text: `${routeName} to ${transitDetails?.arrival_stop?.name || ''}`,
        duration: step.duration?.text || ''
      };
    }
    
    return { mode: 'walk', text: step.instructions || '' };
  };

  // Dynamic route optimization function for multiple locations
  const optimizeMultiLocationRoute = useCallback(async (locations: Array<{lat: number, lng: number, name: string}>) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current || locations.length < 2) return;

    try {
      const origin = locations[0];
      const destination = locations[locations.length - 1];
      const waypoints = locations.slice(1, -1).map(loc => ({
        location: { lat: loc.lat, lng: loc.lng },
        stopover: true
      }));

      const request: google.maps.DirectionsRequest = {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        waypoints: waypoints,
        optimizeWaypoints: true, // Google will optimize the route order
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
          modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.SUBWAY, google.maps.TransitMode.TRAIN],
          routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
        },
        unitSystem: google.maps.UnitSystem.METRIC,
        region: 'HK'
      };

      directionsServiceRef.current.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current?.setDirections(result);
          
          // Log the optimized order
          const optimizedOrder = result.routes[0].waypoint_order;
          console.log('Optimized route order:', optimizedOrder);
          console.log('Total distance:', result.routes[0].legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0) / 1000, 'km');
          console.log('Total duration:', result.routes[0].legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0) / 60, 'minutes');
        } else {
          console.error('Directions request failed due to', status);
        }
      });
    } catch (error) {
      console.error('Error optimizing route:', error);
    }
  }, []);

  // Demo function to show route between random attractions
  const showDemoRoute = useCallback(async () => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) return;

    // Use dynamic locations from attractions prop or sample data
    const locationsToRoute = attractions.length > 0 ? 
      attractions.slice(0, Math.min(4, attractions.length)).map(attr => ({
        lat: attr.location.lat,
        lng: attr.location.lng,
        name: attr.name
      })) :
      SAMPLE_HK_ATTRACTIONS.slice(0, 4).map(attr => ({
        lat: attr.location.lat,
        lng: attr.location.lng,
        name: attr.name
      }));

    // Use the dynamic multi-location route optimizer
    optimizeMultiLocationRoute(locationsToRoute);
  }, [attractions, optimizeMultiLocationRoute]);

  // Legacy demo function for simple two-point route
  const showSimpleDemoRoute = useCallback(async () => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) return;

    // Pick two locations from current attractions or sample
    const origin = attractions.length > 0 ? attractions[0] : SAMPLE_HK_ATTRACTIONS[0]; // The Peak
    const destination = attractions.length > 0 ? attractions[Math.min(3, attractions.length - 1)] : SAMPLE_HK_ATTRACTIONS[3]; // Ocean Park

    try {
      const request: google.maps.DirectionsRequest = {
        origin: { lat: origin.location.lat, lng: origin.location.lng },
        destination: { lat: destination.location.lat, lng: destination.location.lng },
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
          modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.SUBWAY, google.maps.TransitMode.TRAIN],
          routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
        },
        unitSystem: google.maps.UnitSystem.METRIC,
        region: 'HK'
      };

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsServiceRef.current!.route(request, (result, status) => {
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      directionsRendererRef.current.setDirections(result);
      setTransitDirections(result);
      
      console.log('Demo route from', origin.name, 'to', destination.name);
    } catch (error) {
      console.error('Error showing demo route:', error);
    }
  }, []);

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Update markers when attractions or selection changes
  useEffect(() => {
    if (!isLoading && mapInstanceRef.current) {
      addMarkers();
    }
  }, [attractions, selectedAttraction, isLoading, addMarkers]);

  // Handle external attraction selection (from HomePage)
  useEffect(() => {
    if (selectedAttraction && mapInstanceRef.current) {
      // Find the marker for this attraction and highlight it
      const attraction = attractions.find(a => a.id === selectedAttraction.id);
      if (attraction && attraction.id !== internalSelectedAttraction?.id) {
        // Center map on selected attraction
        mapInstanceRef.current.setCenter({
          lat: attraction.location.lat,
          lng: attraction.location.lng
        });
        mapInstanceRef.current.setZoom(16); // Consistent zoom level
        
        // Update internal state and show directions without triggering onAttractionSelect
        setInternalSelectedAttraction(attraction);
        
        // Get transit directions without calling the full handleAttractionClick
        if (directionsServiceRef.current && userPreferences) {
          try {
            const request: google.maps.DirectionsRequest = {
              origin: HK_CENTER,
              destination: { lat: attraction.location.lat, lng: attraction.location.lng },
              travelMode: google.maps.TravelMode.TRANSIT,
              transitOptions: {
                modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.SUBWAY],
                routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
              },
              unitSystem: google.maps.UnitSystem.METRIC
            };

            directionsServiceRef.current.route(request, (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                directionsRendererRef.current?.setDirections(result);
                setTransitDirections(result);
              }
            });
          } catch (error) {
            console.error('Error getting transit directions:', error);
          }
        }
      }
    }
  }, [selectedAttraction, attractions, userPreferences, internalSelectedAttraction]);

  // Auto-show demo route after map loads
  useEffect(() => {
    if (!isLoading && mapInstanceRef.current) {
      setTimeout(() => {
        showDemoRoute();
      }, 2000); // Show demo route after 2 seconds
    }
  }, [isLoading, showDemoRoute]);

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '500px' }}>
      <GoogleMapContainer ref={mapRef} />
      
      {/* Traffic and Transit Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        gap: '8px'
      }}>
        <button
          style={{
            background: showTraffic ? '#D32F2F' : 'white',
            color: showTraffic ? 'white' : '#D32F2F',
            border: '2px solid #D32F2F',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
          onClick={toggleTraffic}
        >
          🚗 Traffic
        </button>
        <button
          style={{
            background: showTransit ? '#D32F2F' : 'white',
            color: showTransit ? 'white' : '#D32F2F',
            border: '2px solid #D32F2F',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
          onClick={toggleTransit}
        >
          🚇 Transit
        </button>
      </div>
    </div>
  );
};

export default GoogleMapView;