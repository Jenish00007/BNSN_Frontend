import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppBranding } from '../../utils/translationHelper';
import { API_URL } from '../../utils/constants';

const DeliveryAvailability = ({ 
  productId, 
  shopId, 
  userLocation, 
  onAvailabilityChange,
  showAsModal = false,
  children 
}) => {
  const { t } = useTranslation();
  const { primaryColor, textColor, backgroundColor } = useAppBranding();
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      checkDeliveryAvailability();
    }
  }, [userLocation, productId, shopId]);

  const checkDeliveryAvailability = async () => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      setAvailability({
        available: false,
        message: t('locationRequired'),
        reason: 'no_location'
      });
      return;
    }

    setLoading(true);
    try {
      let url = '';
      if (productId) {
        url = `${API_URL}/v2/delivery/product-availability/${productId}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
      } else if (shopId) {
        url = `${API_URL}/v2/delivery/check-availability?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&shopId=${shopId}`;
      } else {
        url = `${API_URL}/v2/delivery/check-availability?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        let availabilityData;
        if (productId) {
          availabilityData = {
            available: data.delivery.available,
            message: data.delivery.message,
            distance: data.delivery.distance,
            reason: data.delivery.reason
          };
        } else if (shopId) {
          const shopResult = data.availability.find(item => item.shopId === shopId);
          availabilityData = shopResult ? {
            available: shopResult.available,
            message: shopResult.message,
            distance: shopResult.distance,
            reason: shopResult.reason
          } : {
            available: false,
            message: t('shopNotFound'),
            reason: 'shop_not_found'
          };
        } else {
          // General availability check
          availabilityData = {
            available: data.availableShops > 0,
            message: data.availableShops > 0 
              ? t('deliveryAvailable', { count: data.availableShops })
              : t('noDeliveryAvailable'),
            distance: null,
            reason: data.availableShops > 0 ? 'available' : 'no_shops'
          };
        }

        setAvailability(availabilityData);
        if (onAvailabilityChange) {
          onAvailabilityChange(availabilityData);
        }
      } else {
        setAvailability({
          available: false,
          message: data.message || t('deliveryCheckFailed'),
          reason: 'api_error'
        });
      }
    } catch (error) {
      console.error('Delivery availability check error:', error);
      setAvailability({
        available: false,
        message: t('deliveryCheckFailed'),
        reason: 'network_error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationPermission = () => {
    Alert.alert(
      t('locationPermissionTitle'),
      t('locationPermissionMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('settings'), onPress: () => {
          // Navigate to settings or location screen
          // This would depend on your navigation structure
        }}
      ]
    );
  };

  const renderAvailabilityStatus = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            {t('checkingDelivery')}
          </Text>
        </View>
      );
    }

    if (!availability) {
      return null;
    }

    // Only show positive availability status
    if (!availability.available) {
      return null;
    }

    const isAvailable = availability.available;
    const statusColor = '#4CAF50';
    const statusIcon = '✓';

    return (
      <View style={[styles.availabilityContainer, { borderColor: statusColor }]}>
        <View style={styles.statusRow}>
          <Text style={[styles.statusIcon, { color: statusColor }]}>
            {statusIcon}
          </Text>
          <Text style={[styles.statusText, { color: textColor }]}>
            {availability.message}
          </Text>
        </View>
        
        {availability.distance && (
          <Text style={[styles.distanceText, { color: textColor }]}>
            {t('distance')}: {availability.distance.toFixed(1)} km
          </Text>
        )}
      </View>
    );
  };

  if (showAsModal) {
    return (
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {t('deliveryAvailability')}
            </Text>
            {renderAvailabilityStatus()}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: primaryColor }]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      {children}
      {renderAvailabilityStatus()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  availabilityContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#f9f9f9',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    flex: 1,
  },
  distanceText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  permissionButton: {
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DeliveryAvailability;
