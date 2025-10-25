# OpenStreetMap Integration for Delivery Radius

## Overview

This implementation provides a **frontend-only** solution for checking delivery availability using OpenStreetMap services. It eliminates the need for backend API calls and provides real-time location-based delivery validation.

## 🎯 Key Features

- ✅ **Frontend-only location checking** using OpenStreetMap
- ✅ **Real-time distance calculation** using Haversine formula
- ✅ **Address geocoding and reverse geocoding** via Nominatim API
- ✅ **Location search functionality** with service area validation
- ✅ **No backend dependencies** for location services
- ✅ **Offline-capable distance calculations**

## 📁 File Structure

```
src/
├── utils/
│   └── locationUtils.js              # Core location utilities
├── hooks/
│   ├── useDeliveryAvailability.js    # Updated hook (frontend-only)
│   └── useLocationServices.js       # Location services hook
├── components/
│   ├── LocationPicker/
│   │   └── LocationPicker.js        # Location picker with OpenStreetMap
│   └── LocationTest/
│       └── LocationTest.js          # Testing component
└── OPENSTREETMAP_INTEGRATION.md     # This documentation
```

## 🔧 Core Components

### 1. Location Utilities (`locationUtils.js`)

**Main Functions:**
- `checkDeliveryAvailability(userLocation)` - Check if location is within delivery radius
- `getAddressFromCoordinates(lat, lon)` - Get address from coordinates
- `searchPlaces(query, limit)` - Search for places using Nominatim
- `isWithinServiceArea(lat, lon)` - Check if coordinates are within service area

**Configuration:**
```javascript
const TIRUPATTUR_BUS_STAND = {
  latitude: 12.4962,
  longitude: 78.5696
};

const MAX_DELIVERY_RADIUS = 5; // 5km radius
```

### 2. Updated Delivery Availability Hook

**Before (Backend API):**
```javascript
const { availability, loading } = useDeliveryAvailability(location, productId, shopId);
```

**After (Frontend-only):**
```javascript
const { availability, loading } = useDeliveryAvailability(location);
```

**Benefits:**
- ✅ No network calls for location checking
- ✅ Instant availability results
- ✅ Works offline for distance calculations
- ✅ Simplified API

### 3. Location Services Hook (`useLocationServices.js`)

**Features:**
- GPS location access with permissions
- Address geocoding from coordinates
- Service area validation
- Error handling for location services

**Usage:**
```javascript
const {
  location,
  address,
  loading,
  getCurrentLocation,
  checkCurrentLocationDelivery,
  isCurrentLocationInServiceArea
} = useLocationServices();
```

### 4. Location Picker Component

**Features:**
- Real-time location search using OpenStreetMap
- Service area validation for search results
- Address selection with delivery availability
- Visual indicators for service area status

**Usage:**
```javascript
<LocationPicker
  onLocationSelect={handleLocationSelect}
  currentLocation={userLocation}
  showServiceAreaWarning={true}
/>
```

## 🌐 OpenStreetMap Services Used

### 1. Nominatim API (Geocoding)

**Reverse Geocoding:**
```
https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&addressdetails=1
```

**Place Search:**
```
https://nominatim.openstreetmap.org/search?format=json&q={query}&limit={limit}&addressdetails=1
```

### 2. Distance Calculation

**Haversine Formula Implementation:**
```javascript
const calculateDistanceBetween = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};
```

## 📱 Implementation Examples

### 1. Basic Delivery Check

```javascript
import { checkDeliveryAvailability } from '../utils/locationUtils';

const userLocation = {
  latitude: 12.5000,
  longitude: 78.5700
};

const availability = checkDeliveryAvailability(userLocation);

console.log(availability);
// Output:
// {
//   available: true,
//   message: "Order Available - Within 5km of Tirupattur Bus Stand (0.4km away)",
//   distance: 0.4,
//   reason: "available"
// }
```

### 2. Address Lookup

```javascript
import { getAddressFromCoordinates } from '../utils/locationUtils';

const addressInfo = await getAddressFromCoordinates(12.4962, 78.5696);
console.log(addressInfo.address);
// Output: "Tirupattur Bus Stand, Tirupattur, Tamil Nadu, India"
```

### 3. Location Search

```javascript
import { searchPlaces } from '../utils/locationUtils';

const results = await searchPlaces("Tirupattur", 5);
console.log(results);
// Output: Array of location objects with coordinates and addresses
```

