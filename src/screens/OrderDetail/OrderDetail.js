import { TouchableOpacity, View, ScrollView, Dimensions, Alert, Text, Image, ActivityIndicator, StyleSheet } from 'react-native'

import { MaterialIcons } from '@expo/vector-icons'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { scale } from '../../utils/scaling'
import { alignment } from '../../utils/alignment'
import styles from './styles'
import React, { useContext, useState, useRef, useEffect } from 'react'
import Spinner from '../../components/Spinner/Spinner'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import TextError from '../../components/Text/TextError/TextError'
import ConfigurationContext from '../../context/Configuration'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import analytics from '../../utils/analytics'
import Detail from '../../components/OrderDetail/Detail/Detail'
import RestaurantMarker from '../../assets/SVG/restaurant-marker'
import CustomerMarker from '../../assets/SVG/customer-marker'
import TrackingRider from '../../components/OrderDetail/TrackingRider/TrackingRider'
import { mapStyle } from '../../utils/mapStyle'
import { useTranslation } from 'react-i18next'
import { HelpButton } from '../../components/Header/HeaderIcons/HeaderIcons'
import { ProgressBar, checkStatus } from '../../components/Main/ActiveOrders/ProgressBar'
import { useNavigation } from '@react-navigation/native'
import { PriceRow } from '../../components/OrderDetail/PriceRow'
import { ORDER_STATUS_ENUM } from '../../utils/enums'
import { CancelModal } from '../../components/OrderDetail/CancelModal'
import Button from '../../components/Button/Button'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { calulateRemainingTime } from '../../utils/customFunctions'
import { Instructions } from '../../components/Checkout/Instructions'
import MapViewDirections from 'react-native-maps-directions'
import useEnvVars from '../../../environment'
import LottieView from 'lottie-react-native'
import AuthContext from '../../context/Auth'
import { StatusBar } from 'react-native'
import { HeaderBackButton } from '@react-navigation/elements'
import navigationService from '../../routes/navigationService'
import { API_URL } from '../../config/api'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppBranding } from '../../utils/translationHelper'
import { WebView } from 'react-native-webview'
import { Modal } from 'react-native'

const { height: HEIGHT, width: WIDTH } = Dimensions.get('screen')

// Ensure Image gets a valid URI string
function getSafeImageUri(value) {
  try {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length === 0) return 'https://via.placeholder.com/60'
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
      return `https://${trimmed}`
    }
    if (value && typeof value === 'object') {
      if (typeof value.url === 'string' && value.url.trim().length > 0) return value.url.trim()
      if (typeof value.uri === 'string' && value.uri.trim().length > 0) return value.uri.trim()
    }
  } catch (e) {}
  return 'https://via.placeholder.com/60'
}

