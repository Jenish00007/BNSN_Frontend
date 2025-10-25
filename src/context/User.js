import React, { useState, useEffect, useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useApolloClient, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { v5 as uuidv5 } from 'uuid'
import { v1 as uuidv1 } from 'uuid'
import { profile } from '../apollo/queries'
import { LocationContext } from './Location'
import AuthContext from './Auth'
import analytics from '../utils/analytics'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { API_URL } from '../config/api'

const UserContext = React.createContext({})

export const UserProvider = props => {
  const Analytics = analytics()
  const { t } = useTranslation()
  const { token, setToken } = useContext(AuthContext)
  const { location, setLocation } = useContext(LocationContext)
  const [cart, setCart] = useState([])
  const [cartItems, setCartItems] = useState([]) // Real-time cart items from API
  const [restaurant, setRestaurant] = useState(null)
  const [isPickup, setIsPickup] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [dataProfile, setProfile] = useState(null)
  const [formetedProfileData, setFormetedProfileData] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [errorProfile, setErrorProfile] = useState(null)
  const networkStatus='1'
  
  // Calculate cart count from cartItems
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) {
        setLoadingProfile(false);
        return;
      }
    
     setLoadingProfile(true);
    
      try {
        const response = await fetch(`${API_URL}/user/getuser`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-localization': 'en', 
          }
        });

        if (response.ok) {
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    console.log("Data", data);
                    setProfile(data.user);
                    setFormetedProfileData(data.user);
                } else {
                    console.log('Non-JSON response received from user API');
                    setErrorProfile('Invalid response format');
                }
            } catch (jsonError) {
                console.log('Error parsing JSON response:', jsonError);
                setErrorProfile('Failed to parse response');
            }
        } else {
            console.log('Error Status:', response.status);  // Log status code for debugging
            setErrorProfile(`HTTP Error: ${response.status}`);
        }
      } catch (error) {
        // This will catch network errors (e.g., if the device is offline)
        console.log('Network request failed:', error);
        setErrorProfile(error.message || 'Error fetching profile');
      } finally {
        setLoadingProfile(false); // Set loading to false when the fetch process is done
      }
    };
    
    fetchProfileData();
  }, [token]);

  const logout = async () => {
    try {
      // Remove token from AsyncStorage
      await AsyncStorage.removeItem('token')
      setToken(null)
      
      // Reset location if needed
      if (location.id) {
        setLocation({
          label: t('selectedLocation'),
          latitude: location.latitude,
          longitude: location.longitude,
          deliveryAddress: location.deliveryAddress
        })
      }

      // Clear any other user-related data
      setProfile(null)
      setFormetedProfileData(null)
      setCart([])

      return true
    } catch (error) {
      console.log('error on logout', error)
      return false
    }
  }

  const refreshProfile = async () => {
    if (!token) {
      return false;
    }
    
    setLoadingProfile(true);
    
    try {
      const response = await fetch(`${API_URL}/user/getuser`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-localization': 'en', 
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setProfile(data.user); 
        setFormetedProfileData(data.user);
        return true;
      } else {
        setErrorProfile(data.message || 'Failed to refresh profile');
        return false;
      }
    } catch (error) {
      console.log('Profile refresh failed:', error);
      setErrorProfile(error.message || 'Error refreshing profile');
      return false;
    } finally {
      setLoadingProfile(false);
    }
  };

  //add to cart
  const addToCart = async (item, quantity = 1) => {
    try {
      if (!token) {
        throw new Error('User not logged in');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Check if product is already in cart using local state (faster)
      const existingItem = cartItems?.find(
        cartItem => cartItem.product._id === item._id
      );

      if (existingItem) {
        // Update quantity if item exists (using same API for all products including events)
        const updateResponse = await fetch(`${API_URL}/cart/update/${existingItem._id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({
            quantity: existingItem.quantity + 1,
            originalPrice: item.originalPrice || item.price || 0,
            discountPrice: item.discountPrice || item.price || 0
          })
        });

        const updateData = await updateResponse.json();

        if (!updateResponse.ok) {
          throw new Error(updateData.message || 'Failed to update cart');
        }

        // Update local cart state immediately
        setCartItems(prevItems => 
          prevItems.map(cartItem => 
            cartItem._id === existingItem._id 
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        );

        return { 
          success: true, 
          message: 'Cart updated successfully' 
        };
      }

      // Add new item to cart (using same API for all products including events)
      const cartPayload = {
        productId: item._id,
        quantity: quantity,
        originalPrice: item.originalPrice || item.price || 0,
        discountPrice: item.discountPrice || item.price || 0
      };
      
      console.log('Adding to cart - Item:', item);
      console.log('Cart payload:', cartPayload);
      console.log('API URL:', `${API_URL}/cart/add`);
      
      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(cartPayload)
      });

      const data = await response.json();
      console.log("Cart API Response:", data);
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }

      // Update local cart state immediately with new item
      const newCartItem = {
        _id: data.cartItem?._id || data._id,
        product: item,
        quantity: quantity,
        originalPrice: item.originalPrice || item.price || 0,
        discountPrice: item.discountPrice || item.price || 0
      };
      
      // Only add if the item has valid product data
      if (item && item._id) {
        setCartItems(prevItems => [...prevItems, newCartItem]);
      } else {
        console.warn('Invalid item data, not adding to cart:', item);
      }

      return { 
        success: true, 
        message: 'Product added to cart successfully' 
      };

    } catch (error) {
      console.error('Error in addToCart:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to add to cart' 
      };
    }
  };

  // Fetch cart items for real-time cart state
  const fetchCartItems = async () => {
    if (!token) {
      setCartItems([]);
      return [];
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };    

      const response = await fetch(`${API_URL}/cart/all`, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const items = Array.isArray(data.cartItems) ? data.cartItems : [];
        setCartItems(items);
        return items;
      } else {
        setCartItems([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
      return [];
    }
  };

  // Check if a product is in cart and return its quantity
  const getProductCartInfo = (productId) => {
    const cartItem = cartItems.find(item => 
      item.product?._id === productId || item.product?.id === productId
    );
    
    return cartItem ? {
      isInCart: true,
      quantity: cartItem.quantity || 0,
      cartItemId: cartItem._id
    } : {
      isInCart: false,
      quantity: 0,
      cartItemId: null
    };
  };

  // Update cart item quantity
  const updateCartQuantity = async (cartItemId, newQuantity) => {
    if (!token || !cartItemId || newQuantity < 1) return { success: false, message: 'Invalid parameters' };
    
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
        // Update local cart items immediately instead of refetching
        setCartItems(prevItems => 
          prevItems.map(item => 
            item._id === cartItemId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        return { success: true, message: 'Quantity updated successfully' };
      } else {
        throw new Error(data.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return { success: false, message: error.message || 'Failed to update quantity' };
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    if (!token || !cartItemId) return { success: false, message: 'Invalid parameters' };

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
        throw new Error(data.message || 'Failed to remove item');
      }

      if (data.success) {
        // Update local cart items immediately instead of refetching
        setCartItems(prevItems => 
          prevItems.filter(item => item._id !== cartItemId)
        );
        return { success: true, message: 'Item removed from cart' };
      } else {
        throw new Error(data.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: error.message || 'Failed to remove item' };
    }
  };

  // Initialize cart items when token changes
  useEffect(() => {
    if (token) {
      fetchCartItems();
    } else {
      setCartItems([]);
    }
  }, [token]);

  // Fallback method to clear cart using multiple single delete calls
  const clearCartFallback = async (cartItemIds, headers) => {
    try {
      console.log('Using fallback method to clear cart items one by one...');
      let successCount = 0;
      const errors = [];

      for (const itemId of cartItemIds) {
        try {
          const response = await fetch(`${API_URL}/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: headers
          });

          if (response.ok) {
            successCount++;
            console.log(`Successfully deleted item: ${itemId}`);
          } else {
            const errorText = await response.text();
            errors.push(`Failed to delete ${itemId}: ${errorText}`);
          }
        } catch (error) {
          errors.push(`Error deleting ${itemId}: ${error.message}`);
        }
      }

      // Update local cart state regardless of some failures
      setCart([]);

      if (successCount === cartItemIds.length) {
        return { 
          success: true, 
          message: `Successfully cleared ${successCount} items from cart (fallback method)` 
        };
      } else if (successCount > 0) {
        return { 
          success: true, 
          message: `Partially cleared cart: ${successCount}/${cartItemIds.length} items removed` 
        };
      } else {
        return { 
          success: false, 
          message: `Failed to clear cart: ${errors.join(', ')}` 
        };
      }
    } catch (error) {
      console.error('Error in fallback cart clearing:', error);
      return { 
        success: false, 
        message: error.message || 'Fallback cart clearing failed' 
      };
    }
  };

  // Clear cart after successful order using the new remove-multiple API
  const clearCart = async (cartItemIds = []) => {
    try {
      if (!token) {
        throw new Error('User not logged in');
      }

      if (!cartItemIds || cartItemIds.length === 0) {
        throw new Error('No cart items to clear');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Try the new dedicated remove-multiple endpoint first
      console.log('Clearing cart with IDs:', cartItemIds);
      console.log('Making request to:', `${API_URL}/cart/remove-multiple`);
      console.log('Request headers:', headers);
      console.log('Request body:', JSON.stringify({ cartItems: cartItemIds }));
      
      const response = await fetch(`${API_URL}/cart/remove-multiple`, {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({
          cartItems: cartItemIds
        })
      });

      console.log('Response status:', response.status);

      // If endpoint doesn't exist (404), try fallback method
      if (response.status === 404) {
        console.log('remove-multiple endpoint not found, trying fallback method...');
        return await clearCartFallback(cartItemIds, headers);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response received:', responseText);
        
        // If it's a 404 HTML page, try fallback
        if (response.status === 404 || responseText.includes('<html')) {
          console.log('HTML error page received, trying fallback method...');
          return await clearCartFallback(cartItemIds, headers);
        }
        
        throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to clear cart`);
      }

      // Update local cart state
      setCart([]);

      return { 
        success: true, 
        message: data.message || 'Cart cleared successfully' 
      };

    } catch (error) {
      console.error('Error clearing cart:', error);
      
      // Provide more specific error messages
      if (error.message.includes('JSON Parse error')) {
        return { 
          success: false, 
          message: 'Server error: Invalid response format. Please check if the API endpoint exists.' 
        };
      }
      
      return { 
        success: false, 
        message: error.message || 'Failed to clear cart' 
      };
    }
  };
    
  
  return (
    <UserContext.Provider
      value={{
        isLoggedIn: !!token && dataProfile && !!dataProfile,
        loadingProfile: loadingProfile,
        errorProfile,
        formetedProfileData,
        setProfile,
        setFormetedProfileData,
        refreshProfile,
        logout,
        addToCart,
        clearCart,
        cart,
        setCart,
        cartItems,
        cartCount,
        fetchCartItems,
        getProductCartInfo,
        updateCartQuantity,
        removeFromCart,
        networkStatus,
        isPickup,
        setIsPickup,
        instructions,
        setInstructions
      }}>
      {props.children}
    </UserContext.Provider>
  )
}
export const useUserContext = () => useContext(UserContext)
export const UserConsumer = UserContext.Consumer
export default UserContext