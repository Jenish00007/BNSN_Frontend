import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppBranding } from '../../utils/translationHelper';
import UserContext from '../../context/User';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2;

const EventCard = ({ item, horizontal = false }) => {
  const navigation = useNavigation();
  const { 
    addToCart, 
    isLoggedIn, 
    getProductCartInfo, 
    updateCartQuantity, 
    removeFromCart 
  } = useContext(UserContext);
  
  const branding = useAppBranding();
  const [isLoading, setIsLoading] = useState(false);
  const [cartInfo, setCartInfo] = useState(() => getProductCartInfo(item._id));
  const commitTimeoutRef = useRef(null);
  const pendingQuantityRef = useRef(null);

  // Update cart info when item or cart changes
  useEffect(() => {
    if (item?._id && getProductCartInfo) {
      const info = getProductCartInfo(item._id);
      setCartInfo(info);
    }
  }, [item?._id, getProductCartInfo]);

  // Check if product is in stock
  const isInStock = item?.stock > 0;
  const maxQuantity = item?.stock || 0;

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    // Check if product is in stock
    if (!isInStock) {
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
        // Update with real cart info after successful API call
        const updatedInfo = getProductCartInfo(item._id);
        setCartInfo(updatedInfo);
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

  // Debounced quantity commit function
  const scheduleQuantityCommit = (cartItemId, newQuantity) => {
    // Clear existing timeout
    if (commitTimeoutRef.current) {
      clearTimeout(commitTimeoutRef.current);
    }

    // Store pending quantity
    pendingQuantityRef.current = { cartItemId, newQuantity };

    // Set new timeout
    commitTimeoutRef.current = setTimeout(async () => {
      try {
        if (newQuantity === 0) {
          const res = await removeFromCart(cartItemId);
          if (!res.success) {
            // Revert to previous state on error
            const currentInfo = getProductCartInfo(item._id);
            setCartInfo(currentInfo);
            Alert.alert('Error', res.message || 'Failed to remove from cart');
          }
        } else {
          const res = await updateCartQuantity(cartItemId, newQuantity);
          if (!res.success) {
            // Revert to previous state on error
            const currentInfo = getProductCartInfo(item._id);
            setCartInfo(currentInfo);
            Alert.alert('Error', res.message || 'Failed to update cart');
          }
        }
        // Update local state with real cart info after API call
        const updatedInfo = getProductCartInfo(item._id);
        setCartInfo(updatedInfo);
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        // Revert to previous state on error
        const revertedInfo = getProductCartInfo(item._id);
        setCartInfo(revertedInfo);
        Alert.alert('Error', 'An error occurred while updating quantity.');
      }
    }, 500); // 500ms debounce
  };

  // Handle quantity changes
  const handleQuantityChange = async (change) => {
    if (!cartInfo.cartItemId) return;
    const currentId = cartInfo.cartItemId;
    const newQuantity = cartInfo.quantity + change;

    // Check if product is in stock - more robust validation
    const isInStock = item?.stock > 0 && item?.stock !== null && item?.stock !== undefined;
    const maxQuantity = item?.stock || 0;

    if (newQuantity <= 0) {
      setCartInfo({ isInCart: false, quantity: 0, cartItemId: null });
      scheduleQuantityCommit(currentId, 0);
      return;
    }

    if (!isInStock) {
      Alert.alert('Out of Stock', 'This item is currently not available.');
      return;
    }

    if (newQuantity > maxQuantity) {
      Alert.alert('Limit Reached', `Maximum quantity allowed is ${maxQuantity}`);
      return;
    }

    setCartInfo(prev => ({ ...prev, quantity: newQuantity }));
    scheduleQuantityCommit(currentId, newQuantity);
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (item?.originalPrice && (item?.originalPrice > (item?.discountPrice || item?.price || 0))) {
      return Math.round(((item.originalPrice - (item.discountPrice || item.price || 0)) / item.originalPrice) * 100);
    }
    return 0;
  };

  // Get event image
  const getEventImage = () => {
    if (item?.images && item.images.length > 0) {
      const first = item.images[0];
      const imageUri = typeof first === 'string' ? first : first?.url;
      return imageUri || 'https://via.placeholder.com/200x200?text=Event';
    }
    return 'https://via.placeholder.com/200x200?text=Event';
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!item?.Finish_Date) return '';
    const now = new Date();
    const endDate = new Date(item.Finish_Date);
    const diff = endDate - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  // If item is undefined or null, return null
  if (!item) {
    return null;
  }

  return (
    <View style={[styles.container, horizontal && styles.horizontalContainer]}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        activeOpacity={0.9}
        style={styles.touchableContainer}
      >
        <View style={[
          styles.itemContainer,
          { backgroundColor: branding.backgroundColor },
          !isInStock && styles.outOfStockContainer
        ]}>
         
          {/* Event Image Container */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getEventImage() }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            
            {/* Gradient overlay for better text visibility */}
            <View style={styles.imageOverlay} />
           
            {/* Discount Badge */}
            {getDiscountPercentage() > 0 && (
              <View style={[styles.discountBadge, { backgroundColor: branding.primaryColor }]}>
                <Text style={styles.discountText}>{getDiscountPercentage()}% OFF</Text>
              </View>
            )}

            {/* Time Remaining Badge */}
            <View style={[styles.timeBadge, { backgroundColor: '#FF6B35' }]}>
              <Text style={styles.timeText}>{getTimeRemaining()}</Text>
            </View>

            {/* Out of Stock Overlay */}
            {!isInStock && (
              <View style={styles.outOfStockOverlay}>
                <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
              </View>
            )}
          </View>

          {/* Event Details Container */}
          <View style={styles.detailsContainer}>
           
            {/* Event Name */}
            <Text style={[styles.cardTitle, { color: branding.textColor }]} numberOfLines={2}>
              {item?.name}
            </Text>

            {/* Event Description */}
            {item?.description && (
              <Text style={[styles.cardDescription, { color: branding.textColor }]} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {/* Tags */}
            {item?.tags && (
              <Text style={[styles.tags, { color: branding.primaryColor }]} numberOfLines={1}>
                {item.tags}
              </Text>
            )}
          
            {/* Price and Add to Cart Row */}
            <View style={styles.footerRow}>
              <View style={styles.priceContainer}>
                {/* Current Price */}
                <View style={styles.currentPriceRow}>
                  <Text style={[styles.currencySymbol, { color: branding.primaryColor }]}>₹</Text>
                  <Text style={[styles.currentPrice, { color: branding.textColor }]}>
                    {item?.discountPrice || item?.price || 0}
                  </Text>
                </View>
               
                {/* Original Price (if discounted) */}
                {item?.originalPrice && item?.originalPrice > (item?.discountPrice || item?.price || 0) && (
                  <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
                )}
              </View>

              {/* Add to Cart Button */}
              <TouchableOpacity
                onPress={handleAddToCart}
                style={[
                  styles.addButton,
                  { backgroundColor: branding.primaryColor },
                  !(item?.stock > 0) && styles.addButtonDisabled,
                  isLoading && styles.addButtonLoading
                ]}
                disabled={isLoading || !(item?.stock > 0)}
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
            </View>
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
  horizontalContainer: {
    width: 150,
    marginRight: 12,
  },
  touchableContainer: {
    flex: 1,
  },
  itemContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outOfStockContainer: {
    opacity: 0.6,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  cardDescription: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
    opacity: 0.7,
  },
  tags: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 2,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: '#999',
    marginTop: 2,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonLoading: {
    opacity: 0.7,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
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
});

export default EventCard;
