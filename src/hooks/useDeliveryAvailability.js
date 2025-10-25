import { useState, useEffect, useCallback } from 'react';
import { checkDeliveryAvailability } from '../utils/locationUtils';

const useDeliveryAvailability = (userLocation) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAvailability = useCallback(async () => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      setAvailability({
        available: false,
        message: 'Location is required',
        reason: 'no_location'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use frontend-only location checking with OpenStreetMap
      const availabilityData = checkDeliveryAvailability(userLocation);
      
      setAvailability(availabilityData);
    } catch (err) {
      console.error('Delivery availability check error:', err);
      setError('Error checking delivery availability');
      setAvailability({
        available: false,
        message: 'Service unavailable',
        reason: 'calculation_error'
      });
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      checkAvailability();
    }
  }, [checkAvailability]);

  const refreshAvailability = useCallback(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    availability,
    loading,
    error,
    refreshAvailability,
    checkAvailability
  };
};

export default useDeliveryAvailability;
