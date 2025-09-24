# Hong Kong Tourism Attractions Schema

This document defines the required structure for the `attractions.json` file.

## File Structure

```json
{
  "version": "string (required)",
  "lastUpdated": "string (required - YYYY-MM-DD format)",
  "description": "string (required)",
  "instructions": "object (optional)",
  "schema": "object (optional)",
  "attractions": "array (required)"
}
```

## Attraction Object Schema

### Required Fields
These fields must be present and cannot be null:

- `id`: `string` - Unique identifier for the attraction
- `name`: `string` - Display name of the attraction
- `description`: `string` - Brief description (recommended 100-200 characters)
- `location`: `object` - Geographic coordinates
  - `lat`: `number` - Latitude in decimal degrees (required)
  - `lng`: `number` - Longitude in decimal degrees (required)
  - `address`: `string` - Full address (optional but recommended)
- `category`: `string` - Must be one of: `nature`, `cultural`, `entertainment`, `shopping`, `food`, `historical`, `adventure`, `religious`, `museum`, `nightlife`
- `priceRange`: `string` - Must be one of: `free`, `low`, `medium`, `high`
- `rating`: `number` - Rating between 1.0 and 5.0
- `estimatedVisitTime`: `number` - Time in minutes

### Optional Fields
These fields can be omitted or set to null:

- `imageUrl`: `string` - Path to attraction image (defaults to placeholder if null)
- `tags`: `array of strings` - Searchable keywords (defaults to empty array)
- `accessibility`: `object` - Accessibility information
  - `wheelchairAccessible`: `boolean` - Can be null (defaults to false)
  - `hasElevator`: `boolean` - Can be null (defaults to false)
  - `hasRestrooms`: `boolean` - Can be null (defaults to false)
  - `audioGuide`: `boolean` - Can be null (defaults to false)
- `openingHours`: `object` - Operating hours for each day
  - Can be omitted entirely if attraction is always open
  - Each day: `{ "open": "HH:MM", "close": "HH:MM", "isClosed": boolean }`

## Example Minimal Attraction

```json
{
  "id": "example-attraction",
  "name": "Example Attraction", 
  "description": "A sample attraction for demonstration purposes",
  "location": {
    "lat": 22.2855,
    "lng": 114.1577
  },
  "category": "cultural",
  "priceRange": "free",
  "rating": 4.2,
  "estimatedVisitTime": 60
}
```

## Example Full Attraction

```json
{
  "id": "full-example",
  "name": "Complete Example Attraction",
  "description": "A fully detailed attraction with all optional fields",
  "location": {
    "lat": 22.2855,
    "lng": 114.1577,
    "address": "123 Example Street, Hong Kong"
  },
  "category": "museum",
  "priceRange": "medium", 
  "rating": 4.7,
  "imageUrl": "/images/full-example.jpg",
  "tags": ["history", "interactive", "family-friendly"],
  "openingHours": {
    "monday": { "open": "09:00", "close": "18:00", "isClosed": false },
    "tuesday": { "open": "09:00", "close": "18:00", "isClosed": false },
    "wednesday": { "open": "09:00", "close": "18:00", "isClosed": false },
    "thursday": { "open": "09:00", "close": "18:00", "isClosed": false },
    "friday": { "open": "09:00", "close": "18:00", "isClosed": false },
    "saturday": { "open": "10:00", "close": "17:00", "isClosed": false },
    "sunday": { "open": "00:00", "close": "00:00", "isClosed": true }
  },
  "estimatedVisitTime": 120,
  "accessibility": {
    "wheelchairAccessible": true,
    "hasElevator": true,
    "hasRestrooms": true,
    "audioGuide": false
  }
}
```

## Coordinate Guidelines

- Use decimal degrees format (not degrees/minutes/seconds)
- Hong Kong coordinates typically range:
  - Latitude: 22.1 to 22.6
  - Longitude: 113.8 to 114.5
- Ensure coordinates are accurate - map pins will be placed exactly at these coordinates
- Test coordinates in Google Maps before adding to the JSON file

## Category Descriptions

- `nature`: Parks, beaches, mountains, hiking trails
- `cultural`: Museums, temples, heritage sites
- `entertainment`: Theme parks, theaters, cinemas
- `shopping`: Malls, markets, shopping districts
- `food`: Restaurants, food courts, specialty dining
- `historical`: Historical buildings, monuments
- `adventure`: Adventure sports, outdoor activities
- `religious`: Temples, churches, religious sites
- `museum`: All types of museums and galleries
- `nightlife`: Bars, clubs, night markets

## Price Range Guidelines

- `free`: No admission fee
- `low`: Under HK$100 per person
- `medium`: HK$100-300 per person
- `high`: Over HK$300 per person