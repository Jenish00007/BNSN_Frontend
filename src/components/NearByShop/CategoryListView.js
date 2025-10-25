import React, { useContext, useState } from 'react';

import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AddToFavourites from '../Favourites/AddtoFavourites';
import UserContext from '../../context/User';
import { useAppBranding } from '../../utils/translationHelper';


// CategoryListView component
const CategoryListView = ({ data }) => {

  const navigation = useNavigation();
  const { addToCart, isLoggedIn } = useContext(UserContext);
  const branding = useAppBranding();
  
  const styles = stylesFn(branding);
  const [isLoading, setIsLoading] = useState(false);

  // Function to truncate text longer than 15 letters
  const truncateText = (text) => {
    if (text && text.length > 12) {
      return text.substring(0, 12) + '...';
    }
    return text;
  };

  // Function to format unit information
  const getUnitDisplay = () => {
    const { weight, unit, quantity, unitCount } = item || {};
    
    // If unitCount is provided, use it with unit
    if (unitCount && unit) {
      return `${unitCount} ${unit}`;
    }
    
    // If quantity is provided, use it with "Pcs"
    if (quantity) {
      return `${quantity} Pcs`;
    }
    
    // If weight is provided, use it
    if (weight) {
      return weight;
    }
    
    // If only unit is provided, use it
    if (unit) {
      return unit;
    }
    
    return null;
  };

  // Function to get unit count specifically for display
  const getUnitCountDisplay = () => {
    const { unitCount, unit } = item || {};
    if (unitCount && unit) {
      return `${unitCount} ${unit}`;
    }
    return null;
  };


  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (item?.originalPrice && (item?.originalPrice > (item?.discountPrice || item?.price || 0))) {
      return Math.round(((item.originalPrice - (item.discountPrice || item.price || 0)) / item.originalPrice) * 100);
    }
    return 0;
  };

  // Check if data is properly passed
  if (!data) {
    return null;
  }

  const { index, item } = data;

  // Ensure item is defined before rendering
  if (!item) {
    return null;
  }

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    // Check if product is in stock
    if (item?.stock <= 0) {
      Alert.alert(
        'Out of Stock',
        'This item is currently not available.',
        [{ text: 'OK', style: 'cancel' }],
        { cancelable: true }
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await addToCart(item);
      if (result.success) {
        Alert.alert("Success", result.message);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "An error occurred while adding to cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDistance = item?.distance ? `${Math.round(item?.distance / 1000) || '100+'} km` : 'N/A';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { product: item })} style={{ height: 134, width: 280 }} touchOpacity={0.6} >
        <View style={styles.bgColorView} />
        <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: 'row' }}>
          <View style={{ paddingVertical: 24, paddingLeft: 16, }}>
            <Image
              style={{ flex: 1, borderRadius: 16, aspectRatio: 1.0, }}
              source={{ uri: item?.image || item?.images?.[0] }}
            />
            {/* Discount Badge */}
            {/* {getDiscountPercentage() > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{getDiscountPercentage()}% OFF</Text>
              </View>
            )} */}
          </View>
          <View style={{ flex: 1, paddingLeft: 16, paddingVertical: 16 }}>
            <Text style={styles.title}>{truncateText(item?.title)}</Text>
            <View style={styles.lessionCountRatingContainer}>
              <Text style={[styles.textStyle, { flex: 1, fontSize: 16 }]}>
                {truncateText(item?.name)}
              </Text>
              <Text style={styles.textStyle}>{item?.rating}</Text>
              <AddToFavourites product={item}/>
            </View>
            
            {/* Unit Count Display */}
            {/* {getUnitCountDisplay() && (
              <View style={styles.unitCountContainer}>
               
                <Text style={styles.unitCountText}>
                  {getUnitCountDisplay()}
                </Text>
              </View>
            )} */}
            {/* Location with Address - Replace lines 182-192 */}
<View style={styles.locationAddressContainer}>
  <Icon name="location-on" size={14} color={branding.primaryColor} />
  <Text style={styles.addressText} numberOfLines={1}>
    {item?.shop?.address || item?.address || 'Location not available'}
  </Text>
</View>
            <View style={{ flexDirection: 'row', paddingRight: 16, alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={styles.locationContainer}>
                {/* Current Price */}
                <View style={styles.priceContainer}>
                  <View style={styles.currentPriceRow}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <Text style={styles.currentPrice}>
                      {item?.discountPrice || item?.price || 0}
                    </Text>
                  </View>
                  {/* Original Price (if discounted) */}
                  {item?.originalPrice && item?.originalPrice > (item?.discountPrice || item?.price || 0) && (
                    <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
                  )}
                </View>
              </View>
              
             
              {/* <TouchableOpacity 
                onPress={handleAddToCart}
                style={[styles.addButton, { backgroundColor: branding.primaryColor }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon name="add-shopping-cart" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the component
const stylesFn = (branding) => StyleSheet.create({
  container: {
    backgroundColor: branding.backgroundColor
  },
  bgColorView: {
    flex: 1,
    marginLeft: 55,
    borderRadius: 10,
    backgroundColor: branding.secondaryColor,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: branding.primaryColor
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closedBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  closedText: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontFamily: 'WorkSans-SemiBold',
    letterSpacing: 0.27,
    color: branding.textColor,
  },
  lessionCountRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    paddingBottom: 8,
  },
  textStyle: {
    fontSize: 18,
    fontFamily: 'WorkSans-Regular',
    letterSpacing: 0.27,
    color: branding.textColor,
  },
  moneyText: {
    fontFamily: 'WorkSans-SemiBold',
    color: '#666666',
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priceContainer: {
    flex: 1,
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    color: branding.primaryColor,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 2,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: branding.textColor,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999999',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  statusText: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '600',
  },
  openBadge: {
    backgroundColor: '#FFF8E1',
  },
  openText: {
    color: branding.primaryColor,
  },
  addIconView: {
    padding: 4,
    backgroundColor: branding.primaryColor,
    borderRadius: 8,
    marginRight: 4,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  unitCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    backgroundColor: branding.primaryColor,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  unitCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  locationAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 140,
  },
  addressText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
  },
});

export default CategoryListView;
