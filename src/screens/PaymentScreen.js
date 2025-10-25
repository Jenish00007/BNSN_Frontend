import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import PaymentGateway from '../components/PaymentGateway';

const PaymentScreen = () => {
  const handlePaymentSuccess = (response) => {
    console.log('Payment successful:', response);
    // Handle successful payment
    // You can navigate to a success screen or show a success message
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    // Handle payment error
    // You can show an error message to the user
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      <Text style={styles.amount}>Amount: ₹1000</Text>
      
      <PaymentGateway
        amount={1000} // Amount in INR
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  amount: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default PaymentScreen; 