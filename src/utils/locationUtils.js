// Location utilities using OpenStreetMap
import { calculateDistance } from './customFunctions';

// Tirupattur Bus Stand coordinates
const TIRUPATTUR_BUS_STAND = {
  latitude: 12.4962,
  longitude:  78.5696
};

// Maximum delivery radius in kilometers
const MAX_DELIVERY_RADIUS = 5000;


/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */


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

/**
 * Convert degrees to radians
 * @param {number} value - Value in degrees
 * @returns {number} Value in radians
 */
const toRad = (value) => {
  return (value * Math.PI) / 180;
};

/**
 * Check if user location is within delivery radius of Tirupattur Bus Stand
 * @param {Object} userLocation - User location object with latitude and longitude
 * @returns {Object} Delivery availability information
 */
export const checkDeliveryAvailability = (userLocation) => {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return {
      available: false,
      message: 'Please enable location access to check delivery availability',
      distance: null,
      reason: 'no_location'
    };
  }

  try {
    const distance = calculateDistanceBetween(
      userLocation.latitude,
      userLocation.longitude,
      TIRUPATTUR_BUS_STAND.latitude,
      TIRUPATTUR_BUS_STAND.longitude
    );

    const isWithinRadius = distance <= MAX_DELIVERY_RADIUS;

    return {
      available: isWithinRadius,
      message: isWithinRadius 
        ? `Order Available - Within 5km of Tirupattur Bus Stand (${distance.toFixed(1)}km from your current location)`
        : `Not available for your current location - ${distance.toFixed(1)}km away (max 5km from Tirupattur Bus Stand)`,
      distance: parseFloat(distance.toFixed(2)),
      reason: isWithinRadius ? 'available' : 'outside_radius',
      userLocation: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      }
    };
  } catch (error) {
    console.error('Error calculating delivery availability:', error);
    return {
      available: false,
      message: 'Error checking delivery availability',
      distance: null,
      reason: 'calculation_error'
    };
  }
};

/**
 * Get address information using OpenStreetMap Nominatim API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Address information
 */
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MultiVendorApp/1.0' // Required by Nominatim
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address information');
    }

    const data = await response.json();
    
    return {
      success: true,
      address: data.display_name,
      addressDetails: data.address,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon)
    };
  } catch (error) {
    console.error('Error fetching address:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Search for places using OpenStreetMap Nominatim API
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Array of search results
 */
export const searchPlaces = async (query, limit = 5) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MultiVendorApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search places');
    }

    const data = await response.json();
    
    return data.map(place => ({
      display_name: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      address: place.address,
      place_id: place.place_id
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

/**
 * Check if coordinates are within Tirupattur service area
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {boolean} True if within service area
 */
export const isWithinServiceArea = (latitude, longitude) => {
  const distance = calculateDistanceBetween(
    latitude,
    longitude,
    TIRUPATTUR_BUS_STAND.latitude,
    TIRUPATTUR_BUS_STAND.longitude
  );
  
  return distance <= MAX_DELIVERY_RADIUS;
};

export default {
  checkDeliveryAvailability,
  getAddressFromCoordinates,
  searchPlaces,
  isWithinServiceArea,
  TIRUPATTUR_BUS_STAND,
  MAX_DELIVERY_RADIUS
};
