import React from 'react';

import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AddToFavourites from '../Favourites/AddtoFavourites';
import { useAppBranding } from '../../utils/translationHelper';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.62; // 62% of screen width
const CARD_HEIGHT = 260;

// CategoryListView component
const CategoryListView = ({ data }) => {

  const navigation = useNavigation();
  const branding = useAppBranding();
  
  const styles = stylesFn(branding);

  // Check if data is properly passed
  if (!data) {
    return null;
  }

  const { index, item } = data;

  // Ensure item is defined before rendering
  if (!item) {
    return null;
  }

  // Function to truncate text
  const truncateText = (text, maxLength = 30) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text || '';
  };

  // Function to get unit count display
  const getUnitCountDisplay = () => {
    const { unitCount, unit, quantity, weight } = item || {};
    if (unitCount && unit) {
      return `${unitCount} ${unit}`;
    }
    if (quantity) {
      return `${quantity} Pcs`;
    }
    if (weight) {
      return weight;
    }
    if (unit) {
      return unit;
    }
    return null;
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    const original = parseFloat(item?.originalPrice ?? 0) || 0;
    const current = parseFloat(item?.discountPrice ?? item?.price ?? 0) || 0;
    if (original && original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  };

  // Price helpers
  const getCurrentPrice = () => {
    const val = item?.discountPrice ?? item?.price ?? 0;
    const num = parseFloat(val);
    return Number.isFinite(num) ? num : 0;
  };

  const getOriginalPrice = () => {
    const val = item?.originalPrice ?? 0;
    const num = parseFloat(val);
    return Number.isFinite(num) ? num : 0;
  };


  const discountPercent = getDiscountPercentage();
  const imageUri = item?.image || item?.images?.[0]?.url || item?.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ProductDetail', { product: item })} 
      activeOpacity={0.9}
      style={styles.cardWrapper}
    >
      <View style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
        {/* Image Section with Gradient Overlay */}
        <View style={styles.imageSection}>
          <ImageBackground
            source={{ uri: imageUri }}
            style={styles.productImage}
            resizeMode="cover"
          >
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
              style={styles.imageGradient}
            />
            
            {/* Top Badges Row */}
            <View style={styles.topBadgesRow}>
              {/* Discount Badge */}
              {discountPercent > 0 && (
                <View style={[styles.discountBadge, { backgroundColor: branding.primaryColor }]}>
                  <Text style={styles.discountText}>-{discountPercent}%</Text>
                </View>
              )}
              
              {/* Favorite Button */}
              <View style={styles.favoriteButtonContainer}>
                <AddToFavourites product={item} />
              </View>
            </View>

            {/* Bottom Gradient for Text Readability */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.bottomGradient}
            />
          </ImageBackground>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Product Name */}
          <Text style={[styles.productName, { color: branding.textColor }]} numberOfLines={2}>
            {item?.name || item?.title || 'Product Name'}
          </Text>

          {/* Shop Info */}
          {item?.shop && (
            <View style={styles.shopInfoRow}>
              <Image
                source={{ 
                  uri: item.shop.avatar || item.shop.logo || item.shop.image || ''
                }}
                style={styles.shopAvatar}
                defaultSource={require('../../assets/images/placeholder.png')}
              />
              <View style={styles.shopInfo}>
                <Text style={[styles.shopName, { color: branding.textColor }]} numberOfLines={1}>
                  {item.shop.name || 'Shop'}
                </Text>
                <View style={styles.locationRow}>
                  <Icon name="location-on" size={12} color={branding.primaryColor} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {item?.shop?.address || item?.address || 'Location'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Price and Unit Row */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <View style={styles.priceContainer}>
                <Text style={[styles.currencySymbol, { color: branding.primaryColor }]}>₹</Text>
                <Text style={[styles.currentPrice, { color: branding.textColor }]}>
                  {getCurrentPrice()}
                </Text>
              </View>
              {getOriginalPrice() > getCurrentPrice() && (
                <Text style={styles.originalPrice}>₹{getOriginalPrice()}</Text>
              )}
            </View>
            
          
          </View>

          {/* Location Display */}
          <View style={[styles.locationContainer, { backgroundColor: branding.secondaryColor }]}>
            <Icon name="location-on" size={12} color={branding.primaryColor} />
            <Text style={[styles.locationDisplayText, { color: branding.textColor }]} numberOfLines={2}>
              {item?.shop?.address || item?.address || item?.location || 'Location not available'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Styles for the component
const stylesFn = (branding) => StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 10,
    marginBottom: 8,
  },
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  imageSection: {
    height: 135,
    width: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  topBadgesRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  discountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  favoriteButtonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  contentSection: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  shopInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  shopAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 9,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 13,
    fontWeight: '800',
    marginRight: 2,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999999',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  unitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unitText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 5,
    marginTop: 2,
  },
  locationDisplayText: {
    fontSize: 10,
    fontWeight: '500',
    flex: 1,
    lineHeight: 14,
  },
});

export default CategoryListView;
