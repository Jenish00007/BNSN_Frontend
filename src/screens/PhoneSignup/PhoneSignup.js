import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import { Ionicons } from '@expo/vector-icons';
import { scale } from '../../utils/scaling';
import Spinner from '../../components/Spinner/Spinner';
import styles from './styles';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PhoneSignup = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requestId, setRequestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phoneNumber,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRequestId(data.requestId);
        setShowOtpInput(true);
        Alert.alert('Success', 'OTP sent successfully!');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/verify-signup-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          code: otp,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in secure storage
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        
        // Navigate to home screen
        navigation.replace('Main');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          <View style={styles.mainContainer}>
            <View style={styles.headerContainer}>
              <Ionicons
                name="person-add-outline"
                size={30}
                color="#000"
              />
              <TextDefault style={styles.title}>
                Create Account
              </TextDefault>
              <TextDefault style={styles.subtitle}>
                Sign up with your phone number
              </TextDefault>
            </View>

            <View style={styles.formContainer}>
              {!showOtpInput ? (
                <>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number"
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      maxLength={10}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSignup}
                    disabled={loading || !name || !email || !phoneNumber || !password}>
                    {loading ? (
                      <Spinner size="small" />
                    ) : (
                      <TextDefault style={styles.buttonText}>
                        Sign Up
                      </TextDefault>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter OTP"
                      keyboardType="number-pad"
                      value={otp}
                      onChangeText={setOtp}
                      maxLength={6}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleVerifyOtp}
                    disabled={loading || !otp}>
                    {loading ? (
                      <Spinner size="small" />
                    ) : (
                      <TextDefault style={styles.buttonText}>
                        Verify OTP
                      </TextDefault>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PhoneSignup; 