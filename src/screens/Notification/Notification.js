import { FlatList, StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native'
import React, { useContext, useEffect, useCallback, useState } from 'react'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { LocationContext } from '../../context/Location'
import AuthContext from '../../context/Auth'
import { useNavigation } from '@react-navigation/native'
import UserContext from '../../context/User'
import { useAppBranding } from '../../utils/translationHelper'
import { API_URL } from '../../config/api'

function Notification() {
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { location } = useContext(LocationContext)
  const { token } = useContext(AuthContext)
  const { isLoggedIn } = useContext(UserContext)
  const branding = useAppBranding();
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Network-only fetch function
  const fetchNotification = useCallback(async () => {
    if (!isLoggedIn || !token) {
      setLoading(false)
      setNotifications([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/notification/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'moduleId': '1',
          'zoneId': '[1]',
          'latitude': location?.latitude?.toString() || '23.79354466376145',
          'longitude': location?.longitude?.toString() || '90.41166342794895',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Notification API Error:', errorText)
        throw new Error(`Failed to fetch notifications: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && Array.isArray(result.notifications)) {
        setNotifications(result.notifications)
        setError(null)
      } else {
        setNotifications([])
        setError(result.message || 'No notifications found')
      }
    } catch (err) {
      console.log('Fetch error:', err)
      setError(err.message || 'Failed to fetch notifications')
      setNotifications([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [location, isLoggedIn, token])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchNotification()
  }

  // Fetch data when component mounts or login state changes
  useEffect(() => {
    fetchNotification()
  }, [fetchNotification, isLoggedIn])

  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
        <Text style={[styles.message, { color: branding.textColor }]}>
          Please login to view notifications
        </Text>
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: branding.buttonColor }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
        <Text style={[styles.message, { color: branding.textColor }]}>Loading...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
        <Text style={[styles.message, { color: branding.textColor }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: branding.buttonColor }]}
          onPress={handleRefresh}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
      <StatusBar
        backgroundColor={branding.headerColor}
        barStyle="dark-content"
      />
      {notifications.length === 0 ? (
        <Text style={[styles.message, { color: branding.textColor }]}>
          No Notifications Yet
        </Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.notificationItem, { borderColor: branding.borderColor }]}>
              <Text style={[styles.title, { color: branding.textColor }]}>
                {item.data.title}
              </Text>
              <Text style={[styles.description, { color: branding.textColor }]}>
                {item.data.description}
              </Text>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  )
}

export default Notification

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  loginButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    marginHorizontal: 15,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
  }
})