### 4. Using Location Services Hook

```javascript
import useLocationServices from '../hooks/useLocationServices';

const LocationComponent = () => {
  const {
    location,
    address,
    loading,
    getCurrentLocation,
    checkCurrentLocationDelivery
  } = useLocationServices();

  const handleGetLocation = async () => {
    const currentLocation = await getCurrentLocation();
    if (currentLocation) {
      const deliveryStatus = await checkCurrentLocationDelivery();
      console.log('Delivery available:', deliveryStatus.available);
    }
  };

  return (
    <TouchableOpacity onPress={handleGetLocation}>
      <Text>Get My Location</Text>
    </TouchableOpacity>
  );
};
```

## 🧪 Testing

### Location Test Component

The `LocationTest` component provides comprehensive testing for the OpenStreetMap integration:

```javascript
import LocationTest from '../components/LocationTest/LocationTest';

// Test various locations around Tirupattur Bus Stand
// Validates distance calculations and service area checks
```

**Test Cases:**
- ✅ Tirupattur Bus Stand (center) - Should be available
- ✅ Near Bus Stand (1km) - Should be available  
- ✅ Within 5km (3km) - Should be available
- ✅ Edge of 5km (4.9km) - Should be available
- ❌ Outside 5km (6km) - Should not be available
- ❌ Far Outside (10km) - Should not be available

## 🔄 Migration from Backend API

### Before (Backend API):
```javascript
// Required backend API calls
const response = await fetch(`${API_URL}/v2/delivery/check-availability?lat=${lat}&lon=${lon}`);
const data = await response.json();
```

### After (OpenStreetMap):
```javascript
// Frontend-only calculation
const availability = checkDeliveryAvailability(userLocation);
```

## ⚡ Performance Benefits

1. **No Network Calls**: Instant location checking
2. **Offline Capable**: Distance calculations work without internet
3. **Reduced Server Load**: No backend API calls for location services
4. **Faster Response**: Immediate availability results
5. **Better UX**: No loading states for location checks

## 🛡️ Error Handling

### Location Permission Errors
```javascript
// Handle permission denied
if (error.code === 1) {
  Alert.alert('Permission Denied', 'Location access is required for delivery checking');
}
```

### Network Errors (for address lookup)
```javascript
// Handle OpenStreetMap API errors
try {
  const address = await getAddressFromCoordinates(lat, lon);
} catch (error) {
  console.log('Address lookup failed, using coordinates only');
}
```

### Calculation Errors
```javascript
// Handle distance calculation errors
try {
  const availability = checkDeliveryAvailability(location);
} catch (error) {
  console.log('Distance calculation failed');
}
```

## 📋 API Reference

### `checkDeliveryAvailability(userLocation)`
- **Parameters**: `userLocation` - Object with `latitude` and `longitude`
- **Returns**: Object with `available`, `message`, `distance`, `reason`
- **Example**: `{ available: true, message: "Order Available...", distance: 2.3, reason: "available" }`

### `getAddressFromCoordinates(latitude, longitude)`
- **Parameters**: `latitude`, `longitude` - Coordinate values
- **Returns**: Promise with address information
- **Example**: `{ success: true, address: "Tirupattur Bus Stand, ...", lat: 12.4962, lon: 78.5696 }`

### `searchPlaces(query, limit)`
- **Parameters**: `query` - Search string, `limit` - Max results (default: 5)
- **Returns**: Promise with array of location objects
- **Example**: `[{ display_name: "Tirupattur Bus Stand", lat: 12.4962, lon: 78.5696, ... }]`

### `isWithinServiceArea(latitude, longitude)`
- **Parameters**: `latitude`, `longitude` - Coordinate values
- **Returns**: Boolean indicating if within 5km radius
- **Example**: `true` or `false`

## 🚀 Future Enhancements

1. **Caching**: Cache address lookups for better performance
2. **Offline Maps**: Integrate with offline map tiles
3. **Route Optimization**: Add route calculation for delivery optimization
4. **Geofencing**: Implement geofencing for automatic location updates
5. **Analytics**: Track location-based user behavior

## 📞 Support

For issues with OpenStreetMap integration:
1. Check network connectivity for address lookups
2. Verify location permissions are granted
3. Test with the LocationTest component
4. Review console logs for error details

---

**Note**: This implementation uses OpenStreetMap's Nominatim service, which has usage policies. For production use, consider implementing rate limiting and caching strategies.
