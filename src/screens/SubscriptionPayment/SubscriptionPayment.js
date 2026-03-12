import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Alert,
  BackHandler,
  Dimensions
} from 'react-native'
import { WebView } from 'react-native-webview'
import { useNavigation, useRoute } from '@react-navigation/native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useSubscription } from '../../context/Subscription'
import { useAppBranding } from '../../utils/translationHelper'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { API_URL } from '../../config/api'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'

const { width } = Dimensions.get('window')

/* Design tokens matching Subscription screen */
const GOLD = '#C9A84C'
const GOLD_LIGHT = '#E8CC7A'
const DARK_BG = '#0F0F0F'
const CARD_BG = '#1A1A1A'
const CARD_BORDER = '#2A2A2A'
const TEXT_PRIMARY = '#F5F0E8'
const TEXT_SECONDARY = '#8A8070'
const GREEN = '#23C55E'

const SubscriptionPayment = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { addContactCredits } = useSubscription()
  const { primaryColor } = useAppBranding()
  const themeContext = useContext(ThemeContext)
  const authContext = useContext(AuthContext)
  const userContext = useContext(UserContext)
  
  const [loading, setLoading] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('razorpay')
  const [paymentUrl, setPaymentUrl] = useState(null)
  const [userData, setUserData] = useState(null)
  const [userToken, setUserToken] = useState(null)
  
  const amount = route?.params?.amount || 49
  const title = route?.params?.title || 'Gold Membership'
  const credits = route?.params?.credits || 7
  const duration = route?.params?.duration || 30

  // Get token and user data from contexts
  const token = authContext?.token
  const user = userContext?.dataProfile

  // Load user data from AsyncStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token')
        const storedUser = await AsyncStorage.getItem('user')
        const storedUserData = await AsyncStorage.getItem('userData')
        
        console.log('AsyncStorage raw data:', {
          token: storedToken ? 'EXISTS' : 'NULL',
          user: storedUser ? 'EXISTS' : 'NULL',
          userData: storedUserData ? 'EXISTS' : 'NULL'
        })
        
        // Try both possible user data keys
        let parsedUser = null
        if (storedUser) {
          try {
            parsedUser = JSON.parse(storedUser)
            console.log('Successfully parsed user data from "user" key')
          } catch (e) {
            console.error('Failed to parse user from "user" key:', e)
          }
        }
        
        if (!parsedUser && storedUserData) {
          try {
            parsedUser = JSON.parse(storedUserData)
            console.log('Successfully parsed user data from "userData" key')
          } catch (e) {
            console.error('Failed to parse user from "userData" key:', e)
          }
        }
        
        console.log('Final parsed user data:', parsedUser ? 'SUCCESS' : 'NULL')
        
        if (parsedUser) {
          console.log('User data structure:', {
            keys: Object.keys(parsedUser),
            _id: parsedUser._id,
            userId: parsedUser.userId,
            email: parsedUser.email,
            name: parsedUser.name,
            phoneNumber: parsedUser.phoneNumber,
            phone: parsedUser.phone,
            fullName: parsedUser.fullName
          })
        }
        
        setUserData(parsedUser)
        setUserToken(storedToken)
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    loadUserData()
  }, [])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (paymentProcessing) {
        return true // Prevent going back during payment
      }
      return false
    })

    return () => backHandler.remove()
  }, [paymentProcessing])

  const createPaymentLink = async () => {
    try {
      setLoading(true)
      
      // Use the most reliable user data source
      let effectiveUser = user || userData
      let effectiveToken = token || userToken
      
      console.log('Payment - Using data:', {
        contextToken: token ? 'exists' : 'none',
        contextUser: user ? 'exists' : 'none',
        storedToken: userToken ? 'exists' : 'none',
        storedUser: userData ? 'exists' : 'none',
        effectiveToken: effectiveToken ? 'exists' : 'none',
        effectiveUser: effectiveUser ? 'exists' : 'none'
      })
      
      if (!effectiveToken || !effectiveUser) {
        Alert.alert('Error', 'Please login to continue')
        navigation.navigate('Login')
        return
      }
      
      // Extract user info with fallbacks
      const paymentData = {
        amount: amount, // Convert to paise for Razorpay
        email: effectiveUser.email || 'user@example.com',
        name: effectiveUser.name || effectiveUser.fullName || 'User',
        contact: effectiveUser.phoneNumber || effectiveUser.phone || '9999999999',
        notes: {
          userId: effectiveUser._id || effectiveUser.userId,
          subscriptionType: 'contact_credits',
          credits: credits,
          duration: duration
        }
      }

      console.log('Creating payment with data:', paymentData)

      const response = await axios.post(`${API_URL}/payment/process`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`
        }
      })

      if (response.data.success && response.data.paymentLink) {
        setPaymentUrl(response.data.paymentLink)
        setPaymentProcessing(true)
      } else {
        throw new Error(response.data.message || 'Failed to create payment link')
      }
    } catch (error) {
      console.error('Payment link creation error:', error)
      Alert.alert(
        'Payment Error',
        error.response?.data?.message || error.message || 'Failed to initialize payment'
      )
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      setPaymentProcessing(true)
      
      // Add 7 contact credits for 30 days
      const success = await addContactCredits(credits)
      
      if (success) {
        Alert.alert(
          'Payment Successful!',
          `You have received ${credits} contact credits valid for ${duration} days.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to subscription screen or home
                navigation.goBack()
              }
            }
          ]
        )
      } else {
        Alert.alert(
          'Payment Processed',
          'Payment was successful but there was an issue adding credits. Please contact support.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        )
      }
    } catch (error) {
      console.error('Error adding credits after payment:', error)
      Alert.alert(
        'Error',
        'Something went wrong while processing your subscription. Please contact support.'
      )
    } finally {
      setPaymentProcessing(false)
    }
  }

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error)
    setPaymentProcessing(false)
    Alert.alert(
      'Payment Failed',
      'Your payment could not be completed. Please try again.'
    )
  }

  const handleRazorpayPayment = async () => {
    await createPaymentLink()
  }

  const PaymentMethodCard = ({ 
    icon, 
    title, 
    description, 
    value, 
    selected, 
    onClick, 
    disabled = false 
  }) => (
    <TouchableOpacity 
      style={[
        s.paymentCard,
        selected 
          ? s.paymentCardSelected 
          : s.paymentCardUnselected,
        disabled && s.paymentCardDisabled
      ]}
      onPress={disabled ? undefined : onClick}
      activeOpacity={0.8}
    >
      <View style={s.paymentCardHeader}>
        <View style={[
          s.paymentIconWrap,
          selected && s.paymentIconWrapSelected
        ]}>
          {icon}
        </View>
        <View style={s.paymentCardText}>
          <Text style={s.paymentCardTitle}>{title}</Text>
          <Text style={s.paymentCardDesc}>{description}</Text>
        </View>
        {selected && (
          <View style={s.checkCircle}>
            <MaterialIcons name="check" size={16} color={DARK_BG} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  if (paymentUrl) {
    // Show WebView for payment
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
        
        <View style={s.paymentHeader}>
          <TouchableOpacity 
            onPress={() => {
              if (!paymentProcessing) {
                setPaymentUrl(null)
                setPaymentProcessing(false)
              }
            }}
            style={s.backBtn}
            disabled={paymentProcessing}
          >
            <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Complete Payment</Text>
          <View style={{ width: 36 }} />
        </View>

        <WebView
          source={{ uri: paymentUrl }}
          style={s.webview}
          onNavigationStateChange={(navState) => {
            if (navState.url.includes('/payment-success') || navState.url.includes('/success')) {
              handlePaymentSuccess()
            } else if (navState.url.includes('/payment-failed') || navState.url.includes('/failure')) {
              handlePaymentError('Payment failed')
            }
          }}
          onLoadStart={() => setPaymentProcessing(true)}
          onLoadEnd={() => setPaymentProcessing(false)}
        />

        {paymentProcessing && (
          <View style={s.paymentOverlay}>
            <View style={s.paymentModal}>
              <ActivityIndicator size="large" color={GOLD} />
              <Text style={s.paymentProcessingText}>Processing payment...</Text>
              <Text style={s.paymentSubText}>Please don't close this window</Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Complete Purchase</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Order Summary */}
        <View style={s.summaryCard}>
          <View style={s.summaryHeader}>
            <MaterialIcons name="workspace-premium" size={24} color={GOLD} />
            <Text style={s.summaryTitle}>Order Summary</Text>
          </View>
          
          <View style={s.summaryContent}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Plan</Text>
              <Text style={s.summaryValue}>{title}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Contact Credits</Text>
              <Text style={s.summaryValue}>{credits} Credits</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Valid For</Text>
              <Text style={s.summaryValue}>{duration} Days</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryRow}>
              <Text style={s.summaryTotalLabel}>Total Amount</Text>
              <Text style={s.summaryTotalValue}>₹{amount}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={s.sectionLabel}>Choose Payment Method</Text>
        
        <View style={s.paymentMethods}>
          <PaymentMethodCard
            icon={<MaterialIcons name="credit-card" size={24} color={GOLD} />}
            title="Pay with Razorpay"
            description="Secure online payment with cards, UPI, net banking"
            value="razorpay"
            selected={selectedPayment === "razorpay"}
            onClick={() => setSelectedPayment("razorpay")}
          />
        </View>

        {/* Security Notice */}
        <View style={s.securityNotice}>
          <MaterialIcons name="security" size={20} color={GREEN} />
          <View style={s.securityText}>
            <Text style={s.securityTitle}>Secure Payment</Text>
            <Text style={s.securityDesc}>Your payment information is encrypted and secure</Text>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={s.payButton}
          onPress={handleRazorpayPayment}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <View style={s.loadingContent}>
              <ActivityIndicator size="small" color={DARK_BG} />
              <Text style={s.payButtonText}>Processing...</Text>
            </View>
          ) : (
            <View style={s.payButtonContent}>
              <Text style={s.payButtonText}>Pay ₹{amount}</Text>
              <MaterialIcons name="arrow-forward" size={18} color={DARK_BG} />
            </View>
          )}
        </TouchableOpacity>

        <Text style={s.termsText}>
          By completing this purchase, you agree to our{' '}
          <Text style={s.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={s.termsLink}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG
  },
  
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: 0.4
  },

  scroll: { paddingBottom: 48 },

  /* Order Summary */
  summaryCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginLeft: 12
  },
  summaryContent: {
    gap: 12
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: '500'
  },
  summaryValue: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: '600'
  },
  summaryDivider: {
    height: 1,
    backgroundColor: CARD_BORDER,
    marginVertical: 8
  },
  summaryTotalLabel: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    fontWeight: '700'
  },
  summaryTotalValue: {
    fontSize: 18,
    color: GOLD,
    fontWeight: '800'
  },

  /* Payment Methods */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12
  },
  paymentMethods: {
    paddingHorizontal: 16,
    gap: 12
  },
  paymentCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16
  },
  paymentCardUnselected: {
    borderColor: CARD_BORDER
  },
  paymentCardSelected: {
    borderColor: GOLD,
    backgroundColor: GOLD + '10'
  },
  paymentCardDisabled: {
    opacity: 0.5
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  paymentIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: CARD_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  paymentIconWrapSelected: {
    backgroundColor: GOLD + '20'
  },
  paymentCardText: {
    flex: 1
  },
  paymentCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: 0.1
  },
  paymentCardDesc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    marginTop: 2
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center'
  },

  /* Security Notice */
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GREEN + '30',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16
  },
  securityText: {
    flex: 1,
    marginLeft: 12
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: GREEN,
    marginBottom: 2
  },
  securityDesc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 18
  },

  /* Pay Button */
  payButton: {
    backgroundColor: GOLD,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 17,
    shadowColor: GOLD,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  payButtonText: {
    color: DARK_BG,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginRight: 8
  },

  /* Terms */
  termsText: {
    fontSize: 11,
    color: TEXT_SECONDARY + 'AA',
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 16,
    lineHeight: 17,
    letterSpacing: 0.1
  },
  termsLink: {
    color: GOLD,
    fontWeight: '600'
  },

  /* WebView Payment */
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER
  },
  webview: {
    flex: 1
  },
  paymentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paymentModal: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 32
  },
  paymentProcessingText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4
  },
  paymentSubText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center'
  }
})

export default SubscriptionPayment
