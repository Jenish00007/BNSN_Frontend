import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../../config/api'
import { useAppBranding } from '../../utils/translationHelper'

const PaymentScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()

  // Add comprehensive logging and safety check
  console.log('PaymentScreen route:', route)
  console.log('PaymentScreen route.params:', route.params)

  // Safe parameter extraction with fallbacks
  let categoryName = ''
  let cost = 0
  let formData = {}
  let selectedImages = []

  try {
    if (route && route.params) {
      categoryName = route.params.categoryName || ''
      cost = route.params.cost || 0
      formData = route.params.formData || {}
      selectedImages = route.params.selectedImages || []
    }
  } catch (error) {
    console.error('Error extracting route params:', error)
    // Use default values
  }

  console.log('PaymentScreen extracted params:', {
    categoryName,
    cost,
    formData,
    selectedImages
  })

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentData, setPaymentData] = useState(null)
  const branding = useAppBranding()

  useEffect(() => {
    if (cost > 0) {
      createPaymentIntent()
    }
  }, [])

  const createPaymentIntent = async () => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem('token')

      const response = await fetch(`${API_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          categoryName,
          paymentMethod: 'razorpay' // Default payment method
        })
      })

      const result = await response.json()

      if (result.success) {
        setPaymentData(result.paymentData)
      } else {
        Alert.alert('Error', result.message || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Payment intent error:', error)
      Alert.alert('Error', 'Failed to initialize payment')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method')
      return
    }

    try {
      setLoading(true)

      // Here you would integrate with actual payment gateway
      // For now, simulating successful payment
      const mockTransactionId = `txn_${Date.now()}`

      const token = await AsyncStorage.getItem('token')

      const response = await fetch(`${API_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentId: paymentData?.paymentId,
          transactionId: mockTransactionId,
          gatewayResponse: { status: 'success' }
        })
      })

      const result = await response.json()

      if (result.success) {
        // Payment successful, now create the product
        await createProduct(result.payment.id)
      } else {
        Alert.alert('Error', 'Payment verification failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      Alert.alert('Error', 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (paymentId) => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem('token')
      const userData = await AsyncStorage.getItem('user')
      const user = JSON.parse(userData)

      const formDataToSend = new FormData()

      // Add images
      selectedImages.forEach((image, index) => {
        formDataToSend.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `product-image-${index}.jpg`
        })
      })

      // Add category-specific form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value))
          } else {
            formDataToSend.append(key, value.toString())
          }
        }
      })

      // Add user, payment, and category info
      formDataToSend.append('userId', user._id)
      formDataToSend.append('paymentId', paymentId)
      formDataToSend.append('categoryName', categoryName)
      formDataToSend.append('categoryId', route.params?.categoryId || '')
      formDataToSend.append('isPaid', 'true')

      const response = await fetch(`${API_URL}/product/create-product`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      })

      const result = await response.json()

      if (result.success) {
        Alert.alert('Success', 'Ad posted successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ])
      } else {
        Alert.alert('Error', result.message || 'Failed to post ad')
      }
    } catch (error) {
      console.error('Product creation error:', error)
      Alert.alert('Error', 'Failed to post ad')
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    { id: 'razorpay', name: 'Razorpay', icon: 'credit-card' },
    { id: 'phonepe', name: 'PhonePe', icon: 'smartphone' },
    { id: 'upi', name: 'UPI', icon: 'account-balance-wallet' },
    { id: 'netbanking', name: 'Net Banking', icon: 'account-balance' }
  ]

  if (loading && !paymentData) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: branding.backgroundColor }
        ]}
      >
        <ActivityIndicator size='large' color={branding.primaryColor} />
        <Text style={[styles.loadingText, { color: branding.textColor }]}>
          Initializing payment...
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: branding.backgroundColor }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name='arrow-back' size={24} color={branding.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: branding.textColor }]}>
          Payment
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.paymentInfo}>
          <Text style={[styles.categoryName, { color: branding.textColor }]}>
            {categoryName} Category
          </Text>
          <Text style={[styles.amount, { color: branding.primaryColor }]}>
            ₹{cost}
          </Text>
          <Text style={[styles.description, { color: '#666' }]}>
            Payment required to post your ad in this category
          </Text>
        </View>

        {cost > 0 && (
          <View style={styles.paymentMethods}>
            <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
              Select Payment Method
            </Text>

            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  {
                    borderColor:
                      paymentMethod === method.id
                        ? branding.primaryColor
                        : branding.borderColor,
                    backgroundColor:
                      paymentMethod === method.id
                        ? `${branding.primaryColor}20`
                        : branding.backgroundColor
                  }
                ]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <Icon name={method.icon} size={24} color={branding.textColor} />
                <Text
                  style={[
                    styles.paymentMethodText,
                    { color: branding.textColor }
                  ]}
                >
                  {method.name}
                </Text>
                <View
                  style={[
                    styles.radioButton,
                    { borderColor: branding.borderColor }
                  ]}
                >
                  {paymentMethod === method.id && (
                    <View
                      style={[
                        styles.radioButtonSelected,
                        { backgroundColor: branding.primaryColor }
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.payButton,
            { backgroundColor: branding.primaryColor },
            !paymentMethod && cost > 0 && styles.payButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={loading || (!paymentMethod && cost > 0)}
        >
          {loading ? (
            <ActivityIndicator color='white' size='small' />
          ) : (
            <Text style={styles.payButtonText}>
              {cost === 0 ? 'Post for Free' : `Pay ₹${cost}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16
  },
  content: {
    padding: 16
  },
  paymentInfo: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 24
  },
  categoryName: {
    fontSize: 16,
    marginBottom: 8
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    textAlign: 'center'
  },
  paymentMethods: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white'
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  payButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  payButtonDisabled: {
    opacity: 0.5
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  }
})

export default PaymentScreen
