import React, { useState, useEffect, useContext } from 'react';

import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  useColorScheme,
  StatusBar,
  StyleSheet,
  Linking,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUserContext } from './../../context/User';
import OrderSummaryStyles from './OrderSummaryStyles';
import PaymentMethod from '../../components/Payment/PaymentMethod';
import AuthContext from '../../context/Auth';
import { LocationContext } from '../../context/Location';
import { API_URL } from '../../config/api'
import { WebView } from 'react-native-webview';
import { useAppBranding } from '../../utils/translationHelper';
import useDeliveryAvailability from '../../hooks/useDeliveryAvailability';
import { checkDeliveryAvailability } from '../../utils/locationUtils';
import CurrentLocation from '../../components/CurrentLocation/CurrentLocation';

const OrderSummary = ({ route }) => {
  // Get cart data from navigation params
  const {   
    cartItems,
    priceSummary,
    total,
    subtotal,
    totalDiscount,
    currency
  } = route.params || {};
  
  const { token } = useContext(AuthContext);
  const { location } = useContext(LocationContext);
  const { cart, clearCart, updateCart } = useUserContext();
  const navigation = useNavigation();
  const branding = useAppBranding();
  
  // Check delivery availability for the current location
  const { availability, loading: deliveryLoading } = useDeliveryAvailability(location);

  // Initialize with navigation params if available, otherwise use context
  const [cartItemsState, setCartItemsState] = useState(cartItems || (cart?.items || []));
  const [totalAmount, setTotalAmount] = useState(total || 0);
  const [activeSection, setActiveSection] = useState('address');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  // Form state for new address
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    addressType: 'Home',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Load cart items and addresses from context/navigation and storage
  useEffect(() => {
    // If cart items were passed from navigation, use those
    if (cartItems) {
      setCartItemsState(cartItems);
      calculateTotalAmount(cartItems);
    } else {
      // Otherwise fetch from context
      refreshCartData();
    }
    
    // Load saved addresses
    loadAddresses();
  }, []);

  // Function to refresh cart data from context
  const refreshCartData = () => {
    if (cart && cart.items) {
      setCartItemsState(cart.items);
      
      // Calculate total amount
      calculateTotalAmount(cart.items);
    }
  };

  // Calculate total amount from cart items
  const calculateTotalAmount = (items) => {
    if (!Array.isArray(items)) {
      setTotalAmount(0);
      return;
    }
    
    // If we have price summary from navigation params, use that
    if (priceSummary) {
      setTotalAmount(priceSummary.total);
      return;
    }
    
    // Otherwise calculate from items
    const total = items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    setTotalAmount(total);
  };

  // Listen for cart updates from context
  useEffect(() => {
    if (!cartItems && cart && cart.items) {
      setCartItemsState(cart.items);
      calculateTotalAmount(cart.items);
    }
  }, [cart]);

  // Load addresses from AsyncStorage
  const loadAddresses = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem('addresses');
      if (savedAddresses) {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
        
        // If there's at least one address, select the first one by default
        if (parsedAddresses.length > 0) {
          setSelectedAddress(parsedAddresses[0]);
        }
      }
    } catch (error) {
      console.error('Error loading addresses', error);
    }
  };

  // Save a new address
  const saveAddress = async () => {
    // Validate the form using the validation function
    if (!validateAddressForm()) {
      return;
    }

    try {
      const address = { ...newAddress, id: Date.now().toString() };
      const updatedAddresses = [...addresses, address];
      
      await AsyncStorage.setItem('addresses', JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
      setSelectedAddress(address);
      setShowAddressForm(false);
      
      // Reset form
      setNewAddress({
        name: '',
        phone: '',
        pincode: '',
        locality: '',
        address: '',
        city: '',
        state: '',
        addressType: 'Home',
      });
      
      Alert.alert(
        'Success', 
        'Address saved successfully',
        [
          { 
            text: 'Continue', 
            style: 'default', 
            onPress: () => setActiveSection('payment') 
          }
        ]
      );
    } catch (error) {
      console.error('Error saving address', error);
      Alert.alert('Error', 'Failed to save address');
    }
  };

  // Handle address selection
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  // Handle payment method selection
  const handleSelectPayment = (method) => {
    setPaymentMethod(method);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setNewAddress({ ...newAddress, [field]: value });
  };

  // Validate address form fields
  const validateAddressForm = () => {
    const requiredFields = ['name', 'phone', 'pincode', 'address', 'city', 'state'];
    const missingFields = requiredFields.filter(field => !newAddress[field] || newAddress[field].trim() === '');
    
    if (missingFields.length > 0) {
      const fieldNames = {
        name: 'Full Name',
        phone: 'Phone Number',
        pincode: 'Pincode',
        address: 'Address',
        city: 'City',
        state: 'State'
      };
      
      const missingFieldNames = missingFields.map(field => fieldNames[field]).join(', ');
      Alert.alert(
        'Incomplete Address', 
        `Please fill in the following required fields: ${missingFieldNames}`,
        [{ text: 'OK', style: 'default' }]
      );
      return false;
    }
    
    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(newAddress.phone)) {
      Alert.alert(
        'Invalid Phone Number', 
        'Please enter a valid 10-digit phone number',
        [{ text: 'OK', style: 'default' }]
      );
      return false;
    }
    
    // Validate pincode format
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(newAddress.pincode)) {
      Alert.alert(
        'Invalid Pincode', 
        'Please enter a valid 6-digit pincode',
        [{ text: 'OK', style: 'default' }]
      );
      return false;
    }
    
    return true;
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      console.log('Fetching Razorpay key from:', `${API_URL}/payment/razorpayapikey`);
      
      // Get Razorpay key from backend
      const keyResponse = await fetch(`${API_URL}/payment/razorpayapikey`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      console.log('Key Response Status:', keyResponse.status);
      console.log('Key Response Headers:', keyResponse.headers);

      const responseText = await keyResponse.text();
      console.log('Key Response Text:', responseText);

      if (!keyResponse.ok) {
        throw new Error(`Failed to get Razorpay key: ${responseText}`);
      }

      let keyData;
      try {
        keyData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (!keyData || !keyData.keyId) {
        console.error('Invalid key data:', keyData);
        throw new Error('Invalid Razorpay key received from server');
      }

      console.log('Successfully got Razorpay key');

      // Create payment link on your backend
      console.log('Creating order with amount:', totalAmount);
      
      const orderResponse = await fetch(`${API_URL}/payment/process`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          amount: totalAmount,
          name: "Jenish",
          email: "jenish.m0708@gmail.com",
          contact: "7418291374"
        })
      });

      console.log('Order Response Status:', orderResponse.status);
      
      const orderResponseText = await orderResponse.text();
      console.log('Order Response Text:', orderResponseText);

      if (!orderResponse.ok) {
        throw new Error(`Failed to create payment order: ${orderResponseText}`);
      }

      let orderData;
      try {
        orderData = JSON.parse(orderResponseText);
        console.log('Order Data:', orderData);
      } catch (parseError) {
        console.error('Order JSON Parse Error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (!orderData.success || !orderData.paymentLink) {
        throw new Error(orderData.error || 'Invalid order data received');
      }
      const paymentLink = orderData.paymentLink;
      console.log('Successfully created payment link:', paymentLink);
      setPaymentLink(paymentLink);

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'Failed to process payment. Please try again.'
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePlaceOrder = async (paymentType = 'cash_on_delivery', paymentId = null) => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    // Removed blocking validation for latitude/longitude to allow order placement without location

    try {
      setIsLoading(true);

      const orderData = {
        cart: cartItemsState.map(item => ({
          _id: item.product?._id || item._id,
          name: item.product?.name || item.name,
          price: item.product?.discountPrice || item.price,
          qty: item.quantity,
          shopId: item.product?.shopId,
          shopName: item.product?.shop?.name || "Shop not found",
          images: item.product?.images || item.images,
          totalPrice: (item.product?.discountPrice || item.price) * item.quantity,
          productDetails: {
            name: item.product?.name || item.name,
            description: item.product?.description || "",
            category: item.product?.category?.name || "",
            subcategory: item.product?.subcategory?.name || "",
            tags: item.product?.tags || "",
            originalPrice: item.product?.originalPrice || item.price,
            discountPrice: item.product?.discountPrice || item.price,
            stock: item.product?.stock || 0
          }
        })),
        shippingAddress: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          locality: selectedAddress.locality,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          addressType: selectedAddress.addressType
        },
        user: {
          _id: token ? token.split('.')[1] : null,
          name: selectedAddress.name,
          email: selectedAddress.email || '',
          phone: selectedAddress.phone
        },
        totalPrice: totalAmount,
        paymentInfo: {
          type: paymentType,
          status: paymentType === 'cash_on_delivery' ? 'Pending' : 'Succeeded',
          paymentId: paymentId
        },
        // Add user's live location coordinates
        userLocation: {
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          deliveryAddress: location?.deliveryAddress || null
        }
      };
      console.log('Order Data with Location:', orderData);
      const response = await fetch(`${API_URL}/order/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(orderData),
      });
      
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        throw new Error('Server returned non-JSON response. Please try again.');
      }
      
      if (response.ok) {
        if (!cartItems && clearCart) {
          clearCart();
        }
        
        const storedOrders = await AsyncStorage.getItem('orders');
        const orders = storedOrders ? JSON.parse(storedOrders) : [];
        orders.push(responseData.orders[0]); // Store the first order from response
        await AsyncStorage.setItem('orders', JSON.stringify(orders));
        
        navigation.navigate('OrderConfirmation', { order: responseData.orders[0] });
      } else {
        console.error('API Error:', responseData);
        
        // Handle delivery radius validation errors
        if (responseData.unavailableShops && responseData.unavailableShops.length > 0) {
          const unavailableShops = responseData.unavailableShops.map(shop => shop.shopName).join(', ');
          Alert.alert(
            'Not Available for Your Location',
            [
              { text: 'OK', style: 'default' }
            ]
          );
        } else {
          Alert.alert('Error', responseData.message || 'Failed to place order');
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Progress to next section
  const proceedToNext = () => {
    if (activeSection === 'address') {
      // Check if user is in the middle of adding a new address
      if (showAddressForm) {
        // Validate the address form
        if (!validateAddressForm()) {
          return;
        }
        // If form is valid, save the address first
        saveAddress();
        return;
      }
      
      // Check if no address is selected
      if (!selectedAddress) {
        Alert.alert(
          'Address Required', 
          'Please add address details to continue with your order',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Add Address', style: 'default', onPress: () => setShowAddressForm(true) }
          ]
        );
        return;
      }

      // Check minimum order amount
      if (totalAmount < 100) {
        Alert.alert(
          'Minimum Order Required',
          'Please add more products. Minimum order is ₹100',
          [
            { 
              text: 'Continue Shopping', 
              style: 'default',
              onPress: () => navigation.navigate('Menu')
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      // Check delivery availability
      if (availability && !availability.available) {
        Alert.alert(
          'Delivery Not Available',
          'We only deliver within 5km of Tirupattur Bus Stand. Please check your location or contact support.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
        return;
      }

      setActiveSection('payment');
    } else if (activeSection === 'payment') {
      if (paymentMethod === 'razorpay') {
        handleRazorpayPayment();
      } else {
        handlePlaceOrder();
      }
    }
  };

  // Go back to previous section
  const goBack = () => {
    if (activeSection === 'payment') {
      setActiveSection('address');
    } else {
      navigation.goBack();
    }
  };

  // Import styles
  const styles = OrderSummaryStyles;

  if (paymentLink) {
    return (
      <View style={{ flex: 1, height: 500 }}>
        <WebView
          source={{ uri: paymentLink }}
          style={{ flex: 1 }}
          onNavigationStateChange={navState => {
            // Handle payment success/cancel
            if (navState.url.includes('/payment-success')) {
              // Navigate to menu after successful payment
              navigation.reset({
                index: 0,
                routes: [{ name: 'Menu' }],
              });
            } else if (navState.url.includes('/payment-failed')) {
              // Handle payment failure
              Alert.alert(
                'Payment Failed',
                'Your payment was not successful. Please try again.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setPaymentLink(null);
                    }
                  }
                ]
              );
            }
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
      <StatusBar 
        backgroundColor={branding.primaryColor}
        barStyle="dark-content"
      />
      
      {/* Checkout Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: branding.secondaryColor }]}>
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, { backgroundColor: branding.primaryColor }]}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <Text style={[styles.stepText, { color: branding.primaryColor }]}>Delivery Address</Text>
        </View>
        <View style={[styles.progressLine, activeSection === 'payment' || activeSection === 'summary' ? { backgroundColor: branding.primaryColor } : { backgroundColor: branding.secondaryColor }]} />
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, activeSection === 'payment' || activeSection === 'summary' ? { backgroundColor: branding.primaryColor } : { backgroundColor: branding.secondaryColor }]}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={[styles.stepText, activeSection === 'payment' || activeSection === 'summary' ? { color: branding.primaryColor } : { color: branding.textColor }]}>Payment Method</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Address Section */}
        {activeSection === 'address' && (
          <View style={[styles.section, { backgroundColor: branding.secondaryColor }]}>
            <Text style={[styles.sectionTitle, { color: branding.textColor }]}>Select Delivery Address</Text>
            
            {/* Address List */}
            {addresses.map((address) => (
              <TouchableOpacity 
                key={address.id} 
                style={[
                  styles.addressCard,
                  { borderColor: branding.secondaryColor },
                  selectedAddress?.id === address.id && { borderColor: branding.primaryColor, backgroundColor: branding.secondaryColor }
                ]}
                onPress={() => handleSelectAddress(address)}
              >
                <View style={[styles.addressTypeContainer, { backgroundColor: branding.secondaryColor }]}>
                  <Text style={[styles.addressType, { color: branding.textColor }]}>{address.addressType}</Text>
                </View>
                <Text style={[styles.addressName, { color: branding.textColor }]}>{address.name}</Text>
                <Text style={[styles.addressDetails, { color: branding.textColor }]}>
                  {address.address}, {address.locality}, {address.city}, {address.state} - {address.pincode}
                </Text>
                <Text style={[styles.addressPhone, { color: branding.textColor }]}>Phone: {address.phone}</Text>
                
                {selectedAddress?.id === address.id && (
                  <View style={styles.selectedCheckmark}>
                    <Icon name="check-circle" size={24} color={branding.primaryColor} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            
            {/* Add New Address Button */}
            {!showAddressForm ? (
              <TouchableOpacity 
                style={[styles.addAddressButton, { borderColor: branding.primaryColor }]} 
                onPress={() => setShowAddressForm(true)}
              >
                <Icon name="add" size={24} color={branding.primaryColor} />
                <Text style={[styles.addAddressText, { color: branding.primaryColor }]}>Add New Address</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.addressForm, { backgroundColor: branding.secondaryColor }]}>
                <Text style={[styles.formTitle, { color: branding.textColor }]}>Add New Address</Text>
                
                <View style={styles.formRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: branding.backgroundColor, 
                      color: branding.textColor,
                      borderColor: branding.secondaryColor 
                    }]}
                    placeholder="Full Name *"
                    placeholderTextColor={branding.textColor}
                    value={newAddress.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: branding.backgroundColor, 
                      color: branding.textColor,
                      borderColor: branding.secondaryColor 
                    }]}
                    placeholder="Phone Number *"
                    placeholderTextColor={branding.textColor}
                    keyboardType="phone-pad"
                    value={newAddress.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                  />
                </View>
                
                <View style={styles.formRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: branding.backgroundColor, 
                      color: branding.textColor,
                      borderColor: branding.secondaryColor 
                    }]}
                    placeholder="Pincode *"
                    placeholderTextColor={branding.textColor}
                    keyboardType="number-pad"
                    value={newAddress.pincode}
                    onChangeText={(text) => handleInputChange('pincode', text)}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: branding.backgroundColor, 
                      color: branding.textColor,
                      borderColor: branding.secondaryColor 
                    }]}
                    placeholder="Locality"
                    placeholderTextColor={branding.textColor}
                    value={newAddress.locality}
                    onChangeText={(text) => handleInputChange('locality', text)}
                  />
                </View>
                
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: branding.backgroundColor, 
                    color: branding.textColor,
                    borderColor: branding.secondaryColor 
                  }]}
                  placeholder="Address (House No, Building, Street, Area) *"
                  placeholderTextColor={branding.textColor}
                  multiline
                  numberOfLines={3}
                  value={newAddress.address}
                  onChangeText={(text) => handleInputChange('address', text)}
                />
                
                <View style={styles.formRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: branding.backgroundColor, 
                      color: branding.textColor,
                      borderColor: branding.secondaryColor 
                    }]}
                    placeholder="City/Town *"
                    placeholderTextColor={branding.textColor}
                    value={newAddress.city}
                    onChangeText={(text) => handleInputChange('city', text)}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: branding.backgroundColor, 
                      color: branding.textColor,
                      borderColor: branding.secondaryColor 
                    }]}
                    placeholder="State *"
                    placeholderTextColor={branding.textColor}
                    value={newAddress.state}
                    onChangeText={(text) => handleInputChange('state', text)}
                  />
                </View>
                
                <View style={styles.addressTypeSelector}>
                  <Text style={[styles.addressTypeLabel, { color: branding.textColor }]}>Address Type:</Text>
                  <View style={styles.addressTypeOptions}>
                    <TouchableOpacity
                      style={[
                        styles.addressTypeOption,
                        { borderColor: branding.secondaryColor },
                        newAddress.addressType === 'Home' && { 
                          borderColor: branding.primaryColor, 
                          backgroundColor: branding.secondaryColor 
                        }
                      ]}
                      onPress={() => handleInputChange('addressType', 'Home')}
                    >
                      <Text style={[
                        newAddress.addressType === 'Home' 
                          ? { color: branding.primaryColor, fontWeight: 'bold' } 
                          : { color: branding.textColor }
                      ]}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.addressTypeOption,
                        { borderColor: branding.secondaryColor },
                        newAddress.addressType === 'Work' && { 
                          borderColor: branding.primaryColor, 
                          backgroundColor: branding.secondaryColor 
                        }
                      ]}
                      onPress={() => handleInputChange('addressType', 'Work')}
                    >
                      <Text style={[
                        newAddress.addressType === 'Work' 
                          ? { color: branding.primaryColor, fontWeight: 'bold' } 
                          : { color: branding.textColor }
                      ]}>Work</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.formButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => setShowAddressForm(false)}
                  >
                    <Text style={[styles.cancelButtonText, { color: branding.textColor }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: branding.primaryColor }]} 
                    onPress={saveAddress}
                  >
                    <Text style={styles.saveButtonText}>Save Address</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* Payment Method Section - Now using the PaymentMethod component */}
        {activeSection === 'payment' && (
          <View style={[styles.section, { backgroundColor: branding.secondaryColor }]}>
            <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
              Select Payment Method
            </Text>


            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'razorpay' && styles.selectedPayment,
                { borderColor: branding.secondaryColor }
              ]}
              onPress={() => setPaymentMethod('razorpay')}
            >
              <Icon name="credit-card" size={22} color={branding.primaryColor} />
              <View style={styles.paymentOptionText}>
                <Text style={[styles.paymentText, { color: branding.textColor }]}>Pay with Razorpay</Text>
              </View>
              {paymentMethod === 'razorpay' && (
                <Icon name="check-circle" size={24} style={[styles.checkIcon, { color: branding.primaryColor }]} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cash_on_delivery' && styles.selectedPayment,
                { borderColor: branding.secondaryColor }
              ]}
              onPress={() => setPaymentMethod('cash_on_delivery')}
            >
              <Icon name="currency-rupee" size={22} color={branding.primaryColor} />
              <View style={styles.paymentOptionText}>
                <Text style={[styles.paymentText, { color: branding.textColor }]}>Cash on Delivery</Text>
              </View>
              {paymentMethod === 'cash_on_delivery' && (
                <Icon name="check-circle" size={24} style={[styles.checkIcon, { color: branding.primaryColor }]} />
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Order Summary */}
        <View style={[styles.orderSummary, { backgroundColor: branding.secondaryColor }]}>
          <Text style={[styles.summaryTitle, { color: branding.textColor }]}>Order Summary</Text>
          
          {/* Cart Items */}
          {cartItemsState.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={[styles.itemName, { color: branding.textColor }]}>
                  {item.product?.name || item.name || 'Unknown Item'}
                </Text>
                <Text style={[styles.itemQuantity, { color: branding.textColor }]}>
                  Quantity: {item.quantity}
                </Text>
                <View style={styles.itemPriceDetails}>
                  <Text style={[styles.priceDetail, { color: branding.textColor }]}>
                    Unit Price: ₹{(item.product?.discountPrice || item.price || 0).toFixed(2)}
                  </Text>
                  {item.product?.originalPrice && item.product?.originalPrice > (item.product?.discountPrice || item.price) && (
                    <Text style={[styles.priceDetail, { color: branding.textColor }]}>
                      Original Price: ₹{(item.product?.originalPrice || 0).toFixed(2)}
                    </Text>
                  )}
                  {item.product?.originalPrice && item.product?.originalPrice > (item.product?.discountPrice || item.price) && (
                    <Text style={[styles.priceDetail, { color: '#388e3c' }]}>
                      Discount: -₹{((item.product?.originalPrice || 0) - (item.product?.discountPrice || item.price || 0)).toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={[styles.itemPrice, { color: branding.primaryColor }]}>
                ₹{((item.product?.discountPrice || item.price || 0) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: branding.secondaryColor }]} />
          
          <View style={styles.summaryRow}>
            <Text style={{ color: branding.textColor }}>Price ({cartItemsState.length} items)</Text>
            <Text style={{ color: branding.textColor }}>₹{subtotal?.toFixed(2) || totalAmount.toFixed(2)}</Text>
          </View>
          {totalDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={{ color: branding.textColor }}>Discount</Text>
              <Text style={[styles.discount, { color: '#388e3c' }]}>
                -₹{totalDiscount?.toFixed(2) || '0.00'}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={{ color: branding.textColor }}>Delivery Charges</Text>
            <Text style={[styles.freeDelivery, { color: '#388e3c' }]}>FREE</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: branding.secondaryColor }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalText, { color: branding.textColor }]}>Total Amount</Text>
            <Text style={[styles.totalText, { color: branding.primaryColor }]}>₹{total?.toFixed(2) || totalAmount.toFixed(2)}</Text>
          </View>
          
          {/* Current Location Display */}
          {location && (
            <View style={styles.currentLocationSection}>
              <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
                Your Current Location
              </Text>
              <CurrentLocation 
                location={location}
                showAddress={true}
                showCoordinates={true}
                compact={false}
              />
            </View>
          )}

          {/* Delivery Availability Status */}
          {availability && (
            <View style={[styles.deliveryStatusContainer, { 
              backgroundColor: availability.available ? '#d4edda' : '#f8d7da',
              borderColor: availability.available ? '#c3e6cb' : '#f5c6cb'
            }]}>
              <Icon 
                name={availability.available ? "check-circle" : "cancel"} 
                size={16} 
                color={availability.available ? '#155724' : '#721c24'} 
              />
              <View style={styles.deliveryStatusContent}>
                <Text style={[styles.deliveryStatusText, { 
                  color: availability.available ? '#155724' : '#721c24' 
                }]}>
                  {availability.message}
                </Text>
              </View>
            </View>
          )}
          
          {/* Minimum Order Indicator */}
          {totalAmount < 100 && (
            <View style={[styles.minimumOrderWarning, { 
              backgroundColor: totalAmount < 100 ? '#fff3cd' : '#d4edda',
              borderColor: totalAmount < 100 ? '#ffeaa7' : '#c3e6cb'
            }]}>
              <Icon 
                name={totalAmount < 100 ? "warning" : "check-circle"} 
                size={16} 
                color={totalAmount < 100 ? '#856404' : '#155724'} 
              />
              <Text style={[styles.minimumOrderText, { 
                color: totalAmount < 100 ? '#856404' : '#155724' 
              }]}>
                {totalAmount < 100 
                  ? `Add ₹${(100 - totalAmount).toFixed(2)} more for minimum order` 
                  : 'Minimum order requirement met'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { 
        backgroundColor: branding.secondaryColor,
        borderTopColor: branding.secondaryColor 
      }]}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amountText, { color: branding.textColor }]}>₹{totalAmount.toFixed(2)}</Text>
          {totalAmount < 100 && (
            <Text style={[styles.minimumOrderBottomText, { color: '#856404' }]}>
              Min. ₹100 required
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={[
            styles.proceedButton, 
            { backgroundColor: branding.buttonColor },
            (isLoading || (availability && !availability.available)) && { opacity: 0.7 }
          ]} 
          onPress={proceedToNext}
          disabled={isLoading || (availability && !availability.available)}
        >
          {isLoading ? (
            <ActivityIndicator color={branding.whiteColorText} />
          ) : (
            <Text style={[styles.proceedButtonText, { color: branding.whiteColorText }]}>
              {activeSection === 'address' 
                ? (totalAmount < 100 
                    ? 'Add More Items' 
                    : (availability && !availability.available 
                        ? 'Delivery Not Available' 
                        : 'Continue'
                      )
                  )
                : 'Place Order'
              }
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderSummary;

const styles = StyleSheet.create({
  // ... existing styles ...
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPriceDetails: {
    marginTop: 4,
  },
  priceDetail: {
    fontSize: 12,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  paymentOption: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    flexDirection: 'row', // Added for icon alignment
    alignItems: 'center', // Added for icon alignment
  },
  selectedPayment: {
    borderWidth: 2,
    borderColor: '#F16122',
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10, // Added for icon spacing
  },
  paymentOptionText: {
    flex: 1, // Allow text to take available space
  },
  checkIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  // ... rest of existing styles ...
});