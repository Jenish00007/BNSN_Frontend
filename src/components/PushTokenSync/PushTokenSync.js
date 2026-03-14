import React, { useEffect, useRef, useContext } from 'react'
import messaging from '@react-native-firebase/messaging'
import * as Device from 'expo-device'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AuthContext from '../../context/Auth'
import { API_URL } from '../../config/api'

/**
 * Syncs FCM push token to backend when user is logged in.
 * Runs on app launch and when token becomes available.
 * Ensures the receiver gets chat notifications via their FCM token.
 */
const PushTokenSync = () => {
  const { token } = useContext(AuthContext)
  const lastSyncedToken = useRef(null)

  useEffect(() => {
    if (!token || !Device.isDevice) return

    const syncPushToken = async () => {
      try {
        const authStatus = await messaging().requestPermission()
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL

        if (!enabled) return

        const fcmToken = await messaging().getToken()
        if (!fcmToken || fcmToken === lastSyncedToken.current) return

        const response = await fetch(`${API_URL}/user/push-token`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ token: fcmToken })
        })

        if (response.ok) {
          lastSyncedToken.current = fcmToken
          await AsyncStorage.setItem('fcmToken', fcmToken)
        }
      } catch (error) {
        console.warn('[PushTokenSync] Failed to sync token:', error?.message)
      }
    }

    syncPushToken()

    // Also listen for token refresh
    const unsubscribe = messaging().onTokenRefresh(syncPushToken)
    return () => unsubscribe()
  }, [token])

  return null
}

export default PushTokenSync
