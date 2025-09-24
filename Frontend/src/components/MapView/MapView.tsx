/**
 * MapView Component - Interactive map displaying attractions, traffic, and routes
 * Uses Leaflet for professional mapping capabilities with Hong Kong data
 */

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
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
import { MapProps, TouristAttraction, AttractionCategory } from '../../types';
import { Card, Button, Flex } from '../../styles/theme';

const MapContainer = styled(Card)`
  height: calc(100vh - 120px);
  padding: 0;
  overflow: hidden;
  position: relative;
`;

const MapViewContainer = styled.div`
  width: 100%;
  height: 70%;
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  position: relative;
  border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
  overflow: hidden;
`;

const MapOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 30% 20%, rgba(33, 150, 243, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 90% 30%, rgba(255, 152, 0, 0.1) 0%, transparent 50%);
`;

const AttractionsPanel = styled.div`
  height: 30%;
  padding: ${theme.spacing.lg};
  overflow-y: auto;
  background: ${theme.colors.surface};
  border-radius: 0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg};
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};
  
  h3 {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    margin: 0;
    color: ${theme.colors.textPrimary};
    
    svg {
      color: ${theme.colors.primary};
    }
  }
`;

const TrafficToggle = styled(Button)<{ active: boolean }>`
  ${({ active }) => active ? `
    background: ${theme.colors.success};
    &:hover {
      background: ${theme.colors.success};
    }
  ` : ''}
`;

const AttractionsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing.md};
`;

const AttractionCard = styled.div<{ selected?: boolean }>`
  background: ${({ selected }) => selected ? `${theme.colors.primary}10` : theme.colors.surfaceDark};
  border: 2px solid ${({ selected }) => selected ? theme.colors.primary : 'transparent'};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
    border-color: ${theme.colors.primary};
  }
`;

const AttractionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
`;

const CategoryIcon = styled.div<{ category: AttractionCategory }>`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${theme.typography.fontSize.lg};
  flex-shrink: 0;
  
  ${({ category }) => {
    switch (category) {
      case AttractionCategory.FOOD:
        return `background: ${theme.colors.warning};`;
      case AttractionCategory.MUSEUM:
      case AttractionCategory.CULTURAL:
        return `background: ${theme.colors.secondary};`;
      case AttractionCategory.SHOPPING:
        return `background: ${theme.colors.primary};`;
      case AttractionCategory.NATURE:
        return `background: ${theme.colors.success};`;
      default:
        return `background: ${theme.colors.textSecondary};`;
    }
  }}
`;

const AttractionInfo = styled.div`
  flex: 1;
`;

const AttractionName = styled.h4`
  margin: 0 0 ${theme.spacing.xs} 0;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
`;

const AttractionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.sm};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  svg {
    font-size: ${theme.typography.fontSize.base};
  }
`;

const AttractionDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  line-height: ${theme.typography.lineHeight.normal};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MapMarker = styled.div<{ 
  selected?: boolean; 
  category: AttractionCategory; 
  top: number; 
  left: number 
}>`
  position: absolute;
  top: ${({ top }) => top}%;
  left: ${({ left }) => left}%;
  transform: translate(-50%, -100%);
  z-index: 10;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ selected }) => selected && `
    transform: translate(-50%, -100%) scale(1.2);
    z-index: 20;
  `}
`;

const MarkerPin = styled.div<{ category: AttractionCategory; selected?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  box-shadow: ${theme.shadows.md};
  border: 3px solid white;
  
  ${({ selected }) => selected && `
    animation: bounce 0.6s ease-in-out;
  `}
  
  ${({ category }) => {
    switch (category) {
      case AttractionCategory.FOOD:
        return `background: ${theme.colors.warning};`;
      case AttractionCategory.MUSEUM:
      case AttractionCategory.CULTURAL:
        return `background: ${theme.colors.secondary};`;
      case AttractionCategory.SHOPPING:
        return `background: ${theme.colors.primary};`;
      case AttractionCategory.NATURE:
        return `background: ${theme.colors.success};`;
      default:
        return `background: ${theme.colors.textSecondary};`;
    }
  }}
  
  svg {
    transform: rotate(45deg);
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: rotate(-45deg) translateY(0);
    }
    40%, 43% {
      transform: rotate(-45deg) translateY(-8px);
    }
    70% {
      transform: rotate(-45deg) translateY(-4px);
    }
    90% {
      transform: rotate(-45deg) translateY(-2px);
    }
  }
