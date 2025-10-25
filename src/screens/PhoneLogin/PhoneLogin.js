import React, { useState, useContext } from 'react';
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Image,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import { Ionicons } from '@expo/vector-icons';
import { scale } from '../../utils/scaling';
import Spinner from '../../components/Spinner/Spinner';
import styles from './styles';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage';
import { useTranslation } from 'react-i18next';
import AuthContext from '../../context/Auth';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import ConfigurationContext from '../../context/Configuration';
import { theme } from '../../utils/themeColors';
import { useAppBranding } from '../../utils/translationHelper';

const PhoneLogin = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const { t } = useTranslation();
  const { setTokenAsync } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  const config = useContext(ConfigurationContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const branding = useAppBranding();

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      FlashMessage({ message: 'Please enter a valid 10-digit phone number' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/user/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtpInput(true);
        FlashMessage({ message: 'OTP sent successfully!' });
      } else {
        FlashMessage({ message: data.message || 'Failed to send OTP' });
      }
    } catch (error) {
      FlashMessage({ message: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      FlashMessage({ message: 'Please enter a valid 6-digit OTP' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/user/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store token and user data
        await setTokenAsync(data.token);
        if (data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Navigate to main screen
        navigation.replace('Menu');
      } else {
        FlashMessage({ message: data.message || 'Invalid OTP' });
      }
    } catch (error) {
      FlashMessage({ message: 'Failed to verify OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles().container}>
      <StatusBar
        backgroundColor={branding.headerColor}
        barStyle="light-content"
        translucent={false}
        animated={true}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles().keyboardView}>
        <ScrollView
          contentContainerStyle={styles().scrollView}
          showsVerticalScrollIndicator={false}>
          <View style={styles().mainContainer}>
            <View style={styles().headerContainer}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles().logo}
              />
              <TextDefault style={[styles().title, { color: branding.textColor }]}>
                {showOtpInput ? 'Enter OTP' : 'Login with Phone'}
              </TextDefault>
              <TextDefault style={[styles().subtitle, { color: branding.textColor }]}>
                {showOtpInput 
                  ? 'Enter the 6-digit code sent to your phone'
                  : 'Enter your phone number to receive an OTP'}
              </TextDefault>
            </View>

            <View style={styles().formContainer}>
              {!showOtpInput ? (
                <>
                  <View style={styles().inputContainer}>
                    <View style={[styles().phoneInputWrapper, { borderColor: branding.borderColor }]}>
                      <TextDefault style={[styles().countryCode, { color: branding.textColor }]}>+91</TextDefault>
                      <TextInput
                        style={[styles().input, { color: branding.textColor }]}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                        maxLength={10}
                        placeholderTextColor={branding.textColor}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles().button,
                      !phoneNumber && styles().buttonDisabled,
                      { backgroundColor: branding.buttonColor }
                    ]}
                    onPress={handleSendOtp}
                    disabled={loading || !phoneNumber}>
                    {loading ? (
                      <Spinner size="small" />
                    ) : (
                      <TextDefault style={[styles().buttonText, { color: branding.textColor }]}>
                        Send OTP
                      </TextDefault>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles().inputContainer}>
                    <View style={[styles().otpInputWrapper, { borderColor: branding.borderColor }]}>
                      <TextInput
                        style={[styles().otpInput, { color: branding.textColor }]}
                        placeholder="Enter OTP"
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                        maxLength={6}
                        placeholderTextColor={branding.textColor}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles().button,
                      !otp && styles().buttonDisabled,
                      { backgroundColor: branding.buttonColor }
                    ]}
                    onPress={handleVerifyOtp}
                    disabled={loading || !otp}>
                    {loading ? (
                      <Spinner size="small" />
                    ) : (
                      <TextDefault style={[styles().buttonText, { color: branding.textColor }]}>
                        Verify OTP
                      </TextDefault>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles().resendButton}
                    onPress={handleSendOtp}
                    disabled={loading}>
                    <TextDefault style={[styles().resendText, { color: branding.buttonColor }]}>
                      Resend OTP
                    </TextDefault>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles().backButton}
                onPress={() => {
                  if (showOtpInput) {
                    setShowOtpInput(false);
                    setOtp('');
                  } else {
                    navigation.goBack();
                  }
                }}>
                <Ionicons name="arrow-back" size={24} color={branding.textColor} />
                <TextDefault style={[styles().backText, { color: branding.textColor }]}>
                  {showOtpInput ? 'Change Phone Number' : 'Back to Login'}
                </TextDefault>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PhoneLogin; 