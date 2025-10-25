import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../config/api';

const ResetWithOTP = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp) return Alert.alert('Error', 'Please enter OTP');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/user/verify-otp`, { email, otp });
      setOtpVerified(true);
      Alert.alert('Success', 'OTP verified successfully');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to verify OTP');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) return Alert.alert('Error', 'Please fill all fields');
    if (newPassword !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');
    
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/user/reset-password`, {
        email,
        otp,
        password: newPassword,
        confirmPassword
      });
      
      // Store the token if needed
      if (response.data.token) {
        // You might want to store this token in AsyncStorage or your auth context
        // await AsyncStorage.setItem('token', response.data.token);
      }
      
      Alert.alert('Success', 'Password reset successful');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOTP}
        keyboardType="numeric"
        editable={!otpVerified}
      />
      {!otpVerified ? (
        <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
          </TouchableOpacity>
        </>
      )}
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

export default ResetWithOTP;
