import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AuthContext from '../../context/Auth';
import UserContext from '../../context/User';

import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'react-native';
import { API_URL } from '../../config/api';
import { useAppBranding } from '../../utils/translationHelper';
import { calculateCartSummary } from '../../utils/priceCalculations';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [updatingAction, setUpdatingAction] = useState(null);
  const [priceSummary, setPriceSummary] = useState({
    totalItems: 0,
    subtotal: 0,
    totalOriginalPrice: 0,
    totalDiscount: 0,
    total: 0,
    currency: 'INR',
    savings: 0
  });
  
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const { clearCart } = useContext(UserContext);
  const branding = useAppBranding();

  useEffect(() => {
    if (token) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Refresh cart when screen comes into focus (e.g., returning from order confirmation)
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        fetchCartItems();
      }
    }, [token])
  );

  const calculatePriceSummary = (items) => {
    if (!Array.isArray(items)) return;
    console.log('Calculating price summary for items:', items);

    // Use standardized price calculation
    const summary = calculateCartSummary(items);
    
    console.log('Final price summary:', summary);
    setPriceSummary(summary);
  };

  const fetchCartItems = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };    

      const response = await fetch(`${API_URL}/cart/all`, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();
      console.log('Cart API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }

      if (data.success) {
        const cartItems = Array.isArray(data.cartItems) ? data.cartItems : [];
        console.log('Setting cart items:', cartItems);
        
        // Filter out any null/undefined items that might cause price calculation errors
        const validCartItems = cartItems.filter(item => item != null && item.product != null);
        console.log('Valid cart items after filtering:', validCartItems);
        
        setCartItems(validCartItems);
        calculatePriceSummary(validCartItems);
      } else {
        throw new Error(data.message || 'Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', error.message || 'Failed to fetch cart items');
      setCartItems([]);
      setPriceSummary({
        totalItems: 0,
        subtotal: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        total: 0,
        currency: 'INR',
        savings: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCartItem = async (cartItemId) => {
    if (!token || !cartItemId) return;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/cart/remove/${cartItemId}`, {
        method: 'DELETE',
        headers: headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete item');
      }

      if (data.success) {
        await fetchCartItems();
        Alert.alert('Success', 'Item removed from cart');
      } else {
        throw new Error(data.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
      Alert.alert('Error', error.message || 'Failed to remove item from cart');
    }
  };

  const updateCartQuantity = async (cartItemId, newQuantity) => {
    if (!token || !cartItemId || newQuantity < 1) return;
    
    setUpdatingItemId(cartItemId);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/cart/update/${cartItemId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          quantity: newQuantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update quantity');
      }

      if (data.success) {
        await fetchCartItems();
      } else {
        throw new Error(data.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      Alert.alert('Error', error.message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleQuantityChange = (item, change) => {
    if (!item?._id || !item?.quantity) return;
    const newQuantity = item.quantity + change;
    
    // If decrementing and quantity would become 0, delete the item
    if (change === -1 && newQuantity <= 0) {
      deleteCartItem(item._id);
    } else if (newQuantity > 0) {
      updateCartQuantity(item._id, newQuantity);
    }
  };

  // Clear cart items locally and from server using remove-multiple API
  const clearCartItems = async () => {
    try {
      // Extract all cart item IDs from current cart items
      const cartItemIds = cartItems.map(item => item._id).filter(id => id);
      
      if (cartItemIds.length === 0) {
        console.log('Cart is already empty, no items to clear');
        return { success: true, message: 'Cart is already empty' };
      }

      console.log('Clearing cart items with IDs:', cartItemIds);
      const result = await clearCart(cartItemIds);
      
      if (result.success) {
        console.log('Successfully cleared cart items from server:', result.message);
        setCartItems([]);
        setPriceSummary({
          totalItems: 0,
          subtotal: 0,
          totalOriginalPrice: 0,
          totalDiscount: 0,
          total: 0,
          currency: 'INR',
          savings: 0
        });
        return { success: true, message: result.message || 'Cart cleared successfully' };
      } else {
        console.error('Failed to clear cart:', result.message);
        
        // Even if server clearing failed, clear local state to prevent UI issues
        console.log('Clearing local cart state despite server error');
        setCartItems([]);
        setPriceSummary({
          totalItems: 0,
          subtotal: 0,
          totalOriginalPrice: 0,
          totalDiscount: 0,
          total: 0,
          currency: 'INR',
          savings: 0
        });
        
        return { 
          success: true, // Return success for UI purposes
          message: 'Cart cleared locally. ' + (result.message || 'Server clearing may have failed.') 
        };
      }
    } catch (error) {
      console.error('Error clearing cart items:', error);
      return { success: false, message: 'Failed to clear cart' };
    }
  };
  console.log(cartItems)  
  const renderItem = ({ item }) => {
    if (!item?.product) return null;
    console.log('Rendering cart item:', item);

    // Ensure we have valid price values
    const originalPrice = parseFloat(item.originalPrice || item.product?.originalPrice);
    const discountPrice = parseFloat(item.discountPrice || item.product?.discountPrice );
    const quantity = parseInt(item.quantity || 0);

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('ProductDetail', { product: item.product })}
        style={[styles.card, { 
          borderColor: branding.cartCardBorder,
          backgroundColor: branding.cartCardBackground
        }]}
      >
        {(() => {
          const firstImage = item?.product?.images?.[0];
          const imageUri = typeof firstImage === 'string' ? firstImage : firstImage?.url;
          if (!imageUri) return null;
          return (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
            />
          );
        })()}
        <View style={styles.info}>
          <Text style={[styles.name, { color: branding.textColor }]}>
            {item.product?.name?.length > 20 ? item.product.name.substring(0, 30) + '...' : item.product?.name || 'Unknown Item'}
          </Text>
          <View style={styles.priceContainer}>
            {originalPrice > discountPrice && (
              <Text style={[styles.originalPrice, { color: branding.textColor }]}>
                ₹{originalPrice.toFixed(2)}
              </Text>
            )}
            <Text style={[styles.price, { color: branding.primaryColor }]}>
              ₹{discountPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              onPress={() => handleQuantityChange(item, -1)}
              style={[styles.quantityButton, { backgroundColor: branding.cartQuantityButtonBg }]}
            >
              <Text style={[styles.quantityButtonText, { color: branding.cartQuantityButtonText }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.quantity, { color: branding.textColor }]}>{quantity}</Text>
            <TouchableOpacity 
              onPress={() => handleQuantityChange(item, 1)}
              style={[styles.quantityButton, { backgroundColor: branding.cartQuantityButtonBg }]}
            >
              <Text style={[styles.quantityButtonText, { color: branding.cartQuantityButtonText }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Remove Item',
              'Are you sure you want to remove this item from your cart?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel'
                },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => deleteCartItem(item._id)
                }
              ]
            );
          }}
        >
          <FontAwesome name="trash" size={20} color={branding.cartDeleteColor} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, 
        { backgroundColor: branding.backgroundColor }]}>
        <ActivityIndicator size="large" color={branding.primaryColor} />
      </View>
    );
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
        <Text style={[styles.emptyMessage, { color: branding.textColor }]}>
          Your cart is empty
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
      <StatusBar 
        backgroundColor={branding.primaryColor}
        barStyle="dark-content"
      />
      
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item?._id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.emptyMessage, { color: branding.textColor }]}>
            Your cart is empty
          </Text>
        }
      />

      <View style={[styles.totalSection, { backgroundColor: branding.cartTotalSectionBg }]}>
        <View style={styles.priceSummaryContainer}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: branding.textColor }]}>Total Items:</Text>
            <Text style={[styles.priceValue, { color: branding.textColor }]}>{priceSummary.totalItems}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: branding.textColor }]}>Original Price:</Text>
            <Text style={[styles.priceValue, { color: branding.textColor }]}>₹{priceSummary.totalOriginalPrice.toFixed(2)}</Text>
          </View>

          {priceSummary.totalDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: branding.textColor }]}>Total Discount:</Text>
              <Text style={[styles.priceValue, { color: branding.cartDiscountColor }]}>-₹{priceSummary.totalDiscount.toFixed(2)}</Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: branding.cartDividerColor }]} />

          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: branding.textColor }]}>Total Amount:</Text>
            <Text style={[styles.totalAmount, { color: branding.primaryColor }]}>₹{priceSummary.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.addButton, { 
            backgroundColor: branding.buttonColor,
            shadowColor: branding.textColor
          }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, { 
            color: branding.whiteColorText
          }]}>Add More Items</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.confirmButton, { 
            backgroundColor: branding.buttonColor,
            shadowColor: branding.textColor
          }]} 
          onPress={() => {
            if (!Array.isArray(cartItems) || cartItems.length === 0) {
              Alert.alert('Error', 'Your cart is empty');
              return;
            }
            navigation.navigate('OrderSummary', { 
              cartItems,
              priceSummary,
              totalItems: priceSummary.totalItems,
              subtotal: priceSummary.subtotal,
              totalDiscount: priceSummary.totalDiscount,
              total: priceSummary.total,
              currency: priceSummary.currency,
              savings: priceSummary.savings,
              clearCartItems: clearCartItems
            });
          }}
        >
          <Text style={[styles.buttonText, { 
            color: branding.whiteColorText
          }]}>Confirm Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    paddingBottom: 10,
    borderRadius: 8,
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0'
  },
  info: {
    marginLeft: 15,
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
    minWidth: 30,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  addButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  deleteButton: {
    padding: 10,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  totalSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 10,
  },
  priceSummaryContainer: {
    padding: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CartPage;