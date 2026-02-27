import React from 'react'
import { View, StyleSheet, Text, Alert } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import PaymentGateway from '../components/PaymentGateway'
import { useSubscription } from '../context/Subscription'

const PaymentScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { activateUnlimitedContacts } = useSubscription()

  const amount = route?.params?.amount || 99
  const title = route?.params?.title || 'Elite Buyer Subscription'

  const handlePaymentSuccess = async () => {
    try {
      const success = await activateUnlimitedContacts()
      if (success) {
        Alert.alert('Success', 'You are now an Elite Buyer!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ])
      } else {
        Alert.alert(
          'Error',
          'Payment went through, but we could not activate your subscription. Please contact support.'
        )
      }
    } catch (error) {
      console.error('Error activating subscription after payment:', error)
      Alert.alert(
        'Error',
        'Something went wrong while activating your subscription. Please try again.'
      )
    }
  }

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error)
    Alert.alert('Payment Failed', 'Your payment could not be completed.')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>Amount: ₹{amount}</Text>

      <PaymentGateway
        amount={amount}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  amount: {
    fontSize: 18,
    marginBottom: 20
  }
})

export default PaymentScreen