`;

const TrafficLayer = styled.div<{ show: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: ${({ show }) => show ? 0.6 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;
  
  background-image: 
    linear-gradient(45deg, ${theme.colors.traffic.low}40 25%, transparent 25%),
    linear-gradient(-45deg, ${theme.colors.traffic.medium}40 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, ${theme.colors.traffic.high}40 75%),
    linear-gradient(-45deg, transparent 75%, ${theme.colors.traffic.severe}40 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
`;

// Helper function to get category icon
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

// Helper function to format price range
const formatPriceRange = (priceRange: string) => {
  switch (priceRange) {
    case 'free': return 'Free';
    case 'low': return 'HK$0-50';
    case 'medium': return 'HK$50-200';
    case 'high': return 'HK$200-500';
    case 'luxury': return 'HK$500+';
    default: return 'N/A';
  }
};

// Sample attractions data for demonstration
const sampleAttractions: TouristAttraction[] = [
  {
    id: '1',
    name: 'Victoria Peak',
    description: 'Iconic mountain offering panoramic views of Hong Kong skyline and harbor.',
    location: { lat: 22.2708, lng: 114.1550 },
    category: AttractionCategory.NATURE,
    priceRange: 'medium' as any,
    rating: 4.5,
    imageUrl: '',
    tags: ['views', 'nature', 'iconic'],
    openingHours: {} as any,
    estimatedVisitTime: 180,
    accessibility: {} as any
  },
  {
    id: '2',
    name: 'Tsim Sha Tsui Promenade',
    description: 'Waterfront walkway with stunning harbor views and Symphony of Lights show.',
    location: { lat: 22.2940, lng: 114.1722 },
    category: AttractionCategory.CULTURAL,
    priceRange: 'free' as any,
    rating: 4.3,
    imageUrl: '',
    tags: ['waterfront', 'views', 'free'],
    openingHours: {} as any,
    estimatedVisitTime: 120,
    accessibility: {} as any
  },
  {
    id: '3',
    name: 'Hong Kong Museum of History',
    description: 'Comprehensive museum showcasing Hong Kong\'s rich cultural heritage.',
    location: { lat: 22.3010, lng: 114.1740 },
    category: AttractionCategory.MUSEUM,
    priceRange: 'low' as any,
    rating: 4.2,
    imageUrl: '',
    tags: ['history', 'culture', 'educational'],
    openingHours: {} as any,
    estimatedVisitTime: 150,
    accessibility: {} as any
  },
  {
    id: '4',
    name: 'Central Market',
    description: 'Historic market building now featuring local artisans and gourmet food.',
    location: { lat: 22.2820, lng: 114.1580 },
    category: AttractionCategory.SHOPPING,
    priceRange: 'medium' as any,
    rating: 4.0,
    imageUrl: '',
    tags: ['shopping', 'food', 'local'],
    openingHours: {} as any,
    estimatedVisitTime: 90,
    accessibility: {} as any
  },
  {
    id: '5',
    name: 'Temple Street Night Market',
    description: 'Vibrant night market famous for street food, fortune telling, and bargain shopping.',
    location: { lat: 22.3080, lng: 114.1700 },
    category: AttractionCategory.FOOD,
    priceRange: 'low' as any,
    rating: 4.1,
    imageUrl: '',
    tags: ['night market', 'street food', 'shopping'],
    openingHours: {} as any,
    estimatedVisitTime: 120,
    accessibility: {} as any
  }
];