// Enhanced styles with modern design
const enhancedStyles = (branding) => ({
  container: {
    flex: 1,
    backgroundColor: branding.backgroundColor,
  },
  gradientHeader: {
    height: scale(180),
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    paddingHorizontal: scale(20),
    paddingTop: scale(40),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusCard: {
    backgroundColor: branding.backgroundColor,
    margin: scale(16),
    marginTop: scale(-60),
    borderRadius: scale(20),
    padding: scale(24),
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    alignItems: 'center',
  },
  statusImageContainer: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: branding.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(16),
  },
  statusTitle: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: branding.textColor,
    marginBottom: scale(8),
  },
  estimatedTime: {
    fontSize: scale(32),
    fontWeight: '800',
    color: branding.primaryColor,
    marginBottom: scale(4),
  },
  estimatedLabel: {
    fontSize: scale(14),
    color: branding.textColor,
    marginBottom: scale(20),
  },
  modernCard: {
    backgroundColor: branding.backgroundColor,
    marginHorizontal: scale(16),
    marginVertical: scale(8),
    borderRadius: scale(16),
    padding: scale(20),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: branding.textColor,
    marginBottom: scale(16),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(12),
  },
  infoLabel: {
    fontSize: scale(14),
    color: branding.textColor,
    flex: 1,
  },
  infoValue: {
    fontSize: scale(14),
    fontWeight: '600',
    color: branding.textColor,
    flex: 1,
    textAlign: 'right',
  },
  mapContainer: {
    height: HEIGHT * 0.35,
    margin: scale(16),
    borderRadius: scale(20),
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  itemCard: {
    backgroundColor: branding.backgroundColor,
    marginHorizontal: scale(1),
    marginVertical: scale(4),
    borderRadius: scale(12),
    padding: scale(6),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  itemImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(12),
    marginRight: scale(12),
    backgroundColor: branding.secondaryBackground,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: scale(16),
    fontWeight: '600',
    color: branding.textColor,
    marginBottom: scale(4),
  },
  itemShop: {
    fontSize: scale(14),
    color: branding.textColor,
    marginBottom: scale(2),
  },
  itemPrice: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: branding.primaryColor,
  },
  bottomContainer: {
    backgroundColor: branding.backgroundColor,
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(12),
  },
  totalLabel: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: branding.textColor,
  },
  totalValue: {
    fontSize: scale(24),
    fontWeight: '800',
    color: branding.primaryColor,
  },
  cancelButton: {
    backgroundColor: branding.cartDeleteColor || '#FF4757',
    paddingVertical: scale(16),
    paddingHorizontal: scale(24),
    borderRadius: scale(12),
    marginTop: scale(16),
    elevation: 4,
    shadowColor: branding.cartDeleteColor || '#FF4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cancelButtonText: {
    color: branding.whiteColorText || '#FFFFFF',
    fontSize: scale(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  otpContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: scale(12),
    marginVertical: scale(8),
    alignItems: 'center',
    width: '100%',
  },
  otpLabel: {
    fontSize: scale(14),
    marginBottom: scale(4),
    fontWeight: '600',
  },
  otpValue: {
    fontSize: scale(32),
    fontWeight: 'bold',
    letterSpacing: scale(4),
    marginBottom: scale(4),
  },
  otpDescription: {
    fontSize: scale(12),
    textAlign: 'center',
    marginTop: scale(4),
  },
  // Payment Modal Styles
  paymentModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModalContent: {
    backgroundColor: branding.backgroundColor,
    borderRadius: scale(20),
    padding: scale(24),
    width: WIDTH * 0.9,
    maxHeight: HEIGHT * 0.8,
  },
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  paymentModalTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: branding.textColor,
  },
  closeButton: {
    padding: scale(8),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    borderWidth: 1,
    borderColor: branding.secondaryColor,
    borderRadius: scale(12),
    marginVertical: scale(8),
    backgroundColor: branding.backgroundColor,
  },
  selectedPaymentOption: {
    borderColor: branding.primaryColor,
    backgroundColor: branding.primaryColor + '10',
  },
  paymentOptionText: {
    fontSize: scale(16),
    fontWeight: '500',
    color: branding.textColor,
    marginLeft: scale(12),
    flex: 1,
  },
  paymentButton: {
    backgroundColor: branding.primaryColor,
    paddingVertical: scale(16),
    paddingHorizontal: scale(24),
    borderRadius: scale(12),
    marginTop: scale(20),
    alignItems: 'center',
  },
  paymentButtonText: {
    color: branding.whiteColorText || '#FFFFFF',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  qrCodeContainer: {
    alignItems: 'center',
    padding: scale(20),
    backgroundColor: branding.backgroundColor,
    borderRadius: scale(12),
    marginVertical: scale(16),
  },
  qrCodeText: {
    fontSize: scale(16),
    color: branding.textColor,
    textAlign: 'center',
    marginBottom: scale(16),
  },
  qrCodePlaceholder: {
    width: scale(200),
    height: scale(200),
    backgroundColor: branding.secondaryColor,
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  qrCodePlaceholderText: {
    color: branding.textColor,
    textAlign: 'center',
  },
  // Top Payment Buttons Styles
  paymentButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: scale(16),
    paddingHorizontal: scale(8),
    paddingVertical: scale(8),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: scale(12),
  },
  topPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    borderRadius: scale(25),
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minWidth: scale(130),
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  razorpayButton: {
    backgroundColor: '#2196F3', // Blue for Razorpay
  },
  topPaymentButtonText: {
    color: branding.whiteColorText || '#FFFFFF',
    fontSize: scale(12),
    fontWeight: '600',
    marginLeft: scale(6),
  },
})

