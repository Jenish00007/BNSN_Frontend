// useLogin.js
import { useState, useContext } from 'react'
import { Alert, Platform } from 'react-native'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import messaging from '@react-native-firebase/messaging'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import AuthContext from '../../context/Auth'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../../config/api'

export const useLogin = () => {
  const navigation = useNavigation()
  const [input, setInput] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [inputError, setInputError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [loading, setLoading] = useState(false)

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { setTokenAsync } = useContext(AuthContext)
  const { t } = useTranslation()

  const isEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const isPhoneNumber = (value) => {
    const phoneRegex = /^\d{10}$/
    return phoneRegex.test(value)
  }

  function validateCredentials() {
    let result = true
    setInputError(null)
    setPasswordError(null)

    if (!input) {
      setInputError('Please enter email or phone number')
      result = false
    } else if (!isEmail(input) && !isPhoneNumber(input)) {
      setInputError('Please enter a valid email or phone number')
      result = false
    }

    if (!password) {
      setPasswordError('Please enter password')
      result = false
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      result = false
    }

    return result
  }

  // Helper: Get FCM push token with enhanced error handling
  const getFCMPushToken = async () => {
    let token = null
    if (Device.isDevice) {
      try {
        // Request permission (iOS)
        const authStatus = await messaging().requestPermission()
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL

        if (enabled) {
          // Get FCM token
          token = await messaging().getToken()
          console.log('FCM push token obtained:', token)

          // Save token to AsyncStorage
          await AsyncStorage.setItem('fcmToken', token)
        } else {
          console.warn('Push notification permission not granted')
          return null
        }
      } catch (error) {
        console.error('Error getting FCM push token:', error)
        return null
      }
    } else {
      console.warn('Physical device required for push notifications')
    }

    return token
  }

  // Helper: Send push token to backend
  const sendPushTokenToBackend = async (fcmToken, accessToken) => {
    if (!fcmToken || !accessToken) {
      console.warn('Missing push token or access token')
      return
    }

    try {
      const response = await fetch(`${API_URL}/user/push-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ token: fcmToken })
      })

      console.log('Push token update response status:', response.status)

      if (!response.ok) {
        const text = await response.text()
        console.warn('Failed to update push token:', text)
      } else {
        console.log('Push token updated successfully on backend')
      }
    } catch (err) {
      console.error('Failed to send push token to backend:', err)
    }
  }

  async function loginAction() {
    if (!validateCredentials()) return

    setLoading(true)
    try {
      console.log('Starting login process with:', {
        input: input.toLowerCase().trim(),
        isEmail: isEmail(input),
        isPhoneNumber: isPhoneNumber(input)
      })

      // Get push notification token
      const fcmToken = await getFCMPushToken()

      const response = await fetch(`${API_URL}/user/login-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          isEmail(input)
            ? {
                email: input.toLowerCase().trim(),
                password,
                pushToken: fcmToken
              }
            : { phoneNumber: input, password, pushToken: fcmToken }
        )
      })

      console.log('Login response status:', response.status)
      const data = await response.json()
      console.log('Login response data:', data)

      if (response.ok) {
        // Store token and user data
        if (data.token) {
          console.log('Login successful, storing token')
          await setTokenAsync(data.token)

          // Store user data if available
          if (data.user) {
            await AsyncStorage.setItem('userData', JSON.stringify(data.user))
          }

          // Show success message
          FlashMessage({
            message: 'Login successful!',
            type: 'success'
          })

          // Navigate to main screen
          navigation.reset({
            index: 0,
            routes: [{ name: 'Menu' }]
          })
        } else {
          console.log('No token in response')
          throw new Error('Invalid response from server')
        }
      } else {
        console.log('Login failed:', data)
        let errorMessage = data.message || 'Login failed'

        // Provide more specific error messages
        if (response.status === 400) {
          if (
            data.message?.includes("doesn't exists") ||
            data.message?.includes('not found')
          ) {
            errorMessage =
              'No account found with this email/phone. Please check your credentials or register a new account.'
          } else if (
            data.message?.includes('correct information') ||
            data.message?.includes('invalid')
          ) {
            errorMessage =
              'Invalid email/phone or password. Please check your credentials.'
          }
        } else if (response.status === 401) {
          errorMessage =
            'Invalid credentials. Please check your email/phone and password.'
        } else if (response.status === 404) {
          errorMessage =
            'Account not found. Please check your email/phone or contact support.'
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        }

        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        stack: error.stack
      })

      FlashMessage({
        message: error.message || t('errorWhileLogging'),
        type: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('userData')
      setTokenAsync(null)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      })
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const clearErrors = () => {
    setInputError(null)
    setPasswordError(null)
  }

  return {
    input,
    setInput,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    inputError,
    passwordError,
    loading,
    loginAction,
    clearErrors,
    currentTheme,
    themeContext
  }
}
