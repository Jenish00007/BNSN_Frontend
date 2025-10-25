import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../config/api';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/user/forgot-password`, { email });
      Alert.alert('Success', 'Check your email for the reset code');
      navigation.navigate('ResetWithOTP', { email });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Code'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default ForgotPassword;
