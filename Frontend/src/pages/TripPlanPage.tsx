/**
 * Trip Plan Page - Dynamic route planning with Google Maps API
 * Features real-time route calculation, transit information, and interactive map
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Loader } from '@googlemaps/js-api-loader';
import { theme } from '../styles/theme';
import { Button } from '../styles/theme';
import tripPlanConfig from '../config/trip-plan.json';

// Types
interface Attraction {
  name: string;
  type: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timing: {
    startTime: string;
    duration: number;
    bestVisitTime: string;
  };
  transport: {
    fromPrevious: string;
    method: string;
    duration: number;
    cost: string;
    instructions: string;
  };
  highlights: string[];
  description: string;
  tips: string[];
  cost: string;
  difficulty: string;
}

interface RouteInfo {
  duration: string;
  distance: string;
  steps: google.maps.DirectionsStep[];
  transitDetails?: google.maps.TransitDetails;
  travelMode: google.maps.TravelMode;
  cost?: string;
}

interface DynamicTransportInfo {
  duration: string;
  distance: string;
  method: string;
  cost: string;
  instructions: string;
  steps: Array<{
    instructions: string;
    distance?: string;
    duration?: string;
    travelMode: string;
  }>;
}

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: ${theme.spacing.lg};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};
`;

const BackButton = styled.button`
  background: transparent;
  border: 2px solid ${theme.colors.primary};
  color: ${theme.colors.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  &:hover {
    background: ${theme.colors.primary};
    color: white;
  }
`;

const TitleSection = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  color: ${theme.colors.textPrimary};
  font-size: 2.5rem;
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const Subtitle = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: 1.2rem;
  margin: 0;
`;

const AttractionSelector = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xl};
  overflow-x: auto;
  padding: ${theme.spacing.sm} 0;
  justify-content: center;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.surfaceDark};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary};
    border-radius: 3px;
  }
`;

const AttractionTab = styled.button<{ isActive: boolean }>`
  background: ${props => props.isActive ? theme.colors.primary : theme.colors.surface};
  color: ${props => props.isActive ? 'white' : theme.colors.textPrimary};
  border: 2px solid ${props => props.isActive ? theme.colors.primary : theme.colors.textLight};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${theme.typography.fontWeight.semibold};
  white-space: nowrap;
  min-width: 160px;
  font-size: 0.95rem;
  
  &:hover {
    background: ${props => props.isActive ? theme.colors.primaryDark : theme.colors.surfaceDark};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;



const TripMapContainer = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.md};
  height: 500px;
  margin-bottom: ${theme.spacing.xl};
`;

const AttractionSlider = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
  margin-bottom: ${theme.spacing.lg};
`;

const SliderHeader = styled.div`
  background: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SliderTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: ${theme.typography.fontWeight.bold};
`;

const AttractionBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: 0.9rem;
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const SliderContent = styled.div`
  padding: ${theme.spacing.lg};
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.surfaceDark};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary};
    border-radius: 4px;
  }
`;

const QuickInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
`;

const TransportCard = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  border-left: 4px solid ${theme.colors.secondary};
`;

const TransportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
`;

const RouteOverview = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md};
`;

const AttractionName = styled.h2`
  color: ${theme.colors.textPrimary};
  font-size: 1.8rem;
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const AttractionType = styled.span`
  background: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: 0.9rem;
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing.md};
  display: inline-block;
`;

const Description = styled.p`
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  margin: ${theme.spacing.md} 0;
  font-size: 1.1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.lg} 0;
`;

const InfoItem = styled.div`
  background: ${theme.colors.background};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  text-align: center;
`;

const InfoLabel = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 0.85rem;
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing.xs};
`;

const InfoValue = styled.div`
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: 1rem;
`;

const Section = styled.div`
  margin: ${theme.spacing.lg} 0;
`;

const SectionTitle = styled.h3`
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0 0 ${theme.spacing.md} 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const HighlightsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const HighlightItem = styled.li`
  color: ${theme.colors.textSecondary};
  padding: ${theme.spacing.xs} 0;
  position: relative;
  padding-left: ${theme.spacing.lg};
  
  &:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: ${theme.colors.success};
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

const TransportSection = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  border-left: 4px solid ${theme.colors.secondary};
  margin-top: ${theme.spacing.lg};
`;

const RouteSteps = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  overflow-x: auto;
  padding: ${theme.spacing.sm} 0;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.surfaceDark};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary};
    border-radius: 3px;
  }
`;

const RouteStep = styled.div<{ isActive: boolean }>`
  background: ${props => props.isActive ? theme.colors.primaryLight : theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  min-width: 250px;
  flex-shrink: 0;
  border-left: 4px solid ${props => props.isActive ? theme.colors.primary : theme.colors.secondary};
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const StepNumber = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: -8px;
  left: ${theme.spacing.sm};
  background: ${props => props.isActive ? theme.colors.primary : theme.colors.secondary};
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
`;

const StepContent = styled.div`
  padding-top: ${theme.spacing.xs};
`;

const StepTitle = styled.div<{ isActive: boolean }>`
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.isActive ? 'white' : theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

const StepDetails = styled.div<{ isActive: boolean }>`
  color: ${props => props.isActive ? 'rgba(255,255,255,0.9)' : theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.4;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${theme.colors.surfaceDark};
  border-top: 2px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TripPlanPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get trip plan data from navigation state
  const tripPlanData = location.state?.tripPlan;
  const userInput = location.state?.userInput;
  const userPreferences = location.state?.userPreferences;
  const generatedAt = location.state?.generatedAt;
  const error = location.state?.error;
  
  // Convert AI trip plan to format compatible with existing UI
  const getAttractionsData = () => {
    if (tripPlanData && (tripPlanData.plannedAttractions || tripPlanData.recommendations)) {
      const attractions = (tripPlanData.plannedAttractions || tripPlanData.recommendations || []).map((item: any, index: number) => {
        let attraction, startTime, duration;
        
        if (tripPlanData.plannedAttractions) {
          // Text extraction format
          attraction = item.attraction;
          // Avoid timezone conversion issues by using the time directly if it's already in HH:MM format
          if (typeof item.plannedStartTime === 'string' && item.plannedStartTime.match(/^\d{1,2}:\d{2}$/)) {
            const [hours, minutes] = item.plannedStartTime.split(':');
            startTime = `${hours.padStart(2, '0')}:${minutes}`;
          } else {
            // Only use Date conversion if we have a full datetime
            startTime = new Date(item.plannedStartTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'Asia/Hong_Kong'  // Ensure we stay in Hong Kong timezone
            });
          }
          duration = attraction.estimatedVisitTime || 120;
        } else {
          // JSON format
          attraction = item;
          startTime = item.suggestedTime || '09:00';
          
          // Clean up any malformed time values and ensure proper format
          if (startTime && typeof startTime === 'string') {
            // Remove any extra quotes or malformed characters
            startTime = startTime.replace(/['"]/g, '').trim();
            
            // Ensure it's in HH:MM format
            if (startTime.match(/^\d{1,2}:\d{2}$/)) {
              // Valid time format, ensure leading zero for hours if needed
              const [hours, minutes] = startTime.split(':');
              startTime = `${hours.padStart(2, '0')}:${minutes}`;
            } else {
              // Fallback to default time if format is invalid
              startTime = '09:00';
            }
          }
          
          duration = item.duration || attraction.estimatedVisitTime || 120;
          console.log('🕐 Processing AI attraction:', attraction.name);
          console.log('   📅 Original suggestedTime:', item.suggestedTime, typeof item.suggestedTime);
          console.log('   🔧 Cleaned startTime:', startTime, typeof startTime);
          console.log('   ⏰ Final timing object will have:', startTime);
        }
        
        return {
          name: attraction.name,
          type: attraction.category || attraction.type || 'Attraction',
          location: attraction.location || { lat: 22.3193 + (index * 0.01), lng: 114.1694 + (index * 0.01) },
          timing: {
            startTime,
            duration,
            bestVisitTime: 'As planned'
          },
          transport: {
            fromPrevious: index === 0 ? 'Start of journey' : 'From previous location',
            method: 'Public Transport',
            duration: 15,
            cost: 'HK$10-30',
            instructions: 'Use MTR or bus for efficient travel'
          },
          cost: item.estimatedCost ? `HK$${item.estimatedCost}` : attraction.priceRange || 'Varies',
          difficulty: 'Easy',
          description: attraction.description || 'AI recommended attraction',
          highlights: [item.reason || attraction.aiRecommendation?.reason || 'Recommended by AI'],
          tips: ['Follow AI recommendations', 'Check real-time conditions']
        };
      });
      
      return {
        tripInfo: {
          title: tripPlanData.name || userInput || 'AI Generated Trip Plan',
          subtitle: tripPlanData.description || 'Personalized itinerary based on your preferences',
          duration: `${attractions.length} stops`,
          difficulty: 'Easy to Moderate',
          totalCost: `HK$${tripPlanData.totalEstimatedCost || tripPlanData.estimatedCost || 'TBD'}`
        },
        attractions
      };
    }
    return tripPlanConfig;
  };
  
  const currentTripData = getAttractionsData();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [routeInfo, setRouteInfo] = useState<DynamicTransportInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [mapsAvailable, setMapsAvailable] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const selectedAttraction = currentTripData.attractions[selectedIndex] as Attraction;

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        console.log('🗺️ Google Maps API Key loaded:', apiKey ? 'YES' : 'NO');
        console.log('🗺️ API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING');
        
        // Check if API key is available
        if (!apiKey || apiKey.trim() === '') {
          console.log('🗺️ Google Maps API key not available - Maps disabled');
          setMapsAvailable(false);
          return;
        }
        
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        console.log('🗺️ Loading Google Maps API...');
        await loader.load();
        console.log('✅ Google Maps API loaded successfully');

        const mapElement = document.getElementById('trip-plan-map');
        console.log('🗺️ Map element found:', !!mapElement);
        if (!mapElement) {
          console.error('❌ Map element with id "trip-plan-map" not found');
          return;
        }

        console.log('🗺️ Creating Google Maps instance...');
        const map = new google.maps.Map(mapElement, {
          center: { lat: 22.3193, lng: 114.1694 },
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        console.log('✅ Google Maps instance created successfully');
        mapRef.current = map;
        updateMapMarkers();
        updateRoute();

      } catch (error: any) {
        console.error('❌ Error loading Google Maps:', error);
        console.error('❌ Error details:', {
          name: error?.name,
          message: error?.message,
          stack: error?.stack
        });
      }
    };

    initMap();
  }, []);

  // Update map and route when selection changes
  useEffect(() => {
    updateMapMarkers();
    updateRoute();
  }, [selectedIndex]);

  const updateMapMarkers = () => {
    if (!mapRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add Hong Kong Central marker for reference (start point)
    if (selectedIndex === 0) {
      const centralMarker = new google.maps.Marker({
        position: { lat: 22.2855, lng: 114.1577 },
        map: mapRef.current,
        title: 'Hong Kong Central (Starting Point)',
        label: {
          text: 'S',
          color: 'white',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 18,
          fillColor: '#4CAF50', // Green for start
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 3
        }
      });
      markersRef.current.push(centralMarker);
    }

    // Add attraction markers
    currentTripData.attractions.forEach((attraction: any, index: number) => {
      const isSelected = index === selectedIndex;
      const isPrevious = index === selectedIndex - 1;
      
      let markerColor = theme.colors.secondary; // Default grey
      if (isSelected) markerColor = theme.colors.primary; // Red for selected
      else if (isPrevious) markerColor = '#FF6B35'; // Orange for previous (route origin)
      
      const marker = new google.maps.Marker({
        position: { lat: attraction.location.lat, lng: attraction.location.lng },
        map: mapRef.current,
        title: `${index}. ${attraction.name}`,
        label: {
          text: index.toString(),
          color: 'white',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 25 : 20,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: isSelected ? 4 : 3
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 250px;">
            <h4 style="margin: 0 0 8px 0; color: ${theme.colors.textPrimary};">${index}. ${attraction.name}</h4>
            <p style="margin: 0 0 8px 0; color: ${theme.colors.textSecondary}; font-size: 0.9rem;">
              ${attraction.description}
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem;">
              <div><strong>Type:</strong> ${attraction.type}</div>
              <div><strong>Start:</strong> ${attraction.timing.startTime}</div>
              <div><strong>Duration:</strong> ${attraction.timing.duration} min</div>
              <div><strong>Cost:</strong> ${attraction.cost}</div>
            </div>
            ${isSelected ? '<p style="margin: 8px 0 0 0; color: #D32F2F; font-weight: bold; font-size: 0.8rem;">Currently Selected</p>' : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        setSelectedIndex(index);
        infoWindow.open(mapRef.current, marker);
        
        // Center map on selected attraction
        mapRef.current?.panTo({ lat: attraction.location.lat, lng: attraction.location.lng });
      });

      markersRef.current.push(marker);
    });

    // Auto-center map on selected attraction
    const selectedAttraction = currentTripData.attractions[selectedIndex];
    if (selectedAttraction && mapRef.current) {
      mapRef.current.panTo({ 
        lat: selectedAttraction.location.lat, 
        lng: selectedAttraction.location.lng 
      });
      mapRef.current.setZoom(15);
    }
  };

  const updateRoute = () => {
    if (!mapRef.current || !window.google || !window.google.maps.DirectionsService) {
      console.warn('Google Maps not loaded properly:', {
        mapRef: !!mapRef.current,
        google: !!window.google,
        directionsService: !!(window.google && window.google.maps && window.google.maps.DirectionsService)
      });
      setIsLoadingRoute(false);
      return;
    }

    console.log('Starting route calculation for attraction', selectedIndex);
    setIsLoadingRoute(true);
    setRouteInfo(null);

    // Clear existing route
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: theme.colors.primary,
        strokeWeight: 4,
        strokeOpacity: 0.8
      },
      markerOptions: {
        visible: false // Hide default markers since we have custom ones
      }
    });

    directionsRenderer.setMap(mapRef.current);
    directionsRendererRef.current = directionsRenderer;

    // Get current attraction and calculate route from previous location
    const currentAttraction = currentTripData.attractions[selectedIndex];
    
    if (selectedIndex === 0) {
      // For first attraction, show route from Hong Kong Central
      const hkCentral = { lat: 22.2855, lng: 114.1577 };
      calculateAndDisplayRoute(directionsService, directionsRenderer, hkCentral, currentAttraction.location);
    } else {
      // Show route from previous attraction
      const previousAttraction = currentTripData.attractions[selectedIndex - 1];
      calculateAndDisplayRoute(directionsService, directionsRenderer, previousAttraction.location, currentAttraction.location);
    }
  };

  const calculateAndDisplayRoute = (
    directionsService: google.maps.DirectionsService,
    directionsRenderer: google.maps.DirectionsRenderer,
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) => {
    console.log('Calculating route from', origin, 'to', destination);
    // Try transit first (most common in Hong Kong)
    directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.TRANSIT,
      unitSystem: google.maps.UnitSystem.METRIC,
      region: 'HK',
      transitOptions: {
        modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.RAIL, google.maps.TransitMode.SUBWAY],
        routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
      }
    }, (result, status) => {
      console.log('Transit route result:', status, result);
      if (status === 'OK' && result) {
        directionsRenderer.setDirections(result);
        updateTransportInfo(result);
      } else {
        console.warn('Transit route failed, trying driving:', status);
        // Fallback to driving if transit not available
        directionsService.route({
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          region: 'HK'
        }, (fallbackResult, fallbackStatus) => {
          console.log('Driving route result:', fallbackStatus, fallbackResult);
          if (fallbackStatus === 'OK' && fallbackResult) {
            directionsRenderer.setDirections(fallbackResult);
            updateTransportInfo(fallbackResult);
          } else {
            console.warn('Could not calculate route:', status, fallbackStatus);
            setIsLoadingRoute(false);
            // Fallback to static data if Google Maps fails
            setRouteInfo(null);
          }
        });
      }
    });
  };

  const updateTransportInfo = (directionsResult: google.maps.DirectionsResult) => {
    const route = directionsResult.routes[0];
    if (route && route.legs[0]) {
      const leg = route.legs[0];
      
      // Extract transit details for cost estimation
      let method = 'Mixed Transport';
      let cost = 'HK$10-30';
      let instructions = leg.steps[0]?.instructions || 'Follow the directions on map';
      
      // Analyze travel mode and provide better information
      const hasTransit = leg.steps.some(step => step.travel_mode === google.maps.TravelMode.TRANSIT);
      const hasWalking = leg.steps.some(step => step.travel_mode === google.maps.TravelMode.WALKING);
      
      if (hasTransit) {
        method = 'Public Transport';
        cost = 'HK$5-25';
        
        // Extract more detailed transit information
        const transitSteps = leg.steps.filter(step => step.travel_mode === google.maps.TravelMode.TRANSIT);
        if (transitSteps.length > 0 && transitSteps[0].transit) {
          const transitDetails = transitSteps[0].transit;
          if (transitDetails.line?.vehicle?.type) {
            const vehicleType = transitDetails.line.vehicle.type;
            method = vehicleType === 'BUS' ? 'Bus' : 
                    vehicleType === 'SUBWAY' ? 'MTR' : 
                    vehicleType === 'RAIL' ? 'Train' : 'Public Transport';
          }
        }
      } else if (hasWalking) {
        method = 'Walking';
        cost = 'Free';
      }
      
      // Create detailed instructions
      const stepInstructions = leg.steps
        .filter(step => step.instructions && step.instructions.length > 0)
        .map(step => step.instructions.replace(/<[^>]*>/g, '')) // Remove HTML tags
        .join('. ');
      
      if (stepInstructions) {
        instructions = stepInstructions;
      }

      const dynamicTransportInfo: DynamicTransportInfo = {
        duration: leg.duration?.text || 'Unknown',
        distance: leg.distance?.text || 'Unknown', 
        method,
        cost,
        instructions,
        steps: leg.steps.map(step => ({
          instructions: step.instructions?.replace(/<[^>]*>/g, '') || '',
          distance: step.distance?.text,
          duration: step.duration?.text,
          travelMode: step.travel_mode
        }))
      };
      
      setRouteInfo(dynamicTransportInfo);
      setIsLoadingRoute(false);
    }
  };

  const handleStepClick = (index: number) => {
    setSelectedIndex(index);
  };



  return (
    <PageContainer>
      <Header>
        <HeaderRow>
          <BackButton onClick={() => window.location.href = '/'}>
            ← Back to Home
          </BackButton>
          <TitleSection>
            <Title>{currentTripData.tripInfo.title}</Title>
            <Subtitle>{currentTripData.tripInfo.subtitle}</Subtitle>
          </TitleSection>
          <div style={{ width: '120px' }}></div>
        </HeaderRow>

        <AttractionSelector>
          {currentTripData.attractions.map((attraction: any, index: number) => (
            <AttractionTab
              key={index}
              isActive={index === selectedIndex}
              onClick={() => setSelectedIndex(index)}
            >
              {index}. {(attraction as Attraction).name}
            </AttractionTab>
          ))}
        </AttractionSelector>
      </Header>



      <MainContent>
        {/* Map Section */}
        <TripMapContainer>
          {mapsAvailable ? (
            <div id="trip-plan-map" style={{ width: '100%', height: '100%' }} />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f5f5f5',
              borderRadius: '8px',
              border: '2px dashed #ccc'
            }}>
              <div style={{ textAlign: 'center', color: '#666' }}>
                <h3>🗺️ Google Maps Disabled</h3>
                <p>API key not configured in .env file</p>
                <p style={{ fontSize: '14px', marginTop: '10px' }}>Add REACT_APP_GOOGLE_MAPS_API_KEY to enable maps</p>
              </div>
            </div>
          )}
        </TripMapContainer>

        {/* Attraction Details Slider */}
        <AttractionSlider>
          <SliderHeader>
            <SliderTitle>
              {selectedIndex}. {selectedAttraction.name}
            </SliderTitle>
            <AttractionBadge>{selectedAttraction.type}</AttractionBadge>
          </SliderHeader>
          
          <SliderContent>
            <QuickInfoGrid>
              <InfoItem>
                <InfoLabel>Cost</InfoLabel>
                <InfoValue>{selectedAttraction.cost}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Duration</InfoLabel>
                <InfoValue>{selectedAttraction.timing.duration} min</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Start Time</InfoLabel>
                <InfoValue>{selectedAttraction.timing.startTime}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Difficulty</InfoLabel>
                <InfoValue>{selectedAttraction.difficulty}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Best Time</InfoLabel>
                <InfoValue>{selectedAttraction.timing.bestVisitTime}</InfoValue>
              </InfoItem>
            </QuickInfoGrid>

            <Description>
              {selectedAttraction.description}
            </Description>

            <Section>
              <SectionTitle>🌟 Highlights</SectionTitle>
              <HighlightsList>
                {selectedAttraction.highlights.map((highlight, index) => (
                  <HighlightItem key={index}>{highlight}</HighlightItem>
                ))}
              </HighlightsList>
            </Section>

            <Section>
              <SectionTitle>💡 Pro Tips</SectionTitle>
              <HighlightsList>
                {selectedAttraction.tips.map((tip, index) => (
                  <HighlightItem key={index}>{tip}</HighlightItem>
                ))}
              </HighlightsList>
            </Section>

            <TransportCard>
              <SectionTitle>🚇 Transport Information</SectionTitle>
              {isLoadingRoute ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    border: `3px solid ${theme.colors.surfaceDark}`,
                    borderTop: `3px solid ${theme.colors.primary}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: theme.spacing.sm
                  }}></div>
                  Calculating route...
                </div>
              ) : routeInfo ? (
                <>
                  <TransportGrid>
                    <InfoItem>
                      <InfoLabel>From</InfoLabel>
                      <InfoValue>{selectedIndex === 0 ? 'Hong Kong Central' : currentTripData.attractions[selectedIndex - 1].name}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Method</InfoLabel>
                      <InfoValue>{routeInfo.method}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Duration</InfoLabel>
                      <InfoValue>{routeInfo.duration}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Distance</InfoLabel>
                      <InfoValue>{routeInfo.distance}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Cost</InfoLabel>
                      <InfoValue>{routeInfo.cost}</InfoValue>
                    </InfoItem>
                  </TransportGrid>
                  <Description style={{ marginTop: theme.spacing.md, marginBottom: 0 }}>
                    {routeInfo.instructions}
                  </Description>
                </>
              ) : (
                <TransportGrid>
                  <InfoItem>
                    <InfoLabel>From</InfoLabel>
                    <InfoValue>{selectedAttraction.transport.fromPrevious}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Method</InfoLabel>
                    <InfoValue>{selectedAttraction.transport.method}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Duration</InfoLabel>
                    <InfoValue>{selectedAttraction.transport.duration} min</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Cost</InfoLabel>
                    <InfoValue>{selectedAttraction.transport.cost}</InfoValue>
                  </InfoItem>
                </TransportGrid>
              )}
            </TransportCard>
          </SliderContent>
        </AttractionSlider>

        {/* Route Overview */}
        <RouteOverview>
          <SectionTitle>🗺️ Route Overview</SectionTitle>
          <p style={{ color: theme.colors.textSecondary, margin: `0 0 ${theme.spacing.md} 0` }}>
            Click any step to view details. Current selection: <strong>Step {selectedIndex}</strong>
          </p>
          <RouteSteps>
            {currentTripData.attractions.map((attraction: any, index: number) => (
              <RouteStep
                key={index}
                isActive={index === selectedIndex}
                onClick={() => handleStepClick(index)}
              >
                <StepNumber isActive={index === selectedIndex}>{index}</StepNumber>
                <StepContent>
                  <StepTitle isActive={index === selectedIndex}>
                    {(attraction as Attraction).name}
                  </StepTitle>
                  <StepDetails isActive={index === selectedIndex}>
                    <strong>{(attraction as Attraction).timing.startTime}</strong> • {(attraction as Attraction).timing.duration} min<br/>
                    {index === selectedIndex && routeInfo ? 
                      `${routeInfo.method} • ${routeInfo.cost} (Google Maps)` : 
                      `${(attraction as Attraction).transport.method} • ${(attraction as Attraction).transport.cost}`}
                  </StepDetails>
                </StepContent>
              </RouteStep>
            ))}
          </RouteSteps>
        </RouteOverview>
      </MainContent>
    </PageContainer>
  );
};

export default TripPlanPage;
