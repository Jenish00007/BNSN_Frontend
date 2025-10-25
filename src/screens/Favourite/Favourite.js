import { useFocusEffect } from '@react-navigation/native'
import React, { useContext, useCallback, useState } from 'react'
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  Dimensions,
  Alert,
  Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Components
import Products from '../../components/Products/Products'
import Spinner from '../../components/Spinner/Spinner'
import ErrorView from '../../components/ErrorView/ErrorView'
import { API_URL } from '../../config/api'

// Context
import { LocationContext } from '../../context/Location'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'

// Utils
import { theme } from '../../utils/themeColors'
import { useTranslation } from 'react-i18next'
import { scale } from '../../utils/scaling'
import { useAppBranding } from '../../utils/translationHelper'

function Favourite() {
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const branding = useAppBranding()
  const { location } = useContext(LocationContext)
  const { token } = useContext(AuthContext)
  const { getProductCartInfo, fetchCartItems } = useContext(UserContext)
  
  // State
  const [favoriteData, setFavoriteData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Network-only fetch function
  const fetchFavouriteData = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setRefreshing(false)
      setFavoriteData([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
      
      const response = await fetch(`${API_URL}/favorites/all`, {
        method: 'GET',
        headers: headers,
      })

      if (!response.ok) {
        const errorText = await response.text();
        if (__DEV__) {
          console.log('Error response:', errorText);
        }
        throw new Error(`Failed to fetch favourite data: ${response.status}`);
      }

      const data = await response.json()
      if (!data) {
        throw new Error('Empty response received');
      }
      // Ensure we have valid data before setting state
      const validFavorites = Array.isArray(data.favorites) ? data.favorites : []
      
      // Debug logging to help identify data issues
      if (__DEV__) {
        if (validFavorites.length > 0) {
          // Log stock-related fields for debugging
          const product = validFavorites[0]?.product;
        }
      }
      
      setFavoriteData(validFavorites)
      setError(null)
    } catch (err) {
      if (__DEV__) {
        console.log('Fetch error:', err.message)
      }
      setError(err.message)
      setFavoriteData([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token]) // Only depend on token, not location

  const handleRefresh = () => {
    setRefreshing(true)
    fetchFavouriteData()
  }

  // Fetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFavouriteData()
      // Refresh cart items to ensure buttons show correctly
      if (fetchCartItems) {
        fetchCartItems()
      }
    }, []) // Remove dependencies to prevent infinite loops
  )

  if (loading && !refreshing) {
    return (
      <Spinner
        backColor={branding.backgroundColor}
        spinnerColor={branding.primaryColor}
      />
    )
  }
  
  if (error) return <ErrorView />
  
  return (
    <SafeAreaView edges={['bottom']} style={[styles.flex, { backgroundColor: branding.backgroundColor }]}>
      <View style={[styles.flex, { backgroundColor: branding.backgroundColor }]}>
        {favoriteData.length > 0 ? (
          <FlatList
            key={`favorites-grid`}
            data={favoriteData}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ 
              justifyContent: 'space-between',
              paddingHorizontal: 10,
              marginBottom: 10
            }}
            contentContainerStyle={{ 
              padding: 10,
              paddingBottom: 20,
              flexGrow: 1
            }}
            renderItem={({ item }) => {
              if (!item || !item.product) {
                // Only log in development and for debugging
                if (__DEV__) {
                  console.log('Invalid item in favorites:', item?._id || 'unknown')
                }
                return null
              }
              
              return (
                <Products 
                  key={item._id || item.product._id}
                  item={item.product}
                  getProductCartInfo={getProductCartInfo}
                />
              )
            }}
            keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyTitle, { color: branding.textColor }]}>
                  No Favourite Items Found
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: branding.textColor }]}>
              No Favourite Items Found
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
    flexGrow: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16
  },
  emptyAnimation: {
    width: scale(200),
    height: scale(200),
    marginBottom: scale(20)
  },
  emptyTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    marginBottom: scale(8),
    textAlign: 'center'
  },
  emptyDescription: {
    fontSize: scale(16),
    textAlign: 'center',
    paddingHorizontal: scale(20)
  }
});

export default Favourite