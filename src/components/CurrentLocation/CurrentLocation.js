import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppBranding } from '../../utils/translationHelper';
import { getAddressFromCoordinates } from '../../utils/locationUtils';

const CurrentLocation = ({ 
  location, 
  onLocationPress,
  showAddress = true,
  showCoordinates = true,
  compact = false 
}) => {
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useAppBranding();
  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    if (location && showAddress) {
      loadAddress();
    }
  }, [location, showAddress]);

  const loadAddress = async () => {
    if (!location || !location.latitude || !location.longitude) return;

    setLoadingAddress(true);
    try {
      const addressInfo = await getAddressFromCoordinates(location.latitude, location.longitude);
      if (addressInfo.success) {
        setAddress(addressInfo.address);
      }
    } catch (error) {
      console.error('Error loading address:', error);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleLocationPress = () => {
    if (onLocationPress) {
      onLocationPress(location);
    }
  };

  if (!location || !location.latitude || !location.longitude) {
    return (
      <View style={[styles.container, { backgroundColor: '#f8d7da', borderColor: '#f5c6cb' }]}>
        <Icon name="location-off" size={16} color="#721c24" />
        <Text style={[styles.noLocationText, { color: '#721c24' }]}>
          Location not available
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: backgroundColor, borderColor: secondaryColor }]}
      onPress={handleLocationPress}
      disabled={!onLocationPress}
    >
      <Icon name="my-location" size={16} color={primaryColor} />
      <View style={styles.content}>
        {showAddress && (
          <View style={styles.addressSection}>
            {loadingAddress ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={primaryColor} />
                <Text style={[styles.loadingText, { color: textColor }]}>
                  Getting address...
                </Text>
              </View>
            ) : address ? (
              <Text style={[styles.addressText, { color: textColor }]} numberOfLines={compact ? 1 : 2}>
                {address}
              </Text>
            ) : (
              <Text style={[styles.noAddressText, { color: textColor }]}>
                Address not available
              </Text>
            )}
          </View>
        )}
        
        {showCoordinates && (
          <Text style={[styles.coordinatesText, { color: textColor }]}>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      
      {onLocationPress && (
        <Icon name="chevron-right" size={16} color={textColor} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 4,
  },
  content: {
    flex: 1,
    marginLeft: 8,
  },
  addressSection: {
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noAddressText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  coordinatesText: {
    fontSize: 12,
    opacity: 0.8,
    fontFamily: 'monospace',
  },
  noLocationText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default CurrentLocation;
