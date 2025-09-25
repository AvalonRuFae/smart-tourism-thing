/**
 * Home Page - Main tourism planning interface
 * Combines Header, UserInput, and MapView components
 */


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../components/Header';
import { UserInput } from '../components/UserInput';
import GoogleMapView from '../components/GoogleMapView';
import { theme } from '../styles/theme';
import { 
  RealTimeData, 
  UserPreferences, 
  TouristAttraction,
  WeatherData,
  GovernmentAlert
} from '../types';
// import { apiService } from '../services'; // Removed unused import
import attractionsConfig from '../config/attractions.json';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  max-width: 1920px;
  margin: 0 auto;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    padding: ${theme.spacing.md};
  }
`;

const ResizableLayout = styled.div<{ preferenceWidth: number }>`
  display: flex;
  min-height: calc(100vh - 200px);
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  overflow: visible;
  box-shadow: ${theme.shadows.md};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    flex-direction: column;
    height: auto;
  }
`;

const PreferencePanel = styled.div<{ width: number }>`
  width: ${props => props.width}px;
  min-width: 300px;
  max-width: 600px;
  height: auto;
  overflow: visible;
  background: ${theme.colors.surface};
  border-right: 1px solid ${theme.colors.surfaceDark};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    width: 100% !important;
    border-right: none;
    border-bottom: 1px solid ${theme.colors.surfaceDark};
  }
`;

const MapAndAttractionsPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${theme.colors.surface};
`;

const MapContainer = styled.div<{ height: number }>`
  height: ${props => props.height}px;
  min-height: 200px;
  overflow: hidden;
`;

const DragHandleStyled = styled.div<{ isDragging?: boolean }>`
  width: 20px; /* Wider for easier clicking */
  background: ${props => props.isDragging ? theme.colors.primary : theme.colors.surfaceDark};
  cursor: col-resize;
  position: relative;
  transition: all 0.2s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: ${theme.colors.primary};
    transform: scaleX(1.3); /* Visual feedback on hover */
    box-shadow: 0 0 8px ${theme.colors.primary}40;
  }
  
  &::before {
    content: '⋮⋮';
    color: ${props => props.isDragging ? 'white' : theme.colors.textSecondary};
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 2px;
    transition: color 0.2s ease;
  }
  
  &:hover::before {
    color: white;
  }
  
  /* Add some padding area for easier clicking */
  &::after {
    content: '';
    position: absolute;
    top: -10px;
    left: -5px;
    right: -5px;
    bottom: -10px;
    cursor: col-resize;
  }
  
  @media (max-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

const DragHandle = ({ isDragging, onMouseDown }: { isDragging?: boolean; onMouseDown?: (e: React.MouseEvent) => void }) => (
  <DragHandleStyled isDragging={isDragging} onMouseDown={onMouseDown} />
);

const VerticalDragHandleStyled = styled.div<{ isDragging?: boolean }>`
  height: 20px; /* Height for horizontal drag handle */
  background: ${props => props.isDragging ? theme.colors.primary : theme.colors.surfaceDark};
  cursor: row-resize;
  position: relative;
  transition: all 0.2s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin: 2px 0;
  
  &:hover {
    background: ${theme.colors.primary};
    transform: scaleY(1.3); /* Visual feedback on hover */
    box-shadow: 0 0 8px ${theme.colors.primary}40;
  }
  
  &::before {
    content: '═══';
    color: ${props => props.isDragging ? 'white' : theme.colors.textSecondary};
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 4px;
    transition: color 0.2s ease;
  }
  
  &:hover::before {
    color: white;
  }
  
  /* Add some padding area for easier clicking */
  &::after {
    content: '';
    position: absolute;
    top: -8px;
    left: -20px;
    right: -20px;
    bottom: -8px;
    cursor: row-resize;
  }
  
  @media (max-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

const VerticalDragHandle = ({ isDragging, onMouseDown }: { isDragging?: boolean; onMouseDown?: (e: React.MouseEvent) => void }) => (
  <VerticalDragHandleStyled isDragging={isDragging} onMouseDown={onMouseDown} />
);

const AttractionsSection = styled.div`
  flex: 1;
  background: ${theme.colors.background};
  border-top: 1px solid ${theme.colors.surfaceDark};
  min-height: 300px; /* Increased minimum height */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 0 0 12px 12px;
`;



const SectionTitle = styled.h2`
  color: ${theme.colors.textPrimary};
  font-size: 1.5rem;
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: 0 0 ${theme.spacing.md} 0;
`;

const AttractionsHeader = styled.div`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.surfaceDark};
  flex-shrink: 0;
`;

const AttractionsScroller = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing.sm};
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${theme.spacing.md};
  
  /* Custom scrollbar for vertical scrolling */
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
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const AttractionCard = styled.div<{ isSelected?: boolean }>`
  background: ${props => props.isSelected ? theme.colors.primaryLight : theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  border: 2px solid ${props => props.isSelected ? theme.colors.primary : theme.colors.surfaceDark};
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 300px;
  flex-shrink: 0;
  position: relative;
  
  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const AttractionNumber = styled.div`
  position: absolute;
  top: -12px;
  left: ${theme.spacing.md};
  background: ${theme.colors.primary};
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: 0.9rem;
  box-shadow: ${theme.shadows.sm};
