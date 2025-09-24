/**
 * Header Component - Top navigation bar with real-time data
 * Displays HKINFO branding and live data feeds (weather, time, alerts)
 */

import React from 'react';
import styled from 'styled-components';
import { 
  ThermometerIcon,
  TimeIcon,
  SunnyIcon,
  RainIcon,
  CloudyIcon,
  WindIcon,
  TyphoonIcon,
  ErrorIcon,
  WarningIcon,
  InfoIcon
} from '../common/Icons';
import { theme } from '../../styles/theme';
import { HeaderProps, GovernmentAlert } from '../../types';
import { Container, Flex } from '../../styles/theme';

const HeaderContainer = styled.header`
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.surfaceDark};
  box-shadow: ${theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
  backdrop-filter: blur(8px);
`;

const HeaderContent = styled(Container)`
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  h1 {
    font-family: ${theme.typography.fontFamily.heading};
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.primary};
    margin: 0;
    
    span {
      color: ${theme.colors.secondary};
    }
  }
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.lg};
`;

const RealTimeData = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing.md};
  }
`;

const WeatherSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  background: ${theme.colors.background};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.surfaceDark};
`;

const AlertsContainer = styled.div`
  position: relative;
  width: 400px;
  height: 36px;
  overflow: hidden;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.surfaceDark};
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 320px;
    height: 32px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 250px;
    height: 28px;
  }
`;

const AlertsSlider = styled.div<{ alertCount: number }>`
  display: flex;
  animation: ${({ alertCount }) => alertCount > 1 ? 'slide 15s infinite linear' : 'none'};
  width: 100%;
  
  @keyframes slide {
    0% { transform: translateX(0); }
    20% { transform: translateX(0); }
    25% { transform: translateX(-100%); }
    45% { transform: translateX(-100%); }
    50% { transform: translateX(-200%); }
    70% { transform: translateX(-200%); }
    75% { transform: translateX(-300%); }
    95% { transform: translateX(-300%); }
    100% { transform: translateX(0); }
  }
`;

const AlertItem = styled.div<{ level: 'info' | 'warning' | 'critical'; alertType?: string }>`
  min-width: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  white-space: nowrap;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  
  ${({ level, alertType }) => {
    // Special styling for typhoon signals
    if (alertType === 'typhoon') {
      return `
        color: white;
        background: linear-gradient(135deg, #D32F2F, #B71C1C);
        border: 2px solid #FF5722;
        animation: typhoonPulse 2s infinite;
        
        @keyframes typhoonPulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.7);
          }
          50% { 
            box-shadow: 0 0 0 8px rgba(255, 87, 34, 0);
          }
        }
      `;
    }
    
    switch (level) {
      case 'critical':
        return `
          color: white;
          background: ${theme.colors.error};
          animation: criticalBlink 1.5s infinite;
          
          @keyframes criticalBlink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.7; }
          }
        `;
      case 'warning':
        return `
          color: ${theme.colors.warning};
          background: ${theme.colors.warning}15;
          border: 1px solid ${theme.colors.warning}40;
        `;
      default:
        return `
          color: ${theme.colors.info};
          background: ${theme.colors.info}10;
          border: 1px solid ${theme.colors.info}30;
        `;
    }
  }}
  
  .alert-icon {
    font-size: 16px;
    flex-shrink: 0;
  }
`;

const DataItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
  
  svg {
    font-size: ${theme.typography.fontSize.xl};
    color: ${theme.colors.secondary};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    span {
      display: none;
    }
  }
`;

const WeatherIcon = styled.div<{ condition: string }>`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.secondary};
  
  ${({ condition }) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return `color: #FFA000;`;
      case 'rainy':
      case 'rain':
        return `color: #1976D2;`;
      case 'cloudy':
      case 'overcast':
        return `color: #757575;`;
      default:
        return `color: ${theme.colors.secondary};`;
    }
  }}
`;

const AlertBadge = styled.div<{ level: 'info' | 'warning' | 'critical' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ level }) => {
    switch (level) {
      case 'critical':
        return `
          background: ${theme.colors.error}15;
          color: ${theme.colors.error};
          border: 1px solid ${theme.colors.error}30;
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning}15;
          color: ${theme.colors.warning};
          border: 1px solid ${theme.colors.warning}30;
        `;
      default:
        return `
          background: ${theme.colors.info}15;
          color: ${theme.colors.info};
          border: 1px solid ${theme.colors.info}30;
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
  
  svg {
    font-size: ${theme.typography.fontSize.base};
  }
