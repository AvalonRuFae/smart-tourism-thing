/**
 * Icon Components - Wrapper components for react-icons to fix TypeScript issues
 * This approach ensures proper JSX element types by using TypeScript ignore comments
 */

import React from 'react';
import {
  WiThermometer,
  WiTime3, 
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiStrongWind
} from 'react-icons/wi';
import {
  MdWarning,
  MdInfo,
  MdError,
  MdRestaurant,
  MdMuseum,
  MdShoppingBag,
  MdNature,
  MdLocationOn,
  MdTraffic,
  MdStar,
  MdAccessTime,
  MdAttachMoney,
  MdInfoOutline,
  MdDirectionsWalk,
  MdDirectionsCar,
  MdDirectionsTransit,
  MdSearch,
  MdGroup,
  MdChildFriendly,
  MdAccessible
} from 'react-icons/md';

interface IconProps {
  style?: React.CSSProperties;
  className?: string;
}

// Weather Icons
// @ts-ignore
export const ThermometerIcon: React.FC<IconProps> = (props) => <WiThermometer {...props} />;
// @ts-ignore
export const TimeIcon: React.FC<IconProps> = (props) => <WiTime3 {...props} />;
// @ts-ignore
export const SunnyIcon: React.FC<IconProps> = (props) => <WiDaySunny {...props} />;
// @ts-ignore
export const RainIcon: React.FC<IconProps> = (props) => <WiRain {...props} />;
// @ts-ignore
export const CloudyIcon: React.FC<IconProps> = (props) => <WiCloudy {...props} />;
// @ts-ignore
export const WindIcon: React.FC<IconProps> = (props) => <WiStrongWind {...props} />;
// @ts-ignore
export const TyphoonIcon: React.FC<IconProps> = (props) => <WiStrongWind {...props} />;

// Alert Icons
// @ts-ignore
export const ErrorIcon: React.FC<IconProps> = (props) => <MdError {...props} />;
// @ts-ignore
export const WarningIcon: React.FC<IconProps> = (props) => <MdWarning {...props} />;
// @ts-ignore
export const InfoIcon: React.FC<IconProps> = (props) => <MdInfo {...props} />;

// Attraction Icons
// @ts-ignore
export const RestaurantIcon: React.FC<IconProps> = (props) => <MdRestaurant {...props} />;
// @ts-ignore
export const MuseumIcon: React.FC<IconProps> = (props) => <MdMuseum {...props} />;
// @ts-ignore
export const ShoppingIcon: React.FC<IconProps> = (props) => <MdShoppingBag {...props} />;
// @ts-ignore
export const NatureIcon: React.FC<IconProps> = (props) => <MdNature {...props} />;
// @ts-ignore
export const LocationIcon: React.FC<IconProps> = (props) => <MdLocationOn {...props} />;
// @ts-ignore
export const TrafficIcon: React.FC<IconProps> = (props) => <MdTraffic {...props} />;
// @ts-ignore
export const StarIcon: React.FC<IconProps> = (props) => <MdStar {...props} />;
// @ts-ignore
export const ClockIcon: React.FC<IconProps> = (props) => <MdAccessTime {...props} />;
// @ts-ignore
export const MoneyIcon: React.FC<IconProps> = (props) => <MdAttachMoney {...props} />;
// @ts-ignore
export const InfoOutlineIcon: React.FC<IconProps> = (props) => <MdInfoOutline {...props} />;

// Transport Icons
// @ts-ignore
export const WalkIcon: React.FC<IconProps> = (props) => <MdDirectionsWalk {...props} />;
// @ts-ignore
export const CarIcon: React.FC<IconProps> = (props) => <MdDirectionsCar {...props} />;
// @ts-ignore
export const TransitIcon: React.FC<IconProps> = (props) => <MdDirectionsTransit {...props} />;

// UI Icons
// @ts-ignore
export const SearchIcon: React.FC<IconProps> = (props) => <MdSearch {...props} />;
// @ts-ignore
export const GroupIcon: React.FC<IconProps> = (props) => <MdGroup {...props} />;
// @ts-ignore
export const ChildIcon: React.FC<IconProps> = (props) => <MdChildFriendly {...props} />;
// @ts-ignore
export const AccessibleIcon: React.FC<IconProps> = (props) => <MdAccessible {...props} />;