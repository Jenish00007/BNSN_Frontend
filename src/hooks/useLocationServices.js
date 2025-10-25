import { useState, useEffect, useCallback } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { 
  checkDeliveryAvailability, 
  getAddressFromCoordinates, 
  isWithinServiceArea 
} from '../utils/locationUtils';

const useLocationServices = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to check delivery availability.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionGranted(true);
          return true;
        } else {
          setPermissionGranted(false);
          return false;
        }
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    } else {
      // iOS permission handling
      setPermissionGranted(true);
      return true;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!permissionGranted) {
      const granted = await requestLocationPermission();
      if (!granted) {
        setError('Location permission denied');
        return null;
      }
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationData = {
              latitude,
              longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };

            setLocation(locationData);

            // Get address from coordinates
            const addressInfo = await getAddressFromCoordinates(latitude, longitude);
            if (addressInfo.success) {
              setAddress(addressInfo.address);
            }

            setLoading(false);
            resolve(locationData);
          } catch (err) {
            console.error('Location processing error:', err);
            setError('Failed to process location');
            setLoading(false);
            reject(err);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case 1:
              errorMessage = 'Location permission denied';
              break;
            case 2:
              errorMessage = 'Location unavailable';
              break;
            case 3:
              errorMessage = 'Location request timeout';
              break;
            default:
              errorMessage = 'Location service error';
          }

          setError(errorMessage);
          setLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    });
  }, [permissionGranted, requestLocationPermission]);

  // Check delivery availability for current location
  const checkCurrentLocationDelivery = useCallback(async () => {
    if (!location) {
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) return null;
    }

    return checkDeliveryAvailability(location);
  }, [location, getCurrentLocation]);

  // Check if current location is within service area
  const isCurrentLocationInServiceArea = useCallback(() => {
    if (!location) return false;
    return isWithinServiceArea(location.latitude, location.longitude);
  }, [location]);

  // Get formatted address
  const getFormattedAddress = useCallback(() => {
    if (!address) return 'Address not available';
    return address;
  }, [address]);

  // Clear location data
  const clearLocation = useCallback(() => {
    setLocation(null);
    setAddress(null);
    setError(null);
  }, []);

  // Initialize location services
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        await requestLocationPermission();
      } catch (err) {
        console.error('Location initialization error:', err);
      }
    };

    initializeLocation();
  }, [requestLocationPermission]);

  return {
    // State
    location,
    address,
    loading,
    error,
    permissionGranted,
    
    // Actions
    getCurrentLocation,
    checkCurrentLocationDelivery,
    isCurrentLocationInServiceArea,
    getFormattedAddress,
    clearLocation,
    requestLocationPermission,
    
    // Utilities
    isWithinServiceArea: (lat, lon) => isWithinServiceArea(lat, lon),
    checkDeliveryAvailability: (userLocation) => checkDeliveryAvailability(userLocation)
  };
};

export default useLocationServices;
