import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useAppBranding } from '../../utils/translationHelper'
import { API_URL } from '../../config/api'
import styles from './styles'

const MyAds = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [sellerData, setSellerData] = useState(null)

  const navigation = useNavigation()
  const branding = useAppBranding()
  const { token } = useContext(AuthContext)
  const { isLoggedIn, formetedProfileData } = useContext(UserContext)

  // ✅ Get user ID from available sources
  const getUserId = () => {
    if (sellerData?._id) {
      return { id: sellerData._id, type: 'seller' }
    } else if (formetedProfileData?._id) {
      return { id: formetedProfileData._id, type: 'user' }
    } else {
      return null
    }
  }

  // ✅ Fetch seller data when user logs in
  useEffect(() => {
    if (isLoggedIn && token) {
      fetchSellerData()
    }
  }, [isLoggedIn, token])

  // ✅ Fetch products when we have user data
  useEffect(() => {
    const userId = getUserId()
    if (userId) {
      fetchProducts()
    }
  }, [sellerData, formetedProfileData])

  // ✅ Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const userId = getUserId()
      if (userId) {
        fetchProducts()
      }
    }, [sellerData, formetedProfileData])
  )

  const fetchSellerData = async () => {
    try {
      const response = await fetch(`${API_URL}/shop/getSeller`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user || data.seller || data.data) {
          const seller = data.user || data.seller || data.data
          setSellerData(seller)
        }
      }
    } catch (error) {
      console.error('Error fetching seller data:', error)
    }
  }

  const fetchProducts = async () => {
    const userId = getUserId()
    if (!userId) {
      setLoading(false)
      setRefreshing(false)
      return
    }

    setLoading(true)
    try {
      let url
      if (userId.type === 'seller') {
        url = `${API_URL}/product/get-all-products/${userId.id}`
      } else {
        url = `${API_URL}/product/get-user-products/${userId.id}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const productsData = data.products || data.data || []
        setProducts(productsData)
      } else {
        const data = await response.json()
        Alert.alert('Error', data.message || 'Failed to fetch ads')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      Alert.alert('Error', 'Failed to load your ads')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchProducts()
  }

  const handleDeleteProduct = async (productId) => {
    Alert.alert('Delete Ad', 'Are you sure you want to delete this ad?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(
              `${API_URL}/product/delete-shop-product/${productId}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            )

            const result = await response.json()
            if (response.ok && result.success) {
              Alert.alert('Success', 'Ad deleted successfully')
              fetchProducts()
            } else {
              Alert.alert('Error', result.message || 'Failed to delete ad')
            }
          } catch (error) {
            console.error('Error deleting ad:', error)
            Alert.alert('Error', 'Failed to delete ad')
          }
        }
      }
    ])
  }

  const handleEditProduct = (product) => {
    navigation.navigate('EditProduct', { product })
  }

  const handleCreateAd = () => {
    navigation.navigate('CreateAd')
  }

  const handleAdPress = (product) => {
    navigation.navigate('ProductDetail', {
      id: product._id,
      product: product
    })
  }

  // Show login prompt if not logged in
  if (!isLoggedIn || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle='light-content'
          backgroundColor={branding.headerColor}
        />
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name='shopping-bag'
            size={80}
            color={branding.iconColor || '#ccc'}
          />
          <TextDefault H4 bold style={styles.emptyText}>
            Please login to view your ads
          </TextDefault>
          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: branding.primaryColor }
            ]}
            onPress={() => navigation.navigate('Login')}
          >
            <TextDefault bold style={{ color: '#fff' }}>
              Login
            </TextDefault>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const renderProductCard = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => handleAdPress(item)}>
        <Image
          source={{
            uri:
              item.images?.[0]?.url ||
              item.images?.[0] ||
              'https://via.placeholder.com/100'
          }}
          style={styles.productImage}
        />
        {item.stock <= 0 && (
          <View style={styles.badge}>
            <TextDefault style={styles.badgeText}>Out of Stock</TextDefault>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <TouchableOpacity onPress={() => handleAdPress(item)}>
          <TextDefault bold numberOfLines={2} style={styles.productName}>
            {item.name}
          </TextDefault>
          <TextDefault
            style={[styles.productPrice, { color: branding.primaryColor }]}
          >
            ₹{item.discountPrice || item.originalPrice}
          </TextDefault>
          <TextDefault style={styles.productStock}>
            Stock: {item.stock} {item.unit ? `• ${item.unit}` : ''}
          </TextDefault>
          {item.category?.name && (
            <TextDefault small style={{ color: '#666666', marginTop: 4 }}>
              {item.category.name}
            </TextDefault>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: branding.primaryColor }
          ]}
          onPress={() => handleEditProduct(item)}
        >
          <MaterialIcons name='edit' size={20} color='white' />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
          onPress={() => handleDeleteProduct(item._id)}
        >
          <MaterialIcons name='delete' size={20} color='white' />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialIcons
        name='add-shopping-cart'
        size={80}
        color={branding.primaryColor}
      />
      <TextDefault H3 bold style={styles.emptyStateTitle}>
        No Ads Yet
      </TextDefault>
      <TextDefault style={styles.emptyStateSubtitle}>
        Start selling by creating your first ad
      </TextDefault>
      <TouchableOpacity
        style={[
          styles.createAdButton,
          { backgroundColor: branding.primaryColor, marginTop: 20 }
        ]}
        onPress={handleCreateAd}
      >
        <MaterialIcons name='add' size={24} color='white' />
        <TextDefault bold style={{ color: 'white', marginLeft: 8 }}>
          Create Your First Ad
        </TextDefault>
      </TouchableOpacity>
    </View>
  )

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle='light-content'
          backgroundColor={branding.headerColor}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={branding.primaryColor} />
          <TextDefault style={{ marginTop: 16, color: '#002F34' }}>
            Loading your ads...
          </TextDefault>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar
        barStyle='light-content'
        backgroundColor={branding.headerColor}
      />

      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[branding.primaryColor]}
            tintColor={branding.primaryColor}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

export default MyAds
