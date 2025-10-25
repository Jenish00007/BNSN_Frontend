import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'expo-webview';
import axios from 'axios';
import { API_URL } from '../config/api';

const PaymentGateway = ({ amount, name, email, contact, onSuccess, onError }) => {
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);

  useEffect(() => {
    createPaymentLink();
  }, []);

  const createPaymentLink = async () => {
    try {
      const response = await axios.post(`${API_URL}/payment/process`, {
        amount,
        name,
        email,
        contact,
      });
      setPaymentUrl(response.data.paymentLink);
      setLoading(false);
    } catch (error) {
      onError(error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onNavigationStateChange={navState => {
          if (navState.url.includes('/payment-success')) {
            onSuccess();
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, height: 500 },
  webview: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default PaymentGateway; 