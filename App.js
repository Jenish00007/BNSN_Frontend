import React, { useState, useEffect, useReducer, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppContainer from './src/routes'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import * as Font from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import {
  getCurrentLocation,
  requestLocationPermissionUntilGranted
} from './src/ui/hooks/useLocation'
import { LocationContext } from './src/context/Location'
import { SubscriptionProvider } from './src/context/Subscription'
import AnimatedSplash from './src/components/AnimatedSplash'
import TextDefault from './src/components/Text/TextDefault/TextDefault'

// Firebase messaging
import { initializeMessaging } from './src/utils/firebaseMessaging'

// Polyfill crypto.getRandomValues for UUID library compatibility
import 'react-native-get-random-values'
import 'expo-crypto'

// Geocoding service with retry logic and fallbacks
const geocodeLocation = async (latitude, longitude, retryCount = 0) => {
  const maxRetries = 3
  const baseDelay = 1000 // 1 second

  // Primary service: Nominatim (OpenStreetMap)
  const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`

  try {
    console.log(
      `App.js: Attempting geocoding (attempt ${retryCount + 1}/${maxRetries + 1})...`
    )

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'QuixoApp/1.0 (contact@quixo.com)',
        Accept: 'application/json',
        Referer: 'https://quixo.com'
      },
      timeout: 10000
    })

    if (response.status === 403) {
      console.warn('App.js: Nominatim returned 403 Forbidden - rate limited')
      throw new Error('Rate limited by Nominatim')
    }

    if (response.status === 429) {
      console.warn('App.js: Nominatim returned 429 Too Many Requests')
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount)
        console.log(`App.js: Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
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
    console.warn(
      `App.js: Geocoding attempt ${retryCount + 1} failed:`,
      error.message
    )

    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount)
      console.log(`App.js: Trying fallback service in ${delay}ms...`)

      await new Promise((resolve) => setTimeout(resolve, delay))

      try {
        const fallbackUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`

        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'QuixoApp/1.0 (contact@quixo.com)',
            Accept: 'application/json'
          },
          timeout: 8000
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          console.log('App.js: Fallback geocoding successful:', fallbackData)
          return fallbackData
        }
      } catch (fallbackError) {
        console.warn(
          'App.js: Fallback geocoding also failed:',
          fallbackError.message
        )
      }

      return geocodeLocation(latitude, longitude, retryCount + 1)
    }

    throw error
  }
}

import messaging from '@react-native-firebase/messaging'

async function getFCMToken() {
  try {
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (enabled) {
      const fcmToken = await messaging().getToken()
      console.log('FCM Token:', fcmToken)
      await AsyncStorage.setItem('fcmToken', fcmToken)
      return fcmToken
    } else {
      console.log('Notification permission denied')
      return null
    }
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
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
  AppState,
  Alert,
  Linking,
  TouchableOpacity
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
import PushTokenSync from './src/components/PushTokenSync/PushTokenSync'
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
])
LogBox.ignoreAllLogs()

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const notificationType = notification?.request?.content?.data?.type
    const shouldPlaySound = notificationType !== 'REVIEW_ORDER'
    return {
      shouldShowAlert: true,
      shouldPlaySound: shouldPlaySound,
      shouldSetBadge: true
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
  const [theme, themeSetter] = useReducer(
    ThemeReducer,
    systemTheme === 'dark' ? 'Dark' : 'Pink'
  )
  const [isUpdating, setIsUpdating] = useState(false)
  const [isInitializingLocation, setIsInitializingLocation] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [isWaitingForLocationPermission, setIsWaitingForLocationPermission] =
    useState(false)
  const [currentPermissionAttempt, setCurrentPermissionAttempt] = useState(0)
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false)
  const [
    locationPermissionDeniedPermanently,
    setLocationPermissionDeniedPermanently
  ] = useState(false)
  useWatchLocation()

  // ─── Helper: fetch coords + geocode and update location state ──────────────
  const initializeLocationFromCoords = async (coords) => {
    try {
      const data = await geocodeLocation(coords.latitude, coords.longitude)
      console.log('App.js: Geocoding successful:', data)

      let address = ''
      if (data.display_name) {
        address = data.display_name
      } else if (data.localityInfo && data.localityInfo.informative) {
        const locality = data.localityInfo.informative[0]
        address = `${locality.name}, ${locality.administrative[1].name}, ${locality.administrative[0].name}`
      } else {
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
      await AsyncStorage.setItem('location', JSON.stringify(currentLocation))
      return true
    } catch (geocodingError) {
      console.warn('App.js: Geocoding failed:', geocodingError.message)
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
      return true
    }
  }

  // ─── AppState listener: re-check permission when user returns from Settings ─
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextState) => {
        if (nextState === 'active') {
          const { status } = await Location.getForegroundPermissionsAsync()
          if (status === 'granted') {
            console.log(
              'App.js: Permission granted after returning from Settings — fetching location...'
            )
            setLocationPermissionDeniedPermanently(false)
            setLocationPermissionGranted(true)
            if (!location) {
              try {
                const { coords, error } = await getCurrentLocation()
                if (!error && coords) {
                  await initializeLocationFromCoords(coords)
                }
              } catch (e) {
                console.warn(
                  'App.js: Error re-fetching location after settings:',
                  e
                )
              }
            }
          }
        }
      }
    )
    return () => subscription.remove()
  }, [location])

  // ─── Custom wrapper for location permission ────────────────────────────────
  const requestLocationPermissionWithTracking = async () => {
    let attempts = 0
    const maxAttempts = 3
    const initialDelay = 1000
    const maxDelay = 5000

    while (attempts < maxAttempts) {
      attempts++
      setCurrentPermissionAttempt(attempts)
      console.log(
        `App.js: Requesting location permission (attempt ${attempts}/${maxAttempts})...`
      )

      const { status, canAskAgain } =
        await Location.getForegroundPermissionsAsync()

      if (status === 'granted') {
        console.log('App.js: Location permission granted successfully')
        return { granted: true, canAskAgain: true }
      }

      if (!canAskAgain) {
        console.log(
          'App.js: Cannot ask for location permission again — directing user to Settings'
        )
        // Permission permanently denied — force user to open Settings, no skip option
        Alert.alert(
          'Location Permission Required',
          'This app requires location access to work. Please enable location permission in your device settings to continue.',
          [
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings()
            }
          ],
          { cancelable: false } // Prevent dismissing by tapping outside
        )
        return { granted: false, canAskAgain: false }
      }

      try {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync()
        console.log(`App.js: Permission status after request: ${newStatus}`)

        if (newStatus === 'granted') {
          console.log('App.js: Location permission granted after request')
          return { granted: true, canAskAgain: true }
        }

        if (attempts < maxAttempts) {
          const delay = Math.min(
            initialDelay * Math.pow(2, attempts - 1),
            maxDelay
          )
          console.log(
            `App.js: Permission denied, trying again in ${delay / 1000} seconds...`
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
        } else {
          console.log(
            'App.js: Max attempts reached, returning permission denied...'
          )
          return { granted: false, canAskAgain: false }
        }
      } catch (error) {
        console.warn('App.js: Error requesting permission:', error.message)
        if (attempts < maxAttempts) {
          const delay = Math.min(
            initialDelay * Math.pow(2, attempts - 1),
            maxDelay
          )
          console.log(
            `App.js: Error occurred, retrying in ${delay / 1000} seconds...`
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
        } else {
          console.log(
            'App.js: Max attempts reached due to errors, returning permission denied...'
          )
          return { granted: false, canAskAgain: false }
        }
      }
    }

    console.log('App.js: Unexpected end of permission request loop')
    return { granted: false, canAskAgain: false }
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

        let locationInitialized = false
        let permissionAttempts = 0
        const maxPermissionAttempts = 3

        while (
          !locationInitialized &&
          permissionAttempts < maxPermissionAttempts
        ) {
          permissionAttempts++
          try {
            console.log('App.js: Starting location permission request...')
            setIsWaitingForLocationPermission(true)
            setLocationPermissionGranted(false)

            let permissionResult = null
            try {
              permissionResult = await requestLocationPermissionWithTracking()
            } catch (permissionError) {
              console.error(
                'App.js: Error during permission request:',
                permissionError.message
              )
              console.log(
                'App.js: Permission request failed, breaking loop to prevent crash...'
              )
              setIsWaitingForLocationPermission(false)
              setLocationPermissionGranted(false)
              break
            }

            console.log('App.js: Permission request result:', permissionResult)

            if (permissionResult.granted) {
              console.log(
                'App.js: Location permission granted, getting current location...'
              )
              setIsWaitingForLocationPermission(false)
              setCurrentPermissionAttempt(0)
              setLocationPermissionGranted(true)

              try {
                const { coords, error } = await getCurrentLocation()

                if (!error && coords) {
                  console.log(
                    'App.js: Got current location:',
                    coords.latitude,
                    coords.longitude
                  )
                  const success = await initializeLocationFromCoords(coords)
                  if (success) {
                    locationInitialized = true
                    setLocationPermissionGranted(true)
                  }
                } else {
                  console.warn(
                    'App.js: Location error after permission granted:',
                    error?.message
                  )
                  console.log(
                    'App.js: Location retrieval failed, breaking loop to prevent crash...'
                  )
                  setIsWaitingForLocationPermission(false)
                  setLocationPermissionGranted(false)
                  break
                }
              } catch (locationError) {
                console.warn(
                  'App.js: Error getting current location:',
                  locationError.message
                )
                console.log(
                  'App.js: Location retrieval error, breaking loop to prevent crash...'
                )
                setIsWaitingForLocationPermission(false)
                setLocationPermissionGranted(false)
                break
              }
            } else if (!permissionResult.canAskAgain) {
              // Permanently denied — Alert already shown, block app until user enables from Settings
              console.log(
                'App.js: Permission permanently denied, blocking app until user enables from Settings...'
              )
              setIsWaitingForLocationPermission(false)
              setLocationPermissionGranted(false)
              setLocationPermissionDeniedPermanently(true)
              break
            } else {
              console.warn('App.js: Location permission denied after request')
              console.log(
                'App.js: Location permission denied, breaking loop to continue app...'
              )
              setIsWaitingForLocationPermission(false)
              setLocationPermissionGranted(false)
              break
            }
          } catch (locationError) {
            console.warn(
              'App.js: Location initialization failed:',
              locationError.message
            )
            console.log(
              'App.js: Location initialization error, breaking loop to prevent crash...'
            )
            setIsWaitingForLocationPermission(false)
            setLocationPermissionGranted(false)
            break
          }
        }

        if (
          permissionAttempts >= maxPermissionAttempts &&
          !locationInitialized
        ) {
          console.warn(
            'App.js: Maximum permission attempts reached, continuing without location'
          )
          setIsWaitingForLocationPermission(false)
          setLocationPermissionGranted(false)
        }

        // Final verification
        const { status: finalStatus } =
          await Location.getForegroundPermissionsAsync()
        if (finalStatus !== 'granted') {
          console.warn(
            'App.js: Final verification - location permission not granted, app will continue without location features'
          )
          setLocationPermissionGranted(false)
        } else {
          console.log(
            'App.js: Final verification - location permission confirmed'
          )
          setLocationPermissionGranted(true)
        }
        setIsWaitingForLocationPermission(false)
        setCurrentPermissionAttempt(0)

        BackHandler.addEventListener('hardwareBackPress', exitAlert)
        setAppIsReady(true)
      } catch (e) {
        console.warn('App initialization error:', e)
        console.log(
          'App.js: Initialization error occurred, continuing app to prevent crash...'
        )
        setIsWaitingForLocationPermission(false)
        setLocationPermissionGranted(false)
        setCurrentPermissionAttempt(0)
        setAppIsReady(true)
        return
      } finally {
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
    getFCMToken()

    try {
      initializeMessaging()
      console.log('🔔 [APP] Firebase messaging initialized')
    } catch (error) {
      console.error('🔔 [APP] Error initializing Firebase messaging:', error)
    }
  }, [])

  const client = setupApolloClient()
  const shouldBeRTL = false
  if (shouldBeRTL !== I18nManager.isRTL && Platform.OS !== 'web') {
    I18nManager.allowRTL(shouldBeRTL)
    I18nManager.forceRTL(shouldBeRTL)
    Updates.reloadAsync()
  }

  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (__DEV__) return
    ;(async () => {
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

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const notificationType = notification?.request?.content?.data?.type
        const notificationData = notification?.request?.content?.data

        if (notificationType === 'chat') {
          console.log('Chat notification received:', notificationData)
          if (notificationData?.conversationId) {
            const { navigationRef } = require('./src/routes/navigationService')
            if (navigationRef.isReady()) {
              navigationRef.navigate('Chat', {
                conversationId: notificationData.conversationId,
                groupTitle: notificationData.senderName
                  ? `Chat with ${notificationData.senderName}`
                  : 'New Message',
                forceNavigate: true
              })
            }
          }
        }

        if (notificationType === NOTIFICATION_TYPES.REVIEW_ORDER) {
          const id = notificationData?._id
          if (id) {
            setOrderId(id)
            reviewModalRef?.current?.open()
          }
        }
      })

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notificationType =
          response?.notification?.request?.content?.data?.type
        const notificationData = response?.notification?.request?.content?.data

        if (notificationType === 'chat') {
          console.log('Chat notification response received:', notificationData)
          if (notificationData?.conversationId) {
            const { navigationRef } = require('./src/routes/navigationService')
            if (navigationRef.isReady()) {
              navigationRef.navigate('Chat', {
                conversationId: notificationData.conversationId,
                groupTitle: notificationData.senderName
                  ? `Chat with ${notificationData.senderName}`
                  : 'New Message',
                forceNavigate: true
              })
            }
          }
        }

        if (notificationType === NOTIFICATION_TYPES.REVIEW_ORDER) {
          const id = notificationData?._id
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

  if (
    !appIsReady ||
    showSplash ||
    (isWaitingForLocationPermission &&
      currentPermissionAttempt > 0 &&
      currentPermissionAttempt <= 3)
  ) {
    return (
      <View style={{ flex: 1 }}>
        <AnimatedSplash onAnimationComplete={handleSplashComplete} />
        {isWaitingForLocationPermission && (
          <View
            style={[
              styles.waitingOverlay,
              { backgroundColor: Theme[theme].startColor }
            ]}
          >
            <TextDefault
              textColor={Theme[theme].white}
              bold
              style={styles.waitingText}
            >
              {currentPermissionAttempt === 0
                ? 'Location permission required'
                : `Location permission required (attempt ${currentPermissionAttempt})`}
            </TextDefault>
            <ActivityIndicator
              size='large'
              color={Theme[theme].white}
              style={styles.waitingSpinner}
            />
            <TextDefault
              textColor={Theme[theme].white}
              style={styles.waitingSubText}
            >
              This app requires location permission to function properly.
            </TextDefault>
            <TextDefault
              textColor={Theme[theme].white}
              style={styles.waitingSubText}
            >
              Please grant permission to continue using the app.
            </TextDefault>
          </View>
        )}
      </View>
    )
  }

  // ─── Blocking screen: location permission permanently denied ─────────────
  if (locationPermissionDeniedPermanently) {
    return (
      <View
        style={[
          styles.flex,
          styles.mainContainer,
          { backgroundColor: Theme[theme].lightBlue, padding: 30 }
        ]}
      >
        <TextDefault
          textColor={Theme[theme].white}
          bold
          style={{ fontSize: 20, marginBottom: 16, textAlign: 'center' }}
        >
          Location Permission Required
        </TextDefault>
        <TextDefault
          textColor={Theme[theme].white}
          style={{
            fontSize: 15,
            marginBottom: 12,
            textAlign: 'center',
            opacity: 0.9
          }}
        >
          This app requires location access to work. Please enable location
          permission in your device settings.
        </TextDefault>
        <TextDefault
          textColor={Theme[theme].white}
          style={{
            fontSize: 13,
            marginBottom: 30,
            textAlign: 'center',
            opacity: 0.7
          }}
        >
          Settings {'>'} Apps {'>'} This App {'>'} Permissions {'>'} Location
        </TextDefault>
        <TouchableOpacity
          onPress={() => Linking.openSettings()}
          style={{
            backgroundColor: Theme[theme].white,
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: 10
          }}
        >
          <TextDefault
            textColor={Theme[theme].startColor}
            bold
            style={{ fontSize: 16, textAlign: 'center' }}
          >
            Open Settings
          </TextDefault>
        </TouchableOpacity>
        <TextDefault
          textColor={Theme[theme].white}
          style={{
            fontSize: 12,
            marginTop: 20,
            textAlign: 'center',
            opacity: 0.6
          }}
        >
          After enabling, return to the app to continue.
        </TextDefault>
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ApolloProvider client={client}>
        <ThemeContext.Provider
          value={{ ThemeValue: theme, dispatch: themeSetter }}
        >
          <StatusBar
            backgroundColor={Theme[theme].primaryColor}
            barStyle={theme === 'Dark' ? 'light-content' : 'dark-content'}
          />
          <LocationContext.Provider value={{ location, setLocation }}>
            <ConfigurationProvider>
              <AuthProvider>
                <PushTokenSync />
                <UserProvider>
                  <SubscriptionProvider>
                    <OrdersProvider>
                      <AppContainer />
                      <ReviewModal
                        ref={reviewModalRef}
                        onOverlayPress={onOverlayPress}
                        theme={Theme[theme]}
                        orderId={orderId}
                      />
                    </OrdersProvider>
                  </SubscriptionProvider>
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
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
      playSound: true
    })

    await Notifications.setNotificationChannelAsync('chat_messages', {
      name: 'Chat Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 500, 250],
      lightColor: '#007AFF',
      sound: 'message_sound',
      enableVibrate: true,
      playSound: true
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