`;

const TimeDisplay = styled.div`
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
`;

// Helper function to get weather icon
const getWeatherIcon = (condition: string | number) => {
  // Handle both string conditions and numeric codes
  const conditionStr = typeof condition === 'string' ? condition.toLowerCase() : String(condition);
  
  switch (conditionStr) {
    case 'sunny':
    case 'clear':
    case '50':
      return <SunnyIcon />;
    case 'rainy':
    case 'rain':
    case 'heavy-rain':
    case '61':
    case '62':
    case '63':
    case '64':
      return <RainIcon />;
    case 'cloudy':
    case 'partly-cloudy':
    case 'overcast':
    case '51':
    case '52':
    case '53':
    case '54':
    case '60':
    case '76':
    case '77':
      return <CloudyIcon />;
    case 'thunderstorm':
    case '65':
      return <RainIcon />; // Could use a thunderstorm icon if available
    case 'typhoon':
    case 'hurricane':
      return <TyphoonIcon />;
    case 'windy':
      return <WindIcon />;
    case 'foggy':
    case '70':
    case '71':
    case '72':
    case '73':
    case '74':
    case '75':
      return <CloudyIcon />; // Could use a fog icon if available
    default:
      return <SunnyIcon />;
  }
};

// Helper function to get alert icon
const getAlertIcon = (level: string) => {
  switch (level) {
    case 'critical':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    default:
      return <InfoIcon />;
  }
};

// Helper function to format time
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-HK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(':', '');
};

// Helper function to truncate long alert messages
const truncateAlertMessage = (message: string, maxLength: number = 60): string => {
  if (message.length <= maxLength) return message;
  
  // Try to find a good breaking point (after a word)
  const truncated = message.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

export const Header: React.FC<HeaderProps> = ({ realTimeData }) => {
  const currentTime = new Date();
  const { weather, alerts } = realTimeData;

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <LogoIcon>HK</LogoIcon>
          <h1>
            HK<span>INFO</span>
          </h1>
        </Logo>
        
        <RealTimeData>
          {/* Weather Section */}
          <WeatherSection>
            <WeatherIcon condition={weather.icon}>
              {getWeatherIcon(weather.icon)}
            </WeatherIcon>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{weather.temperature}°C</div>
              <div style={{ fontSize: '0.8rem', color: theme.colors.textSecondary }}>{weather.icon}</div>
            </div>
          </WeatherSection>
          
          {/* Additional Weather Info */}
          <DataItem>
            <WindIcon />
            <span>H:{weather.humidity}%</span>
          </DataItem>
          
          {/* Time Display */}
          <DataItem>
            <TimeIcon />
            <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
          </DataItem>
          
          {/* Government Alerts Slider */}
          {alerts.length > 0 && (
            <AlertsContainer title="Government Alerts - Click to view details">
              <AlertsSlider alertCount={alerts.length}>
                {alerts.map((alert, index) => (
                  <AlertItem 
                    key={`${alert.id}-${index}`}
                    level={alert.level as 'info' | 'warning' | 'critical'}
                    alertType={alert.type}
                    title={alert.message || alert.title} // Show full message on hover
                  >
                    <span className="alert-icon">{alert.icon || getAlertIcon(alert.level)}</span>
                    <span>{truncateAlertMessage(alert.title || alert.message || 'Weather Alert', 50)}</span>
                  </AlertItem>
                ))}
                {/* Duplicate first alert for smooth loop if multiple alerts */}
                {alerts.length > 1 && (
                  <AlertItem 
                    key={`${alerts[0].id}-duplicate`}
                    level={alerts[0].level as 'info' | 'warning' | 'critical'}
                    alertType={alerts[0].type}
                    title={alerts[0].message || alerts[0].title} // Show full message on hover
                  >
                    <span className="alert-icon">{alerts[0].icon || getAlertIcon(alerts[0].level)}</span>
                    <span>{truncateAlertMessage(alerts[0].title || alerts[0].message || 'Weather Alert', 50)}</span>
                  </AlertItem>
                )}
              </AlertsSlider>
            </AlertsContainer>
          )}
        </RealTimeData>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;