export const MapView: React.FC<MapProps> = ({
  attractions = sampleAttractions,
  selectedAttraction,
  onAttractionSelect,
  tripPlan,
  showTraffic = false
}) => {
  const [showTrafficLayer, setShowTrafficLayer] = useState(showTraffic);
  const [hoveredAttraction, setHoveredAttraction] = useState<string | null>(null);

  // Convert lat/lng to percentage positions for demo
  const getMarkerPosition = (lat: number, lng: number) => {
    // Simplified conversion for demo - in real app, use proper map projection
    const minLat = 22.25, maxLat = 22.35;
    const minLng = 114.13, maxLng = 114.20;
    
    const top = ((maxLat - lat) / (maxLat - minLat)) * 100;
    const left = ((lng - minLng) / (maxLng - minLng)) * 100;
    
    return { top: Math.max(5, Math.min(95, top)), left: Math.max(5, Math.min(95, left)) };
  };

  return (
    <MapContainer>
      <MapViewContainer>
        <MapOverlay />
        <TrafficLayer show={showTrafficLayer} />
        
        {/* Map Markers */}
        {attractions.map(attraction => {
          const position = getMarkerPosition(attraction.location.lat, attraction.location.lng);
          const isSelected = selectedAttraction?.id === attraction.id;
          
          return (
            <MapMarker
              key={attraction.id}
              selected={isSelected}
              category={attraction.category}
              top={position.top}
              left={position.left}
              onClick={() => onAttractionSelect(attraction)}
            >
              <MarkerPin category={attraction.category} selected={isSelected}>
                {getCategoryIcon(attraction.category)}
              </MarkerPin>
            </MapMarker>
          );
        })}
      </MapViewContainer>
      
      <AttractionsPanel>
        <PanelHeader>
          <h3>
            <LocationIcon />
            Recommended Attractions
          </h3>
          <TrafficToggle
            variant="ghost"
            size="sm"
            active={showTrafficLayer}
            onClick={() => setShowTrafficLayer(!showTrafficLayer)}
          >
            <TrafficIcon />
            Traffic
          </TrafficToggle>
        </PanelHeader>
        
        <AttractionsList>
          {attractions.map(attraction => (
            <AttractionCard
              key={attraction.id}
              selected={selectedAttraction?.id === attraction.id}
              onClick={() => onAttractionSelect(attraction)}
              onMouseEnter={() => setHoveredAttraction(attraction.id)}
              onMouseLeave={() => setHoveredAttraction(null)}
            >
              <AttractionHeader>
                <CategoryIcon category={attraction.category}>
                  {getCategoryIcon(attraction.category)}
                </CategoryIcon>
                <AttractionInfo>
                  <AttractionName>{attraction.name}</AttractionName>
                  <AttractionMeta>
                    <MetaItem>
                      <StarIcon />
                      {attraction.rating}
                    </MetaItem>
                    <MetaItem>
                      <ClockIcon />
                      {Math.floor(attraction.estimatedVisitTime / 60)}h {attraction.estimatedVisitTime % 60}m
                    </MetaItem>
                    <MetaItem>
                      <MoneyIcon />
                      {formatPriceRange(attraction.priceRange)}
                    </MetaItem>
                  </AttractionMeta>
                </AttractionInfo>
              </AttractionHeader>
              <AttractionDescription>
                {attraction.description}
              </AttractionDescription>
            </AttractionCard>
          ))}
        </AttractionsList>
        
        {attractions.length === 0 && (
          <Flex direction="column" align="center" justify="center" style={{ height: '200px', color: theme.colors.textSecondary }}>
            <InfoOutlineIcon style={{ fontSize: '48px', marginBottom: theme.spacing.md }} />
            <p>No attractions available. Start by entering your preferences!</p>
          </Flex>
        )}
      </AttractionsPanel>
    </MapContainer>
  );
};

export default MapView;