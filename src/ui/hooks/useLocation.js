import * as Location from 'expo-location'
import { getLocationFromStorage } from './useWatchLocation'

export const getCurrentLocation = async () => {
  const { status, canAskAgain } = await Location.getForegroundPermissionsAsync()

  if (status === 'granted') {
    try {
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          enableHighAccuracy: true,
          timeout: 15000 // 15 second timeout
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Location timeout')), 15000)
        )
      ])
      return { ...location, error: false }
    } catch (e) {
      console.log('useLocation: Location error:', e.message)
      return { error: true, message: e.message }
    }
  } else if (canAskAgain) {
    console.log('useLocation: Requesting location permissions...')
    const { status: newStatus } = await Location.requestForegroundPermissionsAsync()
    console.log('useLocation: Permission status after request:', newStatus)
    if (newStatus === 'granted') {
      try {
        const location = await Promise.race([
          Location.getCurrentPositionAsync({
            enableHighAccuracy: true,
            timeout: 15000 // 15 second timeout
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Location timeout')), 15000)
          )
        ])
        return { ...location, error: false }
      } catch (e) {
        return { error: true, message: e.message }
      }
    }
  }
  console.log('useLocation: Location permission denied or cannot ask again')
  return { error: true, message: 'Location permission is required to use this app' }
}

// New function that keeps requesting permission until granted
export const requestLocationPermissionUntilGranted = async () => {
  let attempts = 0
  const maxAttempts = 10 // Prevent infinite loop
  const initialDelay = 1000 // Start with 1 second delay
  const maxDelay = 8000 // Maximum delay between attempts (8 seconds)

  while (attempts < maxAttempts) {
    attempts++
    console.log(`useLocation: Requesting location permission (attempt ${attempts}/${maxAttempts})...`)

    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync()

    if (status === 'granted') {
      console.log('useLocation: Location permission granted successfully')
      return { granted: true, canAskAgain: true }
    }

    if (!canAskAgain) {
      console.log('useLocation: Cannot ask for location permission again')
      return { granted: false, canAskAgain: false }
    }

    // Request permission with proper error handling
    try {
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync()
      console.log(`useLocation: Permission status after request: ${newStatus}`)

      if (newStatus === 'granted') {
        console.log('useLocation: Location permission granted after request')
        return { granted: true, canAskAgain: true }
      }

      // If permission was denied, calculate delay for next attempt
      // Use exponential backoff: 1s, 2s, 4s, 8s, etc.
      if (attempts < maxAttempts) {
        const delay = Math.min(initialDelay * Math.pow(2, attempts - 1), maxDelay)
        console.log(`useLocation: Permission denied, trying again in ${delay/1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    } catch (error) {
      console.warn('useLocation: Error requesting permission:', error.message)
      // If there's an error requesting permission, wait before trying again
      if (attempts < maxAttempts) {
        const delay = Math.min(initialDelay * Math.pow(2, attempts - 1), maxDelay)
        console.log(`useLocation: Error occurred, retrying in ${delay/1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  console.log('useLocation: Max attempts reached, permission not granted')
  return { granted: false, canAskAgain: false }
}

export default function useLocation() {
  const getLocationPermission = async () => {
    const {
      status,
      canAskAgain
    } = await Location.getForegroundPermissionsAsync()
    return { status, canAskAgain }
  }

  const askLocationPermission = async () => {
    let finalStatus = null
    let finalCanAskAgain = null
    const {
      status: currentStatus,
      canAskAgain: currentCanAskAgain
    } = await Location.getForegroundPermissionsAsync()
    finalStatus = currentStatus === 'granted' ? 'granted' : 'denied'
    finalCanAskAgain = currentCanAskAgain
    if (currentStatus === 'granted') {
      return { status: finalStatus, canAskAgain: finalCanAskAgain }
    }
    if (currentCanAskAgain) {
      const {
        status,
        canAskAgain
      } = await Location.requestForegroundPermissionsAsync()
      finalStatus = status === 'granted' ? 'granted' : 'denied'
      finalCanAskAgain = canAskAgain
      if (status === 'granted') {
        return { status: finalStatus, canAskAgain: finalCanAskAgain }
      }
    }
    return { status: finalStatus, canAskAgain: finalCanAskAgain }
  }

  return { getCurrentLocation, getLocationPermission }
}
