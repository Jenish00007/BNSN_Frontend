import React, { useContext, useState, useEffect } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import styles from './styles'
import ConfigurationContext from '../../../context/Configuration'
import { useNavigation } from '@react-navigation/native'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'
import { scale } from '../../../utils/scaling'
import { DAYS } from '../../../utils/enums'
import UserContext from '../../../context/User'
import Spinner from '../../Spinner/Spinner'
import { FlashMessage } from '../../../ui/FlashMessage/FlashMessage'
import { useTranslation } from 'react-i18next'
import { LocationContext } from '../../../context/Location'
import AuthContext from '../../../context/Auth'

function Item(props) {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { item, isStore, isFavourite: initialFavourite, onRemoveFromWishlist } = props
  const configuration = useContext(ConfigurationContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { location } = useContext(LocationContext)
  const { token } = useContext(AuthContext)

  const [isFavourite, setIsFavourite] = useState(true); // Always true in favorite screen
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize favourite state based on props
    if (item) {
      setIsFavourite(initialFavourite);
    }
  }, [initialFavourite]);

// Function to handle navigation based on item type
const handleNavigation = () => {
  if (isStore) {
    // Pass the entire store object as a parameter
    if (item.is_featured) {
      navigation.navigate('FeaturedStoreDetails', { 
        store: item,
        isFeatured: true
      });
    } else {
      navigation.navigate('Restaurant', { 
        store: item
      });
    }
  } else {
    // Pass the entire product object as a parameter
    navigation.navigate('ProductDetail', { 
      product: item 
    });
  }
};

// Add a second navigation method for stores - could be used from a different button
const handleSecondaryStoreNavigation = () => {
  if (isStore) {
    // Navigate to store products or offerings with full store details
    navigation.navigate('StoreProducts', { 
      store: item,
      category: 'all'
    });
  }
};

  // Function to handle adding/removing from wishlist
  const toggleWishlist = async () => {
    if (loading || !token) return;
    setLoading(true);

    try {
      let url;
      // Since we're in the favorites screen, we're removing items
      if (isStore) {
        url = `https://6ammart-admin.6amtech.com/api/v1/customer/wish-list/remove?store_id=${item.id}`;
      } else {
        url = `https://6ammart-admin.6amtech.com/api/v1/customer/wish-list/remove?item_id=${item.id}`;
      }

      const headers = {
        'moduleId': isStore ? '1' : '4', // Adjust based on your module IDs
        'zoneId': '[1]',
        'latitude': location?.latitude?.toString() || '23.79354466376145',
        'longitude': location?.longitude?.toString() || '90.41166342794895',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });

      const responseData = await response.json();
      console.log("API Response:", responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update wishlist');
      }
      
      FlashMessage({ message: responseData.message || t('removedFromFavorites') });
      
      // Call the callback to remove the item from parent component's state
      if (onRemoveFromWishlist) {
        onRemoveFromWishlist(item.id);
      }
    } catch (error) {     
      console.error('Wishlist update error:', error);
      FlashMessage({ message: t('somethingWentWrong'), type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <TouchableOpacity
      style={{ padding: scale(10) }}
      activeOpacity={0.8}
      onPress={handleNavigation}>
      <View key={item.id} style={styles().mainContainer}>
        <View style={[styles(currentTheme).restaurantContainer]}>
          <View style={styles().imageContainer}>
            <Image
              resizeMode="cover"
              source={{ uri:item.cover_photo_full_url }}
              style={styles().img}
            />
            <View style={styles().overlayRestaurantContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={loading}
                style={styles(currentTheme).favOverlay}
                onPress={toggleWishlist}>
                {loading ? (
                  <Spinner size={'small'} backColor={'transparent'} spinnerColor={currentTheme.iconColorDark} />
                ) : (
                  <AntDesign
                    name={isFavourite ? 'heart' : 'hearto'}
                    size={scale(15)}
                    color={isFavourite ? 'red' : 'black'} 
                    style={{ opacity: 1 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles().descriptionContainer}>
            <View style={styles().aboutRestaurant}>
              <TextDefault
                style={{ width: '77%' }}
                H4
                numberOfLines={1}
                textColor={currentTheme.fontThirdColor}
                bolder>
                {item.name}
              </TextDefault>
              <View style={[styles().aboutRestaurant, { width: '23%' }]}>
                <Feather name="star" size={18} color={currentTheme.newIconColor} />
                <TextDefault
                  textColor={currentTheme.fontThirdColor}
                  H4
                  bolder
                  style={{ marginLeft: scale(2), marginRight: scale(5) }}
                >
                  {item.avg_rating || "0.0"}
                </TextDefault>
                <TextDefault
                  textColor={currentTheme.fontNewColor}
                  style={{ marginLeft: scale(2) }}
                  H5>
                  ({item.rating_count || 0})
                </TextDefault>
              </View>
            </View>
            <TextDefault
              style={styles().offerCategoty}
              numberOfLines={1}
              bold
              Normal
              textColor={currentTheme.fontNewColor}
            >
              {item?.address || (isStore ? t('store') : t('item'))}
            </TextDefault>
            <View style={styles().priceRestaurant}>
              {isStore && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    justifyContent: 'center',
                    marginRight: 18
                  }}>
                  <AntDesign name="clockcircleo" size={16}
                    color={currentTheme.fontNewColor} />
                  <TextDefault
                    textColor={currentTheme.fontNewColor}
                    numberOfLines={1}
                    bold
                    Normal>
                    {item.delivery_time || t('30-40 min')}
                  </TextDefault>
                </View>
              )}
              {isStore && (
                <TouchableOpacity
                  onPress={handleSecondaryStoreNavigation}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: currentTheme.newClickableColor,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 5
                  }}>
                  <TextDefault
                    textColor={currentTheme.tagColor}
                    numberOfLines={1}
                    bold
                    Small>
                    {t('viewProducts')}
                  </TextDefault>
                </TouchableOpacity>
              )}
              {!isStore && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    justifyContent: 'center',
                    marginRight: 10
                  }}>
                  <TextDefault
                    style={styles().offerCategoty}
                    textColor={currentTheme.fontNewColor}
                    numberOfLines={1}
                    bold
                    Normal>
                    {item?.price ? `${configuration.currencySymbol} ${item.price}` : ''}
                  </TextDefault>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default Item