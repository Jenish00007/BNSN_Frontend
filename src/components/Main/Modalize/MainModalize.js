import React, { useContext, useRef, useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, Text } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { MaterialIcons, AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import TextDefault from '../../Text/TextDefault/TextDefault';
import { alignment } from '../../../utils/alignment';
import { scale } from '../../../utils/scaling';
import styles from './styles';
import { useTranslation } from'react-i18next';
import { LocationContext } from '../../../context/Location';
import AuthContext from '../../../context/Auth';
import { API_URL } from '../../../config/api';

const MainModalize = ({
  modalRef,
  currentTheme,
  isLoggedIn,
  addressIcons,
  modalHeader,
  modalFooter,
  setAddressLocation,
  profile,
  location,
}) => {
  const { t } = useTranslation();
  const { token } = useContext(AuthContext);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const { setLocation } = useContext(LocationContext);

  // Fetch saved addresses
  const fetchSavedAddresses = async () => {
    if (!token) {
      return;
    }
    
    setAddressesLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/get-user-addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'zoneId': '[3,1]',
          latitude: '23.793544663762145',
          longitude: '90.41166342794895',
          'X-localization': 'en',
        },
      });
      
      const data = await response.json();
      if (response.ok && data.addresses) {
        setSavedAddresses(data.addresses);
      } else {
        setSavedAddresses([]);
      }
    } catch (error) {
      console.error('MainModalize: Error fetching saved addresses:', error);
      setSavedAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

    return (
    <Modalize
      ref={modalRef}
      modalStyle={styles(currentTheme).modal}
      modalHeight={400}
      overlayStyle={styles(currentTheme).overlay}
      handleStyle={styles(currentTheme).handle}
      handlePosition='inside'
      modalPosition='top'
      onOpen={() => fetchSavedAddresses()}
      openAnimationConfig={{
        timing: { duration: 400 },
        spring: { speed: 20, bounciness: 10 },
      }}
      closeAnimationConfig={{
        timing: { duration: 400 },
        spring: { speed: 20, bounciness: 10 },
      }}
      flatListProps={{
        data: useMemo(() => {
          const profileAddresses = (isLoggedIn && profile ? profile.addresses || [] : []);
          const allAddresses = [...profileAddresses, ...savedAddresses];
          return allAddresses;
        }, [isLoggedIn, profile, savedAddresses]),
        ListHeaderComponent: useMemo(() => modalHeader(), []),
        ListFooterComponent: useMemo(() => modalFooter(), []),
        showsVerticalScrollIndicator: false,
        keyExtractor: (item) => item._id || item.id,
        renderItem: useMemo(() => ({ item: address }) => (
          <View style={styles(currentTheme).addressbtn}>
            <TouchableOpacity
              style={styles(currentTheme).addressContainer}
              activeOpacity={0.7}
              onPress={() => {
                // Set as current location and close modal
                const locationData = {
                  label: 'selectedAddress',
                  latitude: address.latitude,
                  longitude: address.longitude,
                  deliveryAddress: address.deliveryAddress || address.address,
                  city: address.city || address.address,
                };
                setLocation(locationData);
                const modal = modalRef.current;
                modal?.close();
              }}
            >
              <View style={styles().addressSubContainer}>
                <View style={[styles(currentTheme).homeIcon]}>
                  {(() => {
                    try {
                      // Get the icon component with fallbacks
                      const IconComponent = addressIcons && address.addressType && addressIcons[address.addressType] 
                        ? addressIcons[address.addressType]
                        : addressIcons && addressIcons['Default']
                        ? addressIcons['Default']
                        : addressIcons && addressIcons['Other']
                        ? addressIcons['Other']
                        : null;
                      
                      // If we have a valid icon component, render it
                      if (IconComponent && typeof IconComponent === 'function') {
                        return React.createElement(IconComponent, {
                          fill: currentTheme.darkBgFont,
                        });
                      }
                      
                      // Fallback to a simple icon if no custom icon is available
                      return (
                        <SimpleLineIcons
                          name='home'
                          size={scale(20)}
                          color={currentTheme.darkBgFont}
                        />
                      );
                    } catch (error) {
                      console.error('Error rendering address icon:', error);
                      // Ultimate fallback
                      return (
                        <SimpleLineIcons
                          name='home'
                          size={scale(20)}
                          color={currentTheme.darkBgFont}
                        />
                      );
                    }
                  })()}
                </View>
                <View style={[styles().titleAddress]}>
                  <TextDefault
                    textColor={currentTheme.darkBgFont}
                    style={styles(currentTheme).labelStyle}
                  >
                    {t(address.addressType)}
                  </TextDefault>
                </View>
              </View>
              <View style={styles(currentTheme).addressTextContainer}>
                <View style={styles(currentTheme).addressDetail}>
                  <TextDefault
                    style={{ ...alignment.PLlarge }}
                    textColor={currentTheme.fontSecondColor}
                    small
                  >
                    {address.deliveryAddress || address.address || [address.address1, address.address2].filter(Boolean).join(', ')}
                  </TextDefault>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles().addressTick}>
              {address._id === location?._id &&
                ![t('currentLocation'), t('selectedLocation')].includes(location.label) && (
                  <MaterialIcons
                    name='check'
                    size={scale(25)}
                    color={currentTheme.iconColorPink}
                  />
                )}
            </View>
          </View>
        ),
        []),
      }}
    ></Modalize>
  );
};

export default MainModalize;