`;

const AttractionName = styled.h3`
  color: ${theme.colors.textPrimary};
  font-size: 1.1rem;
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: ${theme.spacing.sm} 0 ${theme.spacing.xs} 0;
`;

const AttractionDescription = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: 0.9rem;
  margin: 0 0 ${theme.spacing.sm} 0;
  line-height: 1.4;
`;

const AttractionMeta = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  font-size: 0.85rem;
  color: ${theme.colors.textSecondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const LoadingOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  
  div {
    text-align: center;
    
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid ${theme.colors.surfaceDark};
      border-top: 4px solid ${theme.colors.primary};
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto ${theme.spacing.md};
    }
    
    p {
      color: ${theme.colors.textPrimary};
      font-weight: ${theme.typography.fontWeight.medium};
      margin: 0;
    }
  }
`;

// Sample real-time data for demonstration (fallback)
const generateSampleRealTimeData = (): RealTimeData => {
  const weather: WeatherData = {
    temperature: 27,
    humidity: 78,
    uvIndex: 6,
    airQuality: 85,
    weatherCondition: 'Partly Cloudy',
    icon: 'partly-cloudy',
    timestamp: new Date()
  };

  const alerts: GovernmentAlert[] = [
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

  return {
    weather,
    traffic: [], // Would be populated with real traffic data
    alerts,
    timestamp: new Date()
  };
};

// Fetch real-time data from API
const fetchRealTimeData = async (): Promise<RealTimeData> => {
  try {
    console.log('🌤️ Fetching weather data from API...');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(`${apiBaseUrl}/api/weather/current`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 Received weather data:', data);
    
    if (data.success && data.data) {
      const weatherData = data.data;
      console.log('✅ Using real weather data with alerts:', weatherData.alerts?.length || 0);
      return {
        weather: {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          uvIndex: weatherData.uvIndex,
          airQuality: weatherData.airQuality,
          weatherCondition: weatherData.weatherCondition,
          icon: weatherData.icon,
          timestamp: new Date(weatherData.timestamp)
        },
        traffic: [], // Would be populated with real traffic data
        alerts: weatherData.alerts || [],
        timestamp: new Date()
      };
    } else {
      console.warn('⚠️ API returned data but not in expected format:', data);
    }
  } catch (error) {
    console.error('❌ Error fetching real-time data:', error);
  }
  
  // Fallback to sample data if API fails
  console.log('🔄 Falling back to sample data');
  return generateSampleRealTimeData();
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [realTimeData, setRealTimeData] = useState<RealTimeData>(generateSampleRealTimeData());
  const [selectedAttraction, setSelectedAttraction] = useState<any>(null);
  // const [attractions, setAttractions] = useState<TouristAttraction[]>([]); // Using static config instead
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | undefined>();
  const [preferenceWidth, setPreferenceWidth] = useState(400); // Default width for preference panel
  const [mapHeight, setMapHeight] = useState(400); // Default height for map section
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);

  // Fetch real-time data and set up periodic updates
  useEffect(() => {
    // Initial fetch
    fetchRealTimeData().then(setRealTimeData);
    
    // Set up periodic updates
    const interval = setInterval(async () => {
      const data = await fetchRealTimeData();
      setRealTimeData(data);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle user preferences submission
  const handlePreferencesSubmit = async (userPreferences: UserPreferences) => {
    setIsLoading(true);
    setPreferences(userPreferences);
    
    try {
      // Simulate API call to get personalized attractions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call your backend API
      console.log('User preferences:', userPreferences);
      
      // For now, we'll use sample data
      // setAttractions(filteredAttractions);
      
    } catch (error) {
      console.error('Error fetching attractions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle natural language text analysis
  const handleTextAnalysis = async (text: string) => {
    setIsLoading(true);
    
    try {
      // Simulate AI text analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, this would call your AI service
      console.log('Analyzing text:', text);
      
      // Simulate extracting preferences from text
      // const extractedPreferences = await analyzeUserText(text);
      // setAttractions(getRecommendations(extractedPreferences));
      
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle trip planning from structured preferences
  const handleTripPlan = async (userPreferences: UserPreferences) => {
    setIsLoading(true);
    setPreferences(userPreferences);
    
    try {
      // Simulate processing preferences for trip planning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Planning trip with preferences:', userPreferences);
      
      // Navigate to trip plan page
      navigate('/trip-plan');
      
    } catch (error) {
      console.error('Error planning trip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle attraction selection
  const handleAttractionSelect = (attraction: any) => {
    setSelectedAttraction(attraction);
    console.log('🎯 Selected attraction from card:', attraction.name);
    
    // The GoogleMapView component will handle the zooming through its useEffect
    // that watches for selectedAttraction changes
  };

  // Load attractions from config file
  const sampleAttractions: TouristAttraction[] = attractionsConfig.attractions.map(attraction => ({
    ...attraction,
    category: attraction.category as any,
    priceRange: attraction.priceRange as any
  }));

  const handleViewTripPlan = () => {
    window.location.href = '/trip-plan';
  };

  // Drag handlers for resizing
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newWidth = e.clientX;
    if (newWidth >= 280 && newWidth <= 700) { // Wider range for better UX
      setPreferenceWidth(newWidth);
    }
    e.preventDefault();
  }, [isDragging]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Vertical drag handlers for resizing map height
  const handleVerticalMouseDown = React.useCallback((e: React.MouseEvent) => {
    setIsDraggingVertical(true);
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleVerticalMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDraggingVertical) return;
    
    // Calculate new height based on mouse position relative to the main content area
    const mainContentRect = document.querySelector('[data-main-content]')?.getBoundingClientRect();
    if (mainContentRect) {
      const relativeY = e.clientY - mainContentRect.top;
      const newHeight = relativeY;
      if (newHeight >= 200 && newHeight <= 700) { // Set reasonable bounds
        setMapHeight(newHeight);
      }
    }
    e.preventDefault();
  }, [isDraggingVertical]);

  const handleVerticalMouseUp = React.useCallback(() => {
    setIsDraggingVertical(false);
  }, []);

  // Add event listeners for horizontal dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Add event listeners for vertical dragging
  React.useEffect(() => {
    if (isDraggingVertical) {
      document.addEventListener('mousemove', handleVerticalMouseMove);
      document.addEventListener('mouseup', handleVerticalMouseUp);
    } else {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
    };
  }, [isDraggingVertical, handleVerticalMouseMove, handleVerticalMouseUp]);

  // Add event listeners for drag functionality (continuing the original implementation)
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Add event listeners for vertical dragging
  React.useEffect(() => {
    if (isDraggingVertical) {
      document.addEventListener('mousemove', handleVerticalMouseMove);
      document.addEventListener('mouseup', handleVerticalMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingVertical, handleVerticalMouseMove, handleVerticalMouseUp]);

  return (
    <PageContainer>
      <Header realTimeData={realTimeData} />
      
      <MainContent data-main-content>
        <ResizableLayout preferenceWidth={preferenceWidth}>
          {/* Preference Panel */}
          <PreferencePanel width={preferenceWidth}>
            <UserInput
              onPreferencesSubmit={handlePreferencesSubmit}
              onTextAnalysis={handleTextAnalysis}
              onTripPlan={handleTripPlan}
              isLoading={isLoading}
            />
          </PreferencePanel>
          
          {/* Draggable Separator */}
          <DragHandle isDragging={isDragging} onMouseDown={handleMouseDown} />
          
          {/* Map and Attractions Panel */}
          <MapAndAttractionsPanel>
            <MapContainer height={mapHeight}>
              <GoogleMapView
                attractions={sampleAttractions}
                onAttractionSelect={handleAttractionSelect}
                userPreferences={preferences}
                selectedAttraction={selectedAttraction}
              />
            </MapContainer>
            
            <VerticalDragHandle
              isDragging={isDraggingVertical}
              onMouseDown={handleVerticalMouseDown}
            />
            
            <AttractionsSection style={{ height: `calc(100vh - ${mapHeight + 200}px)` }}>
              <AttractionsHeader>
                <SectionTitle style={{ margin: 0 }}>Recommended Attractions</SectionTitle>
                <button
                  style={{
                    background: '#D32F2F',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                  onClick={handleViewTripPlan}
                >
                  View Full Day Trip Plan 🗺️
                </button>
              </AttractionsHeader>
              
              <AttractionsScroller>
                {sampleAttractions.map((attraction, index) => (
                  <AttractionCard 
                    key={attraction.id} 
                    isSelected={selectedAttraction?.id === attraction.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleAttractionSelect(attraction)}
                  >
                    <AttractionNumber>{index + 1}</AttractionNumber>
                    <AttractionName>{attraction.name}</AttractionName>
                    <AttractionDescription>{attraction.description}</AttractionDescription>
                    <AttractionMeta>
                      <MetaItem>
                        <span>⭐</span>
                        <span>{attraction.rating}</span>
                      </MetaItem>
                      <MetaItem>
                        <span>📍</span>
                        <span>Hong Kong</span>
                      </MetaItem>
                    </AttractionMeta>
                  </AttractionCard>
                ))}
              </AttractionsScroller>
            </AttractionsSection>
          </MapAndAttractionsPanel>
        </ResizableLayout>
      </MainContent>
      
      <LoadingOverlay show={isLoading}>
        <div>
          <div className="spinner" />
          <p>Planning your perfect Hong Kong experience...</p>
        </div>
      </LoadingOverlay>
    </PageContainer>
  );
};

export default HomePage;