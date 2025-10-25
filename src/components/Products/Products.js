import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AddToFavourites from '../Favourites/AddtoFavourites';
import { LocationContext } from '../../context/Location';
import AuthContext from '../../context/Auth';
import UserContext from '../../context/User';
import { useAppBranding } from '../../utils/translationHelper';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // Responsive card width

const Products = ({ item, getProductCartInfo: propGetProductCartInfo }) => {
  const navigation = useNavigation();
  const { 
    addToCart, 
    isLoggedIn, 
    getProductCartInfo: contextGetProductCartInfo, 
    updateCartQuantity, 
    removeFromCart 
  } = useContext(UserContext);
  
  // Use prop if provided, otherwise fall back to context
  const getProductCartInfo = propGetProductCartInfo || contextGetProductCartInfo;
  const { location } = useContext(LocationContext);
  const { token } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [cartInfo, setCartInfo] = useState({ isInCart: false, quantity: 0, cartItemId: null });
  const [countValue, setCountValue] = useState(1); // Local count for increment/decrement
  const commitTimeoutRef = useRef(null);
  const pendingQuantityRef = useRef(0);
  const branding = useAppBranding();

  // Update cart info when item or cart changes
  useEffect(() => {
    if (item?._id && getProductCartInfo) {
      const info = getProductCartInfo(item._id);
      setCartInfo(info);
    }
  }, [item?._id, getProductCartInfo]);

  useEffect(() => {
    pendingQuantityRef.current = cartInfo.quantity;
  }, [cartInfo.quantity]);

  useEffect(() => () => {
    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
  }, []);

  const scheduleQuantityCommit = (cartItemId, desiredQuantity) => {
    pendingQuantityRef.current = desiredQuantity;
    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
    commitTimeoutRef.current = setTimeout(async () => {
      try {
        if (desiredQuantity <= 0) {
          const res = await removeFromCart(cartItemId);
          if (!res.success) {
            // Revert to previous state on error
            const currentInfo = getProductCartInfo(item._id);
            setCartInfo(currentInfo);
            Alert.alert('Error', res.message || 'Failed to remove from cart');
          }
        } else {
          const res = await updateCartQuantity(cartItemId, desiredQuantity);
          if (!res.success) {
            // Revert to previous state on error
            const currentInfo = getProductCartInfo(item._id);
            setCartInfo(currentInfo);
            Alert.alert('Error', res.message || 'Failed to update cart');
          }
        }
      } catch (e) {
        console.error('Commit quantity error:', e);
        // Revert to previous state on error
        const currentInfo = getProductCartInfo(item._id);
        setCartInfo(currentInfo);
        Alert.alert('Error', 'An error occurred while updating quantity.');
      }
    }, 500); // Increased debounce time for better stability
  };
  // Animation refs removed to prevent callback leaks
  // const scaleAnim = useRef(new Animated.Value(1)).current;
  // const pressAnimation = useRef(null);
  // const addToCartAnimation = useRef(null);
 
  // Function to limit the product name to allow 2 lines
  const getShortenedName = (name) => {
    if (!name) return '';
    if (name.length > 35) {
      return name.slice(0, 35) + '...';
    }
    return name;
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
    // For events, provide a default unit if none specified
    if (item?.name && !weight && !unit && !quantity && !unitCount) {
      return "1 Pcs";
    }
    
    return null;
  };

  // Function to get unit count specifically for debugging
  const getUnitCountDisplay = () => {
    const { unitCount, unit } = item || {};
    if (unitCount && unit) {
      return `${unitCount} ${unit}`;
    }
    // For events, provide a default unit if none specified
    if (item?.name && !unitCount && !unit) {
      return "1 Pcs";
    }
    return null;
  };

  // Press handlers without animations to prevent callback leaks
  const handlePressIn = () => {
    // Animation removed to prevent callback leaks
  };

  const handlePressOut = () => {
    // Animation removed to prevent callback leaks
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    // Check if product is in stock directly
    if (item.stock === 0 || item.stock === null || item.stock === undefined) {
      Alert.alert(
        'Out of Stock',
        'This item is currently not available.',
        [{ text: 'OK', style: 'cancel' }],
        { cancelable: true }
      );
      return;
    }

    // Optimistic UI update - show as in cart immediately
    setCartInfo({ isInCart: true, quantity: countValue, cartItemId: 'temp_' + Date.now() });
    setIsLoading(true);
    
    try {
      const result = await addToCart(item, countValue);
      if (result.success) {
        // Update with real cart info after successful API call
        const updatedInfo = getProductCartInfo(item._id);
        setCartInfo(updatedInfo);
        setCountValue(1); // Reset count after successful add
      } else {
        // Revert optimistic update on error
        setCartInfo({ isInCart: false, quantity: 0, cartItemId: null });
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Revert optimistic update on error
      setCartInfo({ isInCart: false, quantity: 0, cartItemId: null });
      Alert.alert("Error", "An error occurred while adding to cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (change) => {
    if (!cartInfo.cartItemId) return;
    const currentId = cartInfo.cartItemId;
    const newQuantity = cartInfo.quantity + change;

    // Check if product is in stock - more robust validation
    const isInStock = item?.stock > 0 && item?.stock !== null && item?.stock !== undefined;
    const maxQuantity = item?.stock || 0;

    // Update local state immediately for instant visual feedback
    if (newQuantity <= 0) {
      setCartInfo({ isInCart: false, quantity: 0, cartItemId: null });
      scheduleQuantityCommit(currentId, 0);
      return;
    }

    // Check stock limits
    if (!isInStock) {
      Alert.alert('Out of Stock', 'This item is currently not available.');
      return;
    }

    if (newQuantity > maxQuantity) {
      Alert.alert('Limit Reached', `Maximum quantity allowed is ${maxQuantity}`);
      return;
    }

    // Update local state immediately
    setCartInfo(prev => ({ ...prev, quantity: newQuantity }));
    
    // Schedule API call with debounce
    scheduleQuantityCommit(currentId, newQuantity);
  };

  // Handle increment/decrement for count value (before adding to cart)
  const handleCountChange = (change) => {
    const newCount = countValue + change;
    
    // Check if product is in stock
    const isInStock = item?.stock > 0 && item?.stock !== null && item?.stock !== undefined;
    const maxQuantity = item?.stock || 0;

    // Don't allow count below 1
    if (newCount < 1) {
      return;
    }

    // Check stock limits
    if (!isInStock) {
      Alert.alert('Out of Stock', 'This item is currently not available.');
      return;
    }

    if (newCount > maxQuantity) {
      Alert.alert('Limit Reached', `Maximum quantity allowed is ${maxQuantity}`);
      return;
    }

    setCountValue(newCount);
  };

  // Cleanup effect removed since animations are disabled

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    const original = parseFloat(item?.originalPrice ?? 0) || 0;
    const current = parseFloat(item?.discountPrice ?? item?.price ?? 0) || 0;
    if (original && original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  };

  // Price helpers (normalize strings/numbers and avoid falsy issues)
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


  // If item is undefined or null, return null
  if (!item) {
    return null;
  }
     
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.touchableContainer}
      >
        <View style={[
          styles.itemContainer,
          { backgroundColor: branding.backgroundColor },
          (item.stock === 0 || item.stock === null || item.stock === undefined) && styles.outOfStockContainer
        ]}>
         
          {/* Product Image Container */}
          <View style={styles.imageContainer}>
            <ImageBackground
              source={{ 
                uri: item?.image || 
                (item?.images?.[0]?.url || item?.images?.[0]) || 
                'https://via.placeholder.com/300x200?text=No+Image'
              }}
              style={styles.cardImageBG}
              resizeMode="cover"
            >
              {/* Gradient overlay for better text visibility */}
              <View style={styles.imageOverlay} />
             
              {/* Favorite Button */}
              <View style={styles.favoritePosition}>
                <AddToFavourites product={item}/>
              </View>

              {/* Discount Badge */}
              {/* {getDiscountPercentage() > 0 && (
                <View style={[styles.discountBadge, { backgroundColor: branding.primaryColor }]}>
                  <Text style={styles.discountText}>{getDiscountPercentage()}% OFF</Text>
                </View>
              )} */}

              {/* Out of Stock Overlay */}
              {/* {(item.stock === 0 || item.stock === null || item.stock === undefined) && (
                <View style={styles.outOfStockOverlay}>
                  <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                </View>
              )} */}
            </ImageBackground>
          </View>

          {/* Product Details Container */}
          <View style={styles.detailsContainer}>
           
            {/* Product Name */}
            <Text style={[styles.cardTitle, { color: branding.textColor }]} numberOfLines={2}>
              {getShortenedName(item?.name)}
            </Text>


            {/* Price + Unit (unit on right end; only unit text has gray pill) */}
            {/* {getUnitCountDisplay() && (
              <View style={styles.unitRowCompact}>
                <View style={styles.currentPriceRow}>
                  <Text style={[styles.currencySymbol, { color: branding.primaryColor }]}>₹</Text>
                  <Text style={[styles.currentPrice, { color: branding.textColor }]}>
                    {getCurrentPrice()}
                  </Text>
                  {getOriginalPrice() > getCurrentPrice() && (
                    <Text style={[styles.originalPrice, { marginLeft: 6 }]}>₹{getOriginalPrice()}</Text>
                  )}
                </View>
                <Text style={[styles.unitText, styles.unitPill]}>
                  {getUnitCountDisplay()}
                </Text>
              </View>
            )} */}

          {/* Location with Address - Replace lines 389-440 */}
<View style={styles.bottomControls}>
  <View style={styles.locationAddressContainer}>
    <Icon name="location-on" size={16} color={branding.primaryColor} />
    <Text style={styles.addressText} numberOfLines={1}>
      {item?.shop?.address || item?.address || item?.location || 'Location not available'}
    </Text>
  </View>
</View>
            {/* Price + quantity row 
            <View style={styles.priceQtyRow}>
              <View style={styles.priceContainer}>
                <View style={styles.currentPriceRow}>
                  <Text style={[styles.currencySymbol, { color: branding.primaryColor }]}>₹</Text>
                  <Text style={[styles.currentPrice, { color: branding.textColor }]}>
                    {getCurrentPrice()}
                  </Text>
                </View>
                {getOriginalPrice() > getCurrentPrice() && (
                  <Text style={styles.originalPrice}>₹{getOriginalPrice()}</Text>
                )}
              </View>
              <Text style={[styles.qtyLabel, { color: branding.textColor }]}>
                {getUnitDisplay() || getUnitCountDisplay() || ''}
              </Text>
            </View>
*/}
            {/* Bottom controls row: -, +, cart */}
            {/* <View style={styles.bottomControls}>
              <TouchableOpacity
                onPress={() => (cartInfo.isInCart ? handleQuantityChange(-1) : handleCountChange(-1))}
                style={[
                  styles.quantityButton,
                  { backgroundColor: branding.primaryColor },
                  (cartInfo.isInCart ? cartInfo.quantity <= 1 : countValue <= 1) && styles.quantityButtonDisabled
                ]}
                disabled={cartInfo.isInCart ? cartInfo.quantity <= 1 : countValue <= 1}
              >
                <Icon name="remove" size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.quantityText}>
                {cartInfo.isInCart ? cartInfo.quantity : countValue}
              </Text>

              <TouchableOpacity
                onPress={() => (cartInfo.isInCart ? handleQuantityChange(1) : handleCountChange(1))}
                style={[
                  styles.quantityButton,
                  { backgroundColor: branding.primaryColor },
                  (cartInfo.isInCart ? (cartInfo.quantity >= (item?.stock || 0)) : (countValue >= (item?.stock || 0))) && styles.quantityButtonDisabled
                ]}
                disabled={cartInfo.isInCart ? (cartInfo.quantity >= (item?.stock || 0)) : (countValue >= (item?.stock || 0))}
              >
                <Icon name="add" size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddToCart}
                style={[
                  styles.addButton,
                  { backgroundColor: branding.primaryColor },
                  (!(item?.stock > 0) || cartInfo.isInCart) && styles.addButtonDisabled,
                  isLoading && styles.addButtonLoading
                ]}
                disabled={isLoading || !(item?.stock > 0) || cartInfo.isInCart}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon
                    name={!(item?.stock > 0) ? "block" : "add-shopping-cart"}
                    size={18}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            </View> */}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
 
  touchableContainer: {
    flex: 1,
  },

  itemContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    height: 280, // Fixed height for consistent card size
  },

  outOfStockContainer: {
    opacity: 0.7,
  },

  imageContainer: {
    position: 'relative',
    height: 140,
    width: '100%',
  },

  cardImageBG: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },

  favoritePosition: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },

  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  detailsContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between', // Distribute content evenly
    paddingBottom: 64, // reserve space for absolutely-positioned controls
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 6,
    height: 36, // Fixed height for consistent title space
  },

  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    height: 20, // Fixed height for consistent unit container
  },

  unitText: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  unitPill: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unitRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  unitCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

  unitCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    minHeight: 28,
  },

  priceContainer: {
    flex: 1,
    paddingRight: 8,
    flexShrink: 1,
  },
  priceQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  qtyLabel: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  bottomControls: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 5,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 10,
  },

  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  currencySymbol: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 2,
  },

  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
  },

  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999999',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F16122',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  addButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowColor: '#CCCCCC',
  },

  addButtonLoading: {
    backgroundColor: '#D4951A',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: 6,
    minWidth: 18,
    textAlign: 'center',
    color: '#000000',
  },

  quantityButtonDisabled: {
    opacity: 0.5,
  },

  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },

  quantityButtonTextDisabled: {
    color: '#999999',
  },

  quantityTextDisabled: {
    color: '#999999',
    fontStyle: 'italic',
  },

  quantityControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  countControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  locationAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingHorizontal: 4,
  },
  addressText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
  },
});

export default Products;