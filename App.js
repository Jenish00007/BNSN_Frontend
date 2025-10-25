import React, { useState, useEffect, useReducer, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppContainer from './src/routes'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import * as Font from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { getCurrentLocation, requestLocationPermissionUntilGranted } from './src/ui/hooks/useLocation'
import { LocationContext } from './src/context/Location'
import AnimatedSplash from './src/components/AnimatedSplash'
import TextDefault from './src/components/Text/TextDefault/TextDefault'


// Geocoding service with retry logic and fallbacks
const geocodeLocation = async (latitude, longitude, retryCount = 0) => {
  const maxRetries = 3
  const baseDelay = 1000 // 1 second

  // Primary service: Nominatim (OpenStreetMap)
  const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`

  try {
    console.log(`App.js: Attempting geocoding (attempt ${retryCount + 1}/${maxRetries + 1})...`)

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'QuixoApp/1.0 (contact@quixo.com)',
        'Accept': 'application/json',
        'Referer': 'https://quixo.com'
      },
      timeout: 10000 // 10 second timeout
    })

    if (response.status === 403) {
      console.warn('App.js: Nominatim returned 403 Forbidden - rate limited')
      throw new Error('Rate limited by Nominatim')
    }

    if (response.status === 429) {
      console.warn('App.js: Nominatim returned 429 Too Many Requests')
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount) // Exponential backoff
        console.log(`App.js: Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return geocodeLocation(latitude, longitude, retryCount + 1)
      }
      throw new Error('Rate limited by Nominatim after retries')
    }

    if (response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        if (!data.error) {
          return data
        }
      }
    }

    throw new Error(`App.js: Geocoding failed with status: ${response.status}`)

  } catch (error) {
    console.warn(`App.js: Geocoding attempt ${retryCount + 1} failed:`, error.message)

    // Try fallback service if primary fails and we haven't exhausted retries
    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount)
      console.log(`App.js: Trying fallback service in ${delay}ms...`)

      await new Promise(resolve => setTimeout(resolve, delay))

      try {
        // Fallback: Use a different geocoding service
        const fallbackUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`

        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'QuixoApp/1.0 (contact@quixo.com)',
            'Accept': 'application/json'
          },
          timeout: 8000 // 8 second timeout
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          console.log('App.js: Fallback geocoding successful:', fallbackData)
          return fallbackData
        }
      } catch (fallbackError) {
        console.warn('App.js: Fallback geocoding also failed:', fallbackError.message)
      }

      // Try again with primary service
      return geocodeLocation(latitude, longitude, retryCount + 1)
    }

    throw error
  }
}

import {
  BackHandler,
  Platform,
  StatusBar,
  LogBox,
  StyleSheet,
  ActivityIndicator,
  I18nManager,
  View,
  Text,
  AppState
} from 'react-native'
import * as Location from 'expo-location'
import { ApolloProvider } from '@apollo/client'
import { exitAlert } from './src/utils/androidBackButton'
import FlashMessage from 'react-native-flash-message'
import setupApolloClient from './src/apollo/index'
import ThemeReducer from './src/ui/ThemeReducer/ThemeReducer'
import ThemeContext from './src/ui/ThemeContext/ThemeContext'
import { ConfigurationProvider } from './src/context/Configuration'
import { UserProvider } from './src/context/User'
import { AuthProvider } from './src/context/Auth'
import { theme as Theme } from './src/utils/themeColors'
import 'expo-dev-client'
import useEnvVars, { isProduction } from './environment'
import { requestTrackingPermissions } from './src/utils/useAppTrackingTrasparency'
import { OrdersProvider } from './src/context/Orders'
import { MessageComponent } from './src/components/FlashMessage/MessageComponent'
import * as Updates from 'expo-updates'
import ReviewModal from './src/components/Review'
import { NOTIFICATION_TYPES } from './src/utils/enums'
import { useColorScheme } from 'react-native'
import useWatchLocation from './src/ui/hooks/useWatchLocation'
import { cleanupAllAnimations } from './src/utils/animationUtils'

LogBox.ignoreLogs([
  'Warning: ...',
  'Sentry Logger ',
  'Constants.deviceYearClass'
]) // Ignore log notification by message
LogBox.ignoreAllLogs() // Ignore all log notifications


Notifications.setNotificationHandler({
  handleNotification: async notification => {
    return {
      shouldShowAlert: notification?.request?.content?.data?.type !== NOTIFICATION_TYPES.REVIEW_ORDER,
      shouldPlaySound: false,
      shouldSetBadge: false
    }
  }
})

export default function App() {
  const reviewModalRef = useRef()
  const [appIsReady, setAppIsReady] = useState(false)
  const [location, setLocation] = useState(null)
  const notificationListener = useRef()
  const responseListener = useRef()
  const [orderId, setOrderId] = useState()
  const systemTheme = useColorScheme()
  const [theme, themeSetter] = useReducer(ThemeReducer, systemTheme === 'dark' ? 'Dark' : 'Pink')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isInitializingLocation, setIsInitializingLocation] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [isWaitingForLocationPermission, setIsWaitingForLocationPermission] = useState(false)
  const [currentPermissionAttempt, setCurrentPermissionAttempt] = useState(0)
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false)
  useWatchLocation()

  // Custom wrapper for location permission with tracking
  const requestLocationPermissionWithTracking = async () => {
    let attempts = 0
    const maxAttempts = 20 // Increased attempts to be more persistent
    const initialDelay = 1000 // Start with 1 second delay
    const maxDelay = 8000 // Maximum delay between attempts (8 seconds)

    while (attempts < maxAttempts) {
      attempts++
      setCurrentPermissionAttempt(attempts)
      console.log(`App.js: Requesting location permission (attempt ${attempts}/${maxAttempts})...`)

      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync()

      if (status === 'granted') {
        console.log('App.js: Location permission granted successfully')
        return { granted: true, canAskAgain: true }
      }

      if (!canAskAgain) {
        console.log('App.js: Cannot ask for location permission again')
        // Instead of returning, throw an error to restart the process
        throw new Error('Cannot ask for location permission again')
      }

      // Request permission with proper error handling
      try {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync()
        console.log(`App.js: Permission status after request: ${newStatus}`)

        if (newStatus === 'granted') {
          console.log('App.js: Location permission granted after request')
          return { granted: true, canAskAgain: true }
        }

        // If permission was denied, calculate delay for next attempt
        // Use exponential backoff: 1s, 2s, 4s, 8s, etc.
        if (attempts < maxAttempts) {
          const delay = Math.min(initialDelay * Math.pow(2, attempts - 1), maxDelay)
          console.log(`App.js: Permission denied, trying again in ${delay/1000} seconds...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        } else {
          // Max attempts reached, throw error to restart process
          console.log('App.js: Max attempts reached, restarting permission request...')
          throw new Error('Max attempts reached, restarting permission request')
        }
      } catch (error) {
        console.warn('App.js: Error requesting permission:', error.message)
        // If there's an error requesting permission, wait before trying again
        if (attempts < maxAttempts) {
          const delay = Math.min(initialDelay * Math.pow(2, attempts - 1), maxDelay)
          console.log(`App.js: Error occurred, retrying in ${delay/1000} seconds...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        } else {
          // Max attempts reached, throw error to restart process
          console.log('App.js: Max attempts reached due to errors, restarting...')
          throw new Error('Max attempts reached due to errors, restarting permission request')
        }
      }
    }

    // This should never be reached, but just in case
    console.log('App.js: Unexpected end of permission request loop')
    throw new Error('Unexpected end of permission request loop')
  }
  useEffect(() => {
    const loadAppData = async () => {
      try {
        await SplashScreen.preventAutoHideAsync()
        await Font.loadAsync({
          MuseoSans300: require('./src/assets/font/MuseoSans/MuseoSans300.ttf'),
          MuseoSans500: require('./src/assets/font/MuseoSans/MuseoSans500.ttf'),
          MuseoSans700: require('./src/assets/font/MuseoSans/MuseoSans700.ttf')
        })

        // Initialize location with mandatory permission request
        let locationInitialized = false

        while (!locationInitialized) {
          try {
            console.log('App.js: Starting location permission request...')
            setIsWaitingForLocationPermission(true)
            setLocationPermissionGranted(false) // Reset for this iteration

            let permissionResult = null
            try {
              // Custom wrapper to track attempts
              permissionResult = await requestLocationPermissionWithTracking()
            } catch (permissionError) {
              console.error('App.js: Error during permission request:', permissionError.message)
              // Error occurred, restart the process
              console.log('App.js: Restarting location permission request due to error...')
              setIsWaitingForLocationPermission(false)
              setLocationPermissionGranted(false)
              continue // Restart the loop
            }

            console.log('App.js: Permission request result:', permissionResult)

            if (permissionResult.granted) {
              console.log('App.js: Location permission granted, getting current location...')
              setIsWaitingForLocationPermission(false)
              setCurrentPermissionAttempt(0)
              setLocationPermissionGranted(true)

              try {
                const { coords, error } = await getCurrentLocation()

                if (!error && coords) {
                  console.log('App.js: Got current location:', coords.latitude, coords.longitude)

                  try {
                    const data = await geocodeLocation(coords.latitude, coords.longitude)
                    console.log('App.js: Geocoding successful:', data)

                    let address = ''
                    if (data.display_name) {
                      // Nominatim response
                      address = data.display_name
                    } else if (data.localityInfo && data.localityInfo.informative) {
                      // BigDataCloud response
                      const locality = data.localityInfo.informative[0]
                      address = `${locality.name}, ${locality.administrative[1].name}, ${locality.administrative[0].name}`
                    } else {
                      // Fallback to coordinates
                      address = `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`
                    }

                    if (address.length > 21) {
                      address = address.substring(0, 21) + '...'
                    }

                    const currentLocation = {
                      label: 'currentLocation',
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                      deliveryAddress: address,
                      timestamp: Date.now()
                    }
                    console.log('App.js: Setting current location:', currentLocation)
                    setLocation(currentLocation)
                    // Store in AsyncStorage for persistence
                    await AsyncStorage.setItem('location', JSON.stringify(currentLocation))

                    locationInitialized = true // Successfully initialized, exit loop
                    setLocationPermissionGranted(true) // Mark permission as granted
                  } catch (geocodingError) {
                    console.warn('App.js: Geocoding failed:', geocodingError.message)
                    // Use coordinates as fallback address
                    const fallbackAddress = `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`
                    const currentLocation = {
                      label: 'currentLocation',
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                      deliveryAddress: fallbackAddress,
                      timestamp: Date.now()
                    }
                    setLocation(currentLocation)
                    await AsyncStorage.setItem('location', JSON.stringify(currentLocation))

                    locationInitialized = true // Successfully initialized, exit loop
                    setLocationPermissionGranted(true) // Mark permission as granted
                  }
                } else {
                  console.warn('App.js: Location error after permission granted:', error?.message)
                  // Error getting location, restart the process
                  console.log('App.js: Restarting location permission request due to location error...')
                  setIsWaitingForLocationPermission(false)
                  setLocationPermissionGranted(false)
                  continue // Restart the loop
                }
              } catch (locationError) {
                console.warn('App.js: Error getting current location:', locationError.message)
                // Error getting location, restart the process
                console.log('App.js: Restarting location permission request due to location error...')
                setIsWaitingForLocationPermission(false)
                setLocationPermissionGranted(false)
                continue // Restart the loop
              }
            } else {
              console.warn('App.js: Location permission denied after persistent requests')
              // User denied permission - restart the permission request process
              console.log('App.js: Restarting location permission request...')
              // Clean up states and restart the loop
              setIsWaitingForLocationPermission(false)
              setLocationPermissionGranted(false)
              continue // Restart the loop
            }
          } catch (locationError) {
            console.warn('App.js: Location initialization failed:', locationError.message)
            // Error occurred - restart the permission request process
            console.log('App.js: Restarting location permission request due to error...')
            setIsWaitingForLocationPermission(false)
            setLocationPermissionGranted(false)
            continue // Restart the loop
          }
        }

        // Final verification: Check if location permission is actually granted
        const { status: finalStatus } = await Location.getForegroundPermissionsAsync()
        if (finalStatus !== 'granted') {
          console.warn('App.js: Final verification failed - permission not granted')
          throw new Error('Location permission not granted after initialization')
        }

        // Mark location permission as handled (whether granted or not)
        setLocationPermissionGranted(true)
        setIsWaitingForLocationPermission(false)
        setCurrentPermissionAttempt(0)

        BackHandler.addEventListener('hardwareBackPress', exitAlert)
        setAppIsReady(true)
      } catch (e) {
        console.warn('App initialization error:', e)
        // If there's an initialization error, restart the entire process
        // This ensures the app doesn't proceed without proper location setup
        console.log('App.js: Restarting app initialization due to error...')
        // Don't set app as ready, the useEffect will run again
        return
      } finally {
        // Always clean up the permission states
        setLocationPermissionGranted(true)
        setIsWaitingForLocationPermission(false)
        setCurrentPermissionAttempt(0)
      }
    }

    loadAppData()

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', exitAlert)
    }
  }, [])

  useEffect(() => {
    try {
      themeSetter({ type: systemTheme === 'dark' ? 'Dark' : 'Pink' })
    } catch (error) {
      // Error retrieving data
      console.log('Theme Error : ', error.message)
    }
  }, [systemTheme])

  useEffect(() => {
    if (!appIsReady) return

    const hideSplashScreen = async () => {
      await SplashScreen.hideAsync()
    }

    hideSplashScreen()
  }, [appIsReady])

  useEffect(() => {
    if (!location) return

    const saveLocation = async () => {
      await AsyncStorage.setItem('location', JSON.stringify(location))
    }

    saveLocation()
  }, [location])

  useEffect(() => {
    requestTrackingPermissions()
  }, [])


  const client = setupApolloClient()
  const shouldBeRTL = false;
  if (shouldBeRTL !== I18nManager.isRTL && Platform.OS !== 'web') {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    Updates.reloadAsync();
  }
 
  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (__DEV__) return
      ; (async () => {
        const { isAvailable } = await Updates.checkForUpdateAsync()
        if (isAvailable) {
          try {
            setIsUpdating(true)
            const { isNew } = await Updates.fetchUpdateAsync()
            if (isNew) {
              await Updates.reloadAsync()
            }
          } catch (error) {
            console.log('error while updating app', JSON.stringify(error))
          } finally {
            setIsUpdating(false)
          }
        }
      })()
  }, [])

  if (isUpdating) {
    return (
      <View
        style={[
          styles.flex,
          styles.mainContainer,
          { backgroundColor: Theme[theme].startColor }
        ]}
      >
        <TextDefault textColor={Theme[theme].white} bold>
          Please wait while app is updating
        </TextDefault>
        <ActivityIndicator size='large' color={Theme[theme].white} />
      </View>
    )
  }

  useEffect(() => {
    registerForPushNotificationsAsync()

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      if (notification?.request?.content?.data?.type === NOTIFICATION_TYPES.REVIEW_ORDER) {
        const id = notification?.request?.content?.data?._id
        if (id) {
          setOrderId(id)
          reviewModalRef?.current?.open()
        }
      }
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      if (response?.notification?.request?.content?.data?.type === NOTIFICATION_TYPES.REVIEW_ORDER) {
        const id = response?.notification?.request?.content?.data?._id
        if (id) {
          setOrderId(id)
          reviewModalRef?.current?.open()
        }
      }
    })
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current)
      Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  const onOverlayPress = () => {
    reviewModalRef?.current?.close()
  }

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  if (!appIsReady || showSplash || (isWaitingForLocationPermission && currentPermissionAttempt > 0)) {
    return (
      <View style={{ flex: 1 }}>
        <AnimatedSplash onAnimationComplete={handleSplashComplete} />
        {isWaitingForLocationPermission && (
          <View style={[styles.waitingOverlay, { backgroundColor: Theme[theme].startColor }]}>
            <TextDefault textColor={Theme[theme].white} bold style={styles.waitingText}>
              {currentPermissionAttempt === 0
                ? 'Location permission required'
                : `Location permission required (attempt ${currentPermissionAttempt})`
              }
            </TextDefault>
            <ActivityIndicator size='large' color={Theme[theme].white} style={styles.waitingSpinner} />
            <TextDefault textColor={Theme[theme].white} style={styles.waitingSubText}>
              This app requires location permission to function
            </TextDefault>
            <TextDefault textColor={Theme[theme].white} style={styles.waitingSubText}>
              Please grant permission to continue using the app
            </TextDefault>
            <TextDefault textColor={Theme[theme].white} style={styles.waitingSubText}>
              {currentPermissionAttempt > 10 ? 'Please check your device settings if permission dialog doesn\'t appear' : ''}
            </TextDefault>
          </View>
        )}
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ApolloProvider client={client}>
        <ThemeContext.Provider
          value={{ ThemeValue: theme, dispatch: themeSetter }}>
          <StatusBar
            backgroundColor={Theme[theme].primaryColor}
            barStyle={theme === 'Dark' ? 'light-content' : 'dark-content'}
          />
          <LocationContext.Provider value={{ location, setLocation }}>
            <ConfigurationProvider>
              <AuthProvider>
                <UserProvider>
                  <OrdersProvider>
                    <AppContainer />
                    <ReviewModal ref={reviewModalRef} onOverlayPress={onOverlayPress} theme={Theme[theme]} orderId={orderId} />
                  </OrdersProvider>
                </UserProvider>
              </AuthProvider>
            </ConfigurationProvider>
          </LocationContext.Provider>
          <FlashMessage MessageComponent={MessageComponent} />
        </ThemeContext.Provider>
      </ApolloProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  waitingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  waitingText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center'
  },
  waitingSpinner: {
    marginTop: 10
  },
  waitingSubText: {
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.8
  }
})
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!')
    }
  } else {
    alert('Must use physical device for Push Notifications')
  }
}