function OrderDetail(props) {
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState(null)
  // Payment related states
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentLink, setPaymentLink] = useState(null)
  const [qrCodeData, setQrCodeData] = useState(null)
  // Animation refs removed to prevent callback leaks
  // const fadeAnim = useRef(new Animated.Value(0)).current
  // const slideAnim = useRef(new Animated.Value(50)).current
  // const animationRef = useRef(null)
  
  const Analytics = analytics()
  const id = props.route.params ? props.route.params.id : null
  const configuration = useContext(ConfigurationContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const branding = useAppBranding();
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { GOOGLE_MAPS_KEY } = useEnvVars()
  const mapView = useRef(null)
  const { token } = useContext(AuthContext)

  useEffect(() => {
    if (id) {
      fetchOrderDetails()
    } else {
      setError('No order ID provided')
      setLoading(false)
    }
  }, [id])


  // Animation effect removed to prevent callback leaks

  // Cleanup effect removed since animations are disabled

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      setOrder(null)
      
      if (!id) {
        throw new Error('No order ID provided')
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
console.log(id)
      const response = await fetch(
        `${API_URL}/order/get-order/${id}`,
        {
          method: 'GET',
          headers: headers,
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data || !data.success || !data.order) {
        throw new Error('No order data received')
      }

      const formattedOrder = {
        _id: data.order._id || '',
        status: (data.order.status || 'pending').toLowerCase(),
        totalPrice: data.order.totalPrice || 0,
        createdAt: data.order.createdAt || new Date().toISOString(),
        itemsQty: data.order.itemsQty || 0,
        items: (data.order.items || []).map(item => ({
          _id: item._id || '',
          name: item.name || "Product not found",
          image: item.image || "",
          price: item.price || 0,
          quantity: item.quantity || 1,
          shopName: item.shopName || "Shop not found",
          addons: item.addons || []
        })),
        shippingAddress: {
          ...data.order.shippingAddress,
          address: data.order.shippingAddress?.address || '',
          latitude: data.order.shippingAddress?.latitude || 0,
          longitude: data.order.shippingAddress?.longitude || 0
        },
        paymentInfo: {
          status: data.order.paymentInfo?.status || 'pending',
          type: data.order.paymentInfo?.type || 'cash_on_delivery'
        },
        paidAt: data.order.paidAt || null,
        delivery_instruction: data.order.delivery_instruction || '',
        delivery_man: data.order.delivery_man || null,
        store: data.order.store || null,
        otp: data.order.otp || null
      }

      if (!formattedOrder._id || !formattedOrder.status) {
        throw new Error('Invalid order data received')
      }

      setOrder(formattedOrder)

    } catch (err) {
      console.error('Error fetching order:', err)
      let errorMessage = 'Failed to load order details'
      
      if (err.message.includes('Network request failed')) {
        errorMessage = 'Network error: Please check your internet connection'
      } else if (err.message.includes('not authorized')) {
        errorMessage = 'You are not authorized to view this order'
      } else if (err.message.includes('not found')) {
        errorMessage = 'Order not found'
      } else {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (cancellationReason) => {
    try {
      setCancelling(true)
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }

      const response = await fetch(`${API_URL}/order/cancel-order/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ 
          cancellationReason: cancellationReason || 'Cancelled by user'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to cancel order')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to cancel order')
      }

      FlashMessage({
        message: data.message || 'Order cancelled successfully'
      })
      
      // Refresh order details to get updated status
      await fetchOrderDetails()
      
    } catch (error) {
      console.error('Error cancelling order:', error)
      Alert.alert(
        'Error',
        error.message || 'Failed to cancel order. Please try again.'
      )
    } finally {
      setCancelling(false)
      setCancelModalVisible(false)
    }
  }

  // Payment handling functions
  const handleRazorpayPayment = async () => {
    if (!order) {
      Alert.alert('Error', 'Order data not available. Please try again.')
      return
    }
    
    try {
      setIsProcessingPayment(true)
      
      console.log('Fetching Razorpay key from:', `${API_URL}/payment/razorpayapikey`)
      
      // Get Razorpay key from backend
      const keyResponse = await fetch(`${API_URL}/payment/razorpayapikey`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })

      console.log('Key Response Status:', keyResponse.status)

      const responseText = await keyResponse.text()
      console.log('Key Response Text:', responseText)

      if (!keyResponse.ok) {
        throw new Error(`Failed to get Razorpay key: ${responseText}`)
      }

      let keyData
      try {
        keyData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        throw new Error('Invalid JSON response from server')
      }

      if (!keyData || !keyData.keyId) {
        console.error('Invalid key data:', keyData)
        throw new Error('Invalid Razorpay key received from server')
      }

      console.log('Successfully got Razorpay key')

      // Create payment link on your backend
      console.log('Creating order with amount:', order?.totalPrice)
      
      const orderResponse = await fetch(`${API_URL}/payment/process`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          amount: order?.totalPrice,
          name: "Jenish",
          email: "jenish.m0708@gmail.com",
          contact: "7418291374"
        })
      })

      console.log('Order Response Status:', orderResponse.status)
      
      const orderResponseText = await orderResponse.text()
      console.log('Order Response Text:', orderResponseText)

      if (!orderResponse.ok) {
        throw new Error(`Failed to create payment order: ${orderResponseText}`)
      }

      let orderData
      try {
        orderData = JSON.parse(orderResponseText)
        console.log('Order Data:', orderData)
      } catch (parseError) {
        console.error('Order JSON Parse Error:', parseError)
        throw new Error('Invalid JSON response from server')
      }

      if (!orderData.success || !orderData.paymentLink) {
        throw new Error(orderData.error || 'Invalid order data received')
      }

      const paymentLink = orderData.paymentLink
      console.log('Successfully created payment link:', paymentLink)
      setPaymentLink(paymentLink)

    } catch (error) {
      console.error('Payment error:', error)
      Alert.alert(
        'Payment Failed',
        error.message || 'Failed to process payment. Please try again.'
      )
    } finally {
      setIsProcessingPayment(false)
    }
  }



  const updateOrderPaymentStatus = async (paymentId, paymentStatus = 'Succeeded') => {
    try {
      const response = await fetch(`${API_URL}/order/update-payment/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          paymentInfo: {
            status: paymentStatus,
            type: paymentMethod,
            paymentId: paymentId
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update payment status')
      }

      const data = await response.json()
      
      if (data.success) {
        FlashMessage({
          message: 'Payment successful! Order updated.'
        })
        await fetchOrderDetails() // Refresh order data
        setPaymentModalVisible(false)
        setPaymentLink(null)
        setQrCodeData(null)
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      Alert.alert('Error', 'Payment successful but failed to update order. Please contact support.')
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // We'll create custom header
    })
  }, [navigation])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FFA726'
      case 'processing': return '#42A5F5'
      case 'picked_up': return '#AB47BC'
      case 'delivered': return '#66BB6A'
      case 'cancelled': return '#EF5350'
      default: return '#9E9E9E'
    }
  }
  

  const renderStatusCard = () => (
    <View 
      style={[
        enhancedStyles(branding).statusCard
      ]}
    >
      {/* Payment Buttons - Top Row */}
      {order && (order?.status === 'pending' || order?.status === 'processing') && 
       order?.paymentInfo?.status !== 'Succeeded' && order?.paymentInfo?.status !== 'succeeded' && (
        <View style={enhancedStyles(branding).paymentButtonsRow}>
          <TouchableOpacity 
            style={[enhancedStyles(branding).topPaymentButton, enhancedStyles(branding).razorpayButton]}
            onPress={() => {
              setPaymentMethod('razorpay')
              handleRazorpayPayment()
            }}
          >
            <MaterialIcons name="payment" size={20} color={branding.whiteColorText || '#FFFFFF'} />
            <Text style={enhancedStyles(branding).topPaymentButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={enhancedStyles(branding).statusImageContainer}>
        <OrderStatusImage status={order?.status} />
      </View>
      
      <Text style={enhancedStyles(branding).statusTitle}>
        {t(order?.status?.toUpperCase() || 'PENDING')}
      </Text>
      
      {/* Delivery OTP Hidden as per requirement */}
      {/* {order?.otp && (
        <View style={[enhancedStyles(branding).otpContainer, { backgroundColor: branding.primaryColor + '15' }]}>
          <Text style={[enhancedStyles(branding).otpLabel, { color: branding.primaryColor }]}>
            {t('Delivery OTP')}
          </Text>
          <Text style={[enhancedStyles(branding).otpValue, { color: branding.primaryColor }]}>
            {order?.otp ? order.otp.toString().padStart(6, '0') : '000000'}
          </Text>
          <Text style={[enhancedStyles(branding).otpDescription, { color: branding.textColor }]}>
            {t('Show this OTP to the delivery person')}
          </Text>
        </View>
      )} */}
      
      {order?.status !== 'delivered' && !['pending', 'cancelled'].includes(order?.status) && (
        <>
          <Text style={enhancedStyles(branding).estimatedTime}>40 {t('mins')}</Text>
          <Text style={enhancedStyles(branding).estimatedLabel}>{t('estimatedDeliveryTime')}</Text>
          <ProgressBar
            configuration={configuration}
            currentTheme={currentTheme}
            orderStatus={order?.status}
          />
        </>
      )}
    </View>
  )

  const renderOrderInfo = () => (
    <View style={enhancedStyles(branding).modernCard}>
      <Text style={enhancedStyles(branding).cardTitle}>Order Information</Text>
      
      <View style={enhancedStyles(branding).infoRow}>
        <Text style={enhancedStyles(branding).infoLabel}>Order ID</Text>
        <Text style={enhancedStyles(branding).infoValue}>#{order?._id?.slice(-8) || 'N/A'}</Text>
      </View>
      
      <View style={enhancedStyles(branding).infoRow}>
        <Text style={enhancedStyles(branding).infoLabel}>Status</Text>
        <View style={{
          paddingHorizontal: scale(12),
          paddingVertical: scale(4),
          borderRadius: scale(12),
          backgroundColor: getStatusColor(order?.status) + '20'
        }}>
          <Text style={[enhancedStyles(branding).infoValue, { color: getStatusColor(order?.status) }]}>
            {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
          </Text>
        </View>
      </View>
      
      <View style={enhancedStyles(branding).infoRow}>
        <Text style={enhancedStyles(branding).infoLabel}>Payment Status</Text>
        <Text style={enhancedStyles(branding).infoValue}>{order?.paymentInfo?.status || 'Unknown'}</Text>
      </View>
      
      <View style={enhancedStyles(branding).infoRow}>
        <Text style={enhancedStyles(branding).infoLabel}>Payment Method</Text>
        <Text style={enhancedStyles(branding).infoValue}>{order?.paymentInfo?.type || 'Unknown'}</Text>
      </View>
      
      <View style={enhancedStyles(branding).infoRow}>
        <Text style={enhancedStyles(branding).infoLabel}>Order Date</Text>
        <Text style={enhancedStyles(branding).infoValue}>
          {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
      </View>
    </View>
  )

  const renderShippingInfo = () => (
    <View style={enhancedStyles(branding).modernCard}>
      <Text style={enhancedStyles(branding).cardTitle}>Delivery Address</Text>
      
      <View style={enhancedStyles(branding).infoRow}>
        <Text style={enhancedStyles(branding).infoLabel}>Name</Text>
        <Text style={enhancedStyles(branding).infoValue}>{order?.shippingAddress?.name || 'N/A'}</Text>
      </View>
      
      <View style={enhancedStyles(branding).infoRow}>
        <Text style={enhancedStyles(branding).infoLabel}>Phone</Text>
        <Text style={enhancedStyles(branding).infoValue}>{order?.shippingAddress?.phone || 'N/A'}</Text>
      </View>
      
      <View style={enhancedStyles(branding).infoRow}>
        <Text style={enhancedStyles(branding).infoLabel}>Address</Text>
        <Text style={[enhancedStyles(branding).infoValue, { flex: 2 }]}>
          {order?.shippingAddress?.address || 'N/A'}
        </Text>
      </View>
    </View>
  )

  const renderOrderItems = () => (
    <View style={enhancedStyles(branding).modernCard}>
      <Text style={enhancedStyles(branding).cardTitle}>Order Items ({order?.items?.length || 0})</Text>
      
      {order?.items?.map((item, index) => (
        <View key={item._id || index} style={enhancedStyles(branding).itemCard}>
          <View style={enhancedStyles(branding).itemHeader}>
            <Image 
              source={{ uri: getSafeImageUri(item.image) }} 
              style={enhancedStyles(branding).itemImage}
            />
            <View style={enhancedStyles(branding).itemInfo}>
              <Text style={enhancedStyles(branding).itemName}>{item.name}</Text>
              {/* <Text style={enhancedStyles(branding).itemShop}>{item.shopName}</Text> */}
              <Text style={enhancedStyles(branding).itemPrice}>₹{item.price}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={enhancedStyles(branding).infoValue}>Qty: {item.quantity}</Text>
              <Text style={enhancedStyles(branding).itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  )

  const renderPaymentModal = () => {
    // Don't render modal if order is null
    if (!order) {
      return null;
    }

    return (
      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={enhancedStyles(branding).paymentModal}>
          <View style={enhancedStyles(branding).paymentModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={enhancedStyles(branding).paymentModalHeader}>
                <Text style={enhancedStyles(branding).paymentModalTitle}>
                  {t('payNow') || 'Pay Now'}
                </Text>
                <TouchableOpacity
                  style={enhancedStyles(branding).closeButton}
                  onPress={() => {
                    setPaymentModalVisible(false)
                    setPaymentLink(null)
                    setQrCodeData(null)
                  }}
                >
                  <MaterialIcons name="close" size={24} color={branding.textColor} />
                </TouchableOpacity>
              </View>

              {/* Order Summary */}
              <View style={enhancedStyles(branding).modernCard}>
                <Text style={enhancedStyles(branding).cardTitle}>Order Summary</Text>
                <View style={enhancedStyles(branding).infoRow}>
                  <Text style={enhancedStyles(branding).infoLabel}>Order ID</Text>
                  <Text style={enhancedStyles(branding).infoValue}>#{order._id?.slice(-8) || 'N/A'}</Text>
                </View>
                <View style={enhancedStyles(branding).infoRow}>
                  <Text style={enhancedStyles(branding).infoLabel}>Items</Text>
                  <Text style={enhancedStyles(branding).infoValue}>{order.items?.length || 0} items</Text>
                </View>
                <View style={enhancedStyles(branding).infoRow}>
                  <Text style={[enhancedStyles(branding).infoLabel, { fontWeight: 'bold', fontSize: scale(16) }]}>Total Amount</Text>
                  <Text style={[enhancedStyles(branding).infoValue, { fontWeight: 'bold', fontSize: scale(16), color: branding.primaryColor }]}>₹{order.totalPrice?.toFixed(2) || '0.00'}</Text>
                </View>
              </View>

            {/* Payment Options - Only show if accessed via old flow */}
            {!paymentLink && !qrCodeData && paymentMethod === 'razorpay' && (
              <View style={{ alignItems: 'center', marginTop: scale(20) }}>
                <ActivityIndicator size="large" color={branding.primaryColor} />
                <Text style={[enhancedStyles(branding).cardTitle, { textAlign: 'center', marginTop: scale(16) }]}>
                  Preparing Razorpay Payment...
                </Text>
              </View>
            )}

            {/* QR Code Display */}
            {qrCodeData && (
              <View style={enhancedStyles(branding).qrCodeContainer}>
                <Text style={enhancedStyles(branding).qrCodeText}>
                  Scan this QR code with any UPI app to pay
                </Text>
                
                {/* Web-based QR Code using Google Charts API */}
                <View style={enhancedStyles(branding).qrCodePlaceholder}>
                  <Image 
                    source={{ 
                      uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData || '')}`
                    }}
                    style={{
                      width: scale(200),
                      height: scale(200),
                      borderRadius: scale(12),
                    }}
                    resizeMode="contain"
                  />
                </View>
                
                <View style={{
                  backgroundColor: branding.secondaryColor,
                  padding: scale(12),
                  borderRadius: scale(8),
                  marginVertical: scale(12),
                }}>
                  <Text style={[enhancedStyles(branding).qrCodeText, { fontSize: scale(12), fontFamily: 'monospace' }]}>
                    UPI ID: merchant@upi{'\n'}
                    Amount: ₹{order?.totalPrice?.toFixed(2) || '0.00'}{'\n'}
                    Order: #{order?._id?.slice(-8) || 'N/A'}
                  </Text>
                </View>
                
                <Text style={[enhancedStyles(branding).qrCodeText, { fontSize: scale(14) }]}>
                  After payment, tap "Payment Completed" below
                </Text>
                
                <TouchableOpacity
                  style={enhancedStyles(branding).paymentButton}
                  onPress={() => {
                    Alert.alert(
                      'Payment Confirmation',
                      'Have you completed the payment?',
                      [
                        { text: 'No', style: 'cancel' },
                        { 
                          text: 'Yes, Paid', 
                          onPress: () => updateOrderPaymentStatus('UPI_' + Date.now(), 'Succeeded')
                        }
                      ]
                    )
                  }}
                >
                  <Text style={enhancedStyles(branding).paymentButtonText}>
                    Payment Completed
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
    );
  }


  const renderContent = () => {
    if (loading) {
      return (
        <View style={[enhancedStyles(branding).container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Spinner
            backColor={branding.backgroundColor}
            spinnerColor={branding.primaryColor}
          />
        </View>
      )
    }

    if (error) {
      return (
        <View style={[enhancedStyles(branding).container, { justifyContent: 'center', alignItems: 'center' }]}>
          <TextError text={error} />
        </View>
      )
    }

    if (!order) {
      return (
        <View style={[enhancedStyles(branding).container, { justifyContent: 'center', alignItems: 'center' }]}>
          <TextDefault>Order not found</TextDefault>
        </View>
      )
    }

    return (
      <>
        <ScrollView
          style={enhancedStyles(branding).container}
          showsVerticalScrollIndicator={false}
          overScrollMode='never'
        >
          {/* Custom Header with Gradient */}
          <LinearGradient
            colors={[branding.primaryColor, branding.secondaryColor]}
            style={enhancedStyles(branding).gradientHeader}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => navigationService.goBack()}
                style={{
                  padding: scale(8),
                  borderRadius: scale(12),
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={{
                fontSize: scale(18),
                fontWeight: 'bold',
                color: '#FFFFFF'
              }}>
                {t('orderDetails')}
              </Text>
              <View style={{ width: 40 }} />
            </View>
          </LinearGradient>

          {/* Status Card */}
          {renderStatusCard()}

          {/* Map for active deliveries */}
          {order?.delivery_man && order?.status === 'picked_up' && order?.shippingAddress && (
            <View style={enhancedStyles(branding).mapContainer}>
              <MapView
                ref={(c) => (mapView.current = c)}
                style={{ flex: 1 }}
                showsUserLocation={false}
                initialRegion={{
                  latitude: +order?.shippingAddress?.latitude,
                  longitude: +order?.shippingAddress?.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421
                }}
                zoomEnabled={true}
                zoomControlEnabled={true}
                rotateEnabled={false}
                customMapStyle={mapStyle}
                provider={PROVIDER_GOOGLE}
              >
                {order.store && (
                  <Marker
                    coordinate={{
                      longitude: +order?.store?.longitude,
                      latitude: +order?.store?.latitude
                    }}
                  >
                    <RestaurantMarker />
                  </Marker>
                )}
                {order?.shippingAddress && (
                  <Marker
                    coordinate={{
                      latitude: +order?.shippingAddress?.latitude,
                      longitude: +order?.shippingAddress?.longitude
                    }}
                  >
                    <CustomerMarker />
                  </Marker>
                )}
                {order?.store && order?.shippingAddress && (
                  <MapViewDirections
                    origin={{
                      longitude: +order?.store?.longitude,
                      latitude: +order.store.latitude
                    }}
                    destination={{
                      latitude: +order?.shippingAddress?.latitude,
                      longitude: +order?.shippingAddress?.longitude
                    }}
                    apikey={GOOGLE_MAPS_KEY}
                    strokeWidth={6}
                    strokeColor={branding.primaryColor}
                    optimizeWaypoints={true}
                    onReady={(result) => {
                      mapView?.current?.fitToCoordinates(result.coordinates, {
                        edgePadding: {
                          right: WIDTH / 20,
                          bottom: HEIGHT / 20,
                          left: WIDTH / 20,
                          top: HEIGHT / 20
                        }
                      })
                    }}
                  />
                )}
                {order.delivery_man && <TrackingRider id={order.delivery_man.id} />}
              </MapView>
            </View>
          )}

          {/* Instructions */}
          {order.delivery_instruction && (
            <Instructions 
              title={'Delivery Instructions'} 
              theme={currentTheme} 
              message={order.delivery_instruction} 
            />
          )}

          {/* Order Information */}
          {renderOrderInfo()}

          {/* Shipping Information */}
          {renderShippingInfo()}

          {/* Order Items */}
          {renderOrderItems()}

          <View style={{ height: scale(100) }} />
        </ScrollView>

        {/* Bottom Container */}
        <View style={enhancedStyles(branding).bottomContainer}>
          <View style={enhancedStyles(branding).totalRow}>
            <Text style={enhancedStyles(branding).totalLabel}>Total Amount</Text>
            <Text style={enhancedStyles(branding).totalValue}>₹{order.totalPrice?.toFixed(2) || '0.00'}</Text>
          </View>
          
          
          <TouchableOpacity 
              style={enhancedStyles(branding).cancelButton}
              onPress={() => setCancelModalVisible(true)}
            >
              <Text style={enhancedStyles(branding).cancelButtonText}>
                {t('cancelOrder')}
              </Text>
            </TouchableOpacity>
       
        </View>
      </>
    )
  }

  // Handle Razorpay WebView
  if (paymentLink) {
    return (
      <View style={{ flex: 1, height: 500 }}>
        <WebView
          source={{ uri: paymentLink }}
          style={{ flex: 1 }}
          onNavigationStateChange={navState => {
            // Handle payment success/cancel
            if (navState.url.includes('/payment-success')) {
              // Update order payment status and refresh
              updateOrderPaymentStatus('RAZORPAY_' + Date.now(), 'Succeeded')
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
    <View style={{ flex: 1 }}>
      <StatusBar
        backgroundColor={branding.headerColor}
        barStyle="light-content"
        translucent={false}
        animated={true}
      />
      {renderContent()}
      {renderPaymentModal()}
      <CancelModal
        theme={currentTheme}
        modalVisible={cancelModalVisible}
        setModalVisible={() => setCancelModalVisible(false)}
        cancelOrder={handleCancelOrder}
        loading={cancelling}
        orderStatus={order?.status}
        orderId={id}
      />
    </View>
  )
}

export const OrderStatusImage = ({ status }) => {
  if (!status) {
    return (
      <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialIcons name="hourglass-empty" size={60} color="#9E9E9E" />
      </View>
    )
  }

  const statusLower = status.toLowerCase()
  let imagePath = null

  switch (statusLower) {
    case 'pending':
      imagePath = require('../../assets/SVG/order-placed.json')
      break
    case 'processing':
      imagePath = require('../../assets/SVG/food-picked.json')
      break
    case 'delivered':
      imagePath = require('../../assets/SVG/order-delivered.json')
      break
    case 'cancelled':
      return (
        <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="cancel" size={60} color="#EF5350" />
        </View>
      )
    default:
      return (
        <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="help-outline" size={60} color="#9E9E9E" />
        </View>
      )
  }

  if (!imagePath) {
    return (
      <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialIcons name="help-outline" size={60} color="#9E9E9E" />
      </View>
    )
  }

  return (
    <LottieView
      style={{
        width: 80,
        height: 80
      }}
      source={imagePath}
      autoPlay
      loop
    />
  )
}

export default OrderDetail