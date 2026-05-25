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
  BackHandler
} from 'react-native'
import RazorpayCheckout from 'react-native-razorpay'
import { useNavigation, useRoute } from '@react-navigation/native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useSubscription } from '../../context/Subscription'
import { API_URL } from '../../config/api'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'

const GOLD = '#C9A84C'
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
  const authContext = useContext(AuthContext)
  const userContext = useContext(UserContext)

  const [loading, setLoading] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [userData, setUserData] = useState(null)
  const [userToken, setUserToken] = useState(null)

  const amount = route?.params?.amount || 49
  const title = route?.params?.title || 'Gold Membership'
  const credits = route?.params?.credits || 7
  const duration = route?.params?.duration || 30

  const token = authContext?.token
  const user = userContext?.dataProfile

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token')
        const storedUser = await AsyncStorage.getItem('user')
        const storedUserData = await AsyncStorage.getItem('userData')

        let parsedUser = null
        if (storedUser) {
          try { parsedUser = JSON.parse(storedUser) } catch (e) {}
        }
        if (!parsedUser && storedUserData) {
          try { parsedUser = JSON.parse(storedUserData) } catch (e) {}
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
      if (paymentProcessing) return true
      return false
    })
    return () => backHandler.remove()
  }, [paymentProcessing])

  const handleRazorpayPayment = async () => {
    const effectiveUser = user || userData
    const effectiveToken = token || userToken

    if (!effectiveToken || !effectiveUser) {
      Alert.alert('Error', 'Please login to continue')
      navigation.navigate('Login')
      return
    }

    try {
      setLoading(true)

      // Step 1: create Razorpay order on backend
      const orderRes = await axios.post(
        `${API_URL}/payment/create-order`,
        { amount },
        { headers: { Authorization: `Bearer ${effectiveToken}` } }
      )

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create order')
      }

      const { order_id, key_id } = orderRes.data

      setLoading(false)
      setPaymentProcessing(true)

      // Step 2: open Razorpay native checkout
      const options = {
        description: title,
        currency: 'INR',
        key: key_id,
        amount: amount * 100, // paise
        order_id,
        name: '7ARK',
        prefill: {
          email: effectiveUser.email || '',
          contact: effectiveUser.phoneNumber || effectiveUser.phone || '',
          name: effectiveUser.name || effectiveUser.fullName || 'User'
        },
        theme: { color: GOLD }
      }

      const paymentData = await RazorpayCheckout.open(options)

      // Step 3: payment success — add credits
      await handlePaymentSuccess({
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature
      })
    } catch (error) {
      setPaymentProcessing(false)
      // Razorpay SDK throws { code, description } on user cancellation
      if (error?.code && error?.description) {
        if (error.code !== 0) {
          // code 0 = user pressed back/cancel — no alert needed
          Alert.alert('Payment Failed', error.description)
        }
      } else {
        const message = error.response?.data?.message || error.message || 'Payment failed'
        Alert.alert('Payment Error', message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (razorpayParams = {}) => {
    try {
      const success = await addContactCredits(credits, duration, {
        amount,
        ...razorpayParams
      })

      if (success) {
        Alert.alert(
          'Payment Successful!',
          `You have received ${credits} contact credits valid for ${duration} days.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        )
      } else {
        Alert.alert(
          'Payment Processed',
          'Payment was successful but there was an issue adding credits. Please contact support.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        )
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while processing your subscription. Please contact support.')
    } finally {
      setPaymentProcessing(false)
    }
  }

  const PaymentMethodCard = ({ icon, title: cardTitle, description, selected, onClick }) => (
    <TouchableOpacity
      style={[s.paymentCard, selected ? s.paymentCardSelected : s.paymentCardUnselected]}
      onPress={onClick}
      activeOpacity={0.8}
    >
      <View style={s.paymentCardHeader}>
        <View style={[s.paymentIconWrap, selected && s.paymentIconWrapSelected]}>
          {icon}
        </View>
        <View style={s.paymentCardText}>
          <Text style={s.paymentCardTitle}>{cardTitle}</Text>
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

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Complete Purchase</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

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

        <Text style={s.sectionLabel}>Choose Payment Method</Text>

        <View style={s.paymentMethods}>
          <PaymentMethodCard
            icon={<MaterialIcons name="credit-card" size={24} color={GOLD} />}
            title="Pay with Razorpay"
            description="Cards, UPI, net banking & wallets"
            selected
            onClick={() => {}}
          />
        </View>

        <View style={s.securityNotice}>
          <MaterialIcons name="security" size={20} color={GREEN} />
          <View style={s.securityText}>
            <Text style={s.securityTitle}>Secure Payment</Text>
            <Text style={s.securityDesc}>Your payment information is encrypted and secure</Text>
          </View>
        </View>

        <TouchableOpacity
          style={s.payButton}
          onPress={handleRazorpayPayment}
          disabled={loading || paymentProcessing}
          activeOpacity={0.9}
        >
          {loading || paymentProcessing ? (
            <View style={s.loadingContent}>
              <ActivityIndicator size="small" color={DARK_BG} />
              <Text style={s.payButtonText}>
                {paymentProcessing ? 'Processing...' : 'Loading...'}
              </Text>
            </View>
          ) : (
            <View style={s.payButtonContent}>
              <Text style={s.payButtonText}>Pay ₹{amount}</Text>
              <MaterialIcons name="arrow-forward" size={18} color={DARK_BG} style={{ marginLeft: 8 }} />
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
  container: { flex: 1, backgroundColor: DARK_BG },
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
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: CARD_BORDER
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY, letterSpacing: 0.4 },
  scroll: { paddingBottom: 48 },
  summaryCard: {
    backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1,
    borderColor: CARD_BORDER, marginHorizontal: 16, marginVertical: 16, padding: 20
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: TEXT_PRIMARY, marginLeft: 12 },
  summaryContent: { gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '500' },
  summaryValue: { fontSize: 14, color: TEXT_PRIMARY, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: CARD_BORDER, marginVertical: 8 },
  summaryTotalLabel: { fontSize: 16, color: TEXT_PRIMARY, fontWeight: '700' },
  summaryTotalValue: { fontSize: 18, color: GOLD, fontWeight: '800' },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: TEXT_SECONDARY,
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginHorizontal: 20, marginTop: 24, marginBottom: 12
  },
  paymentMethods: { paddingHorizontal: 16, gap: 12 },
  paymentCard: { backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, padding: 16 },
  paymentCardUnselected: { borderColor: CARD_BORDER },
  paymentCardSelected: { borderColor: GOLD, backgroundColor: GOLD + '10' },
  paymentCardHeader: { flexDirection: 'row', alignItems: 'center' },
  paymentIconWrap: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: CARD_BORDER,
    alignItems: 'center', justifyContent: 'center', marginRight: 14
  },
  paymentIconWrapSelected: { backgroundColor: GOLD + '20' },
  paymentCardText: { flex: 1 },
  paymentCardTitle: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY, letterSpacing: 0.1 },
  paymentCardDesc: { fontSize: 12, color: TEXT_SECONDARY, lineHeight: 18, marginTop: 2 },
  checkCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center'
  },
  securityNotice: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: GREEN + '15', borderRadius: 12, borderWidth: 1,
    borderColor: GREEN + '30', marginHorizontal: 16, marginTop: 16, padding: 16
  },
  securityText: { flex: 1, marginLeft: 12 },
  securityTitle: { fontSize: 14, fontWeight: '600', color: GREEN, marginBottom: 2 },
  securityDesc: { fontSize: 12, color: TEXT_SECONDARY, lineHeight: 18 },
  payButton: {
    backgroundColor: GOLD, borderRadius: 16, marginHorizontal: 16, marginTop: 24,
    paddingVertical: 17, shadowColor: GOLD, shadowOpacity: 0.35,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8
  },
  payButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loadingContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  payButtonText: {
    color: DARK_BG, fontSize: 16, fontWeight: '800', letterSpacing: 0.3, marginRight: 8
  },
  termsText: {
    fontSize: 11, color: TEXT_SECONDARY + 'AA', textAlign: 'center',
    marginHorizontal: 32, marginTop: 16, lineHeight: 17, letterSpacing: 0.1
  },
  termsLink: { color: GOLD, fontWeight: '600' }
})

export default SubscriptionPayment
