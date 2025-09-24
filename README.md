# Hong Kong Tourism Planning Application

A professional web application that combines Hong Kong's real-time data (traffic, weather, government alerts) to create personalized tourism plans using AI-powered analysis.

## 🌟 Features

### Real-Time Data Integration
- **Weather Data**: Live temperature, humidity, air quality from Hong Kong Observatory
- **Traffic Information**: Real-time congestion levels and estimated travel times
- **Government Alerts**: Health, weather, and security alerts from HK government APIs
- **Time Display**: Hong Kong timezone with live updates

### AI-Powered Trip Planning
- **Natural Language Processing**: Analyze user text input to extract preferences
- **Smart Recommendations**: Personalized attraction suggestions based on budget, interests, and constraints
- **Dynamic Filtering**: Filter attractions by budget, accessibility needs, travel time, and categories

### Interactive Map Interface
- **Visual Attraction Display**: Interactive map with categorized markers
- **Traffic Overlay**: Toggle traffic conditions visualization
- **Route Planning**: Integrated transport planning with estimated times and costs
- **Responsive Design**: Professional UI that works on all devices

### User Input Options
- **Structured Preferences**: Budget, group size, transport mode, accessibility needs
- **Free Text Analysis**: "I want to visit cultural sites with my elderly parents, budget HK$500"
- **Category Selection**: Culture, Nature, Shopping, Food, Museums, etc.
- **Multi-language Support**: English and Traditional Chinese labels

## 🏗️ Architecture

### Frontend (React TypeScript)
```
Frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header/         # Top navigation with real-time data
│   │   ├── UserInput/      # Input forms and text analysis
│   │   ├── MapView/        # Interactive map with attractions
│   │   └── common/         # Shared components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API communication layer
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Helper functions
│   └── styles/             # Styled-components theme
```

### Backend (Node.js Express)
```
Backend/
├── src/
│   ├── controllers/        # API route handlers
│   ├── services/           # Business logic layer
│   ├── routes/             # Express route definitions
│   ├── models/             # Data models
│   └── utils/              # Server utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smart-tourism-thing.git
cd smart-tourism-thing
```

2. **Install Frontend Dependencies**
```bash
cd Frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd ../Backend
npm install
```

4. **Environment Configuration**
Create `.env` files in both Frontend and Backend directories:

**Frontend/.env**
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_WEATHER_API_KEY=your_weather_api_key
REACT_APP_MAPS_API_KEY=your_maps_api_key
```

**Backend/.env**
```env
PORT=3001
CLIENT_URL=http://localhost:3000
WEATHER_API_KEY=your_weather_api_key
TRAFFIC_API_KEY=your_traffic_api_key
```

### Running the Application

1. **Start the Backend Server**
```bash
cd Backend
npm run dev
```
Server will start at http://localhost:3001

2. **Start the Frontend Application**
```bash
cd Frontend
npm start
```
Application will open at http://localhost:3000

## 🎯 Usage

### Basic Usage
1. **View Real-Time Data**: Check the header for current weather, time, and alerts
2. **Enter Preferences**: Use either structured form or natural language input
3. **Get Recommendations**: View personalized attraction suggestions on the map
4. **Plan Routes**: Click attractions to see details and routing information

### Advanced Features
- **Text Analysis**: Try input like "Cultural sites for elderly visitors, budget HK$300"
- **Traffic Toggle**: Enable traffic overlay to see congestion levels
- **Accessibility Filters**: Enable wheelchair accessibility requirements
- **Multi-Modal Transport**: Choose between walking, driving, or public transport

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Styled-Components, React Icons
- **Backend**: Node.js, Express, CORS, Helmet
- **Maps**: Leaflet, React-Leaflet
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Date Handling**: date-fns

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "typescript": "^4.9.5",
  "styled-components": "^6.0.7",
  "axios": "^1.4.0",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "recharts": "^2.8.0",
  "date-fns": "^2.30.0",
  "framer-motion": "^10.16.4"
}
```

### Code Quality
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting and style enforcement
- **Prettier**: Automatic code formatting
- **Styled Components**: CSS-in-JS with theme support

## 🌐 API Integration

### Real-Time Data Sources
- **Hong Kong Observatory**: Weather and air quality data
- **Transport Department**: Traffic and road conditions
- **Government News API**: Official alerts and announcements
- **Google Maps API**: Routing and navigation

### Custom Endpoints
- `GET /api/weather/current` - Current weather conditions
- `GET /api/traffic/current` - Real-time traffic data
- `GET /api/attractions` - Tourist attractions with filtering
- `POST /api/ai/analyze-text` - Natural language processing
- `POST /api/trips/create` - Trip plan generation

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience with side-by-side layout
- **Tablet**: Stacked layout with touch-friendly interactions  
- **Mobile**: Optimized mobile interface with swipe gestures

## 🔒 Security Features

- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Server-side data validation
- **Helmet.js**: Security headers and XSS protection

## 🚦 Performance

- **Code Splitting**: Lazy loading for optimal bundle size
- **Debounced Search**: Efficient API calls during user input
- **Local Caching**: Smart caching of frequently accessed data
- **Image Optimization**: Responsive images with lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Hong Kong Observatory for weather data APIs
- Transport Department for traffic information
- Google Maps for mapping services
- React community for excellent libraries

---

**Built with ❤️ for Hong Kong Tourism**

Some hackathon shit we don't know yet
