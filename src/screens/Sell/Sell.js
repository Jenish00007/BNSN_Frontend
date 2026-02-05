import React, { useContext, useState, useEffect } from 'react'
import {
  View,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useAppBranding } from '../../utils/translationHelper'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'
import { API_URL } from '../../config/api'
import styles from './styles'

const Sell = () => {
  const navigation = useNavigation()
  const branding = useAppBranding()
  const { token } = useContext(AuthContext)
  const { isLoggedIn, formetedProfileData } = useContext(UserContext)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [sellerData, setSellerData] = useState(null)

  // ✅ Get user ID from available sources
  const getUserId = () => {
    // Try seller data first, then user profile data
    if (sellerData?._id) {
      console.log('Using seller ID:', sellerData._id)
      return { id: sellerData._id, type: 'seller' }
    } else if (formetedProfileData?._id) {
      console.log('Using user ID:', formetedProfileData._id)
      return { id: formetedProfileData._id, type: 'user' }
    } else {
      console.warn('No user ID found for fetching ads')
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

  const fetchSellerData = async () => {
    try {
      console.log('Fetching seller data...')
      const response = await fetch(`${API_URL}/shop/getSeller`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Seller data response status:', response.status)

      // Check if response is OK and has JSON content type
      if (!response.ok) {
        console.log('Seller data response not OK:', response.status)
        return
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.log('Seller data response is not JSON')
        return
      }

      const data = await response.json()
      console.log('Seller data response:', data)

      if (data.user || data.seller || data.data) {
        const seller = data.user || data.seller || data.data
        setSellerData(seller)
        console.log('Seller data set:', seller)
      } else {
        console.log('No seller data found, user might not be a seller')
      }
    } catch (error) {
      console.error('Error fetching seller data:', error)
    }
  }

  const fetchProducts = async () => {
    const userId = getUserId()
    if (!userId) {
      console.warn('Cannot fetch products: No user ID available')
      setLoading(false)
      setRefreshing(false)
      return
    }

    setLoading(true)
    try {
      let url
      let endpoint

      // ✅ Use correct API endpoints based on user type
      if (userId.type === 'seller') {
        endpoint = 'get-all-products'
        url = `${API_URL}/product/${endpoint}/${userId.id}`
      } else {
        endpoint = 'get-user-products'
        url = `${API_URL}/product/${endpoint}/${userId.id}`
      }

      console.log(`Fetching ${userId.type} products from:`, url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Products response status:', response.status)

      // Check if response is OK and has JSON content type
      if (!response.ok) {
        console.error('Products request failed:', response.status)
        throw new Error(`HTTP ${response.status}: Failed to fetch products`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response received:', text.substring(0, 200))
        throw new Error('Server returned non-JSON response')
      }

      const data = await response.json()
      console.log('Products response data:', data)

      // Handle different response formats
      const productsData = data.products || data.data || []
      console.log(`Found ${productsData.length} products`,productsData)
      setProducts(productsData)
    } catch (error) {
      console.error('🚨 Error fetching products:', error)
      Alert.alert('Error', error.message || 'Failed to load products')
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
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
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
                Alert.alert('Success', 'Product deleted successfully')
                fetchProducts() // Refresh the list
              } else {
                Alert.alert(
                  'Error',
                  result.message || 'Failed to delete product'
                )
              }
            } catch (error) {
              console.error('Error deleting product:', error)
              Alert.alert('Error', 'Failed to delete product')
            }
          }
        }
      ]
    )
  }

  const handleEditProduct = (product) => {
    navigation.navigate('EditProduct', { product })
  }

  const handleCreateAd = () => {
    navigation.navigate('CreateAd')
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
            name='sell'
            size={80}
            color={branding.iconColor || '#ccc'}
          />
          <TextDefault H4 bold style={styles.emptyText}>
            Please login to start selling
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
    <View style={[styles.productCard, { backgroundColor: 'white' }]}>
      <Image
        source={{
          uri:
            item.images?.[0]?.url ||
            item.images?.[0] ||
            'https://via.placeholder.com/100'
        }}
        style={styles.productImage}
      />

      <View style={styles.productInfo}>
        <TextDefault bold numberOfLines={2} style={styles.productName}>
          {item.name}
        </TextDefault>
        <TextDefault
          style={[styles.productPrice, { color: branding.primaryColor }]}
        >
          ₹{item.discountPrice || item.originalPrice}
        </TextDefault>
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
        name='add-photo-alternate'
        size={80}
        color={branding.primaryColor}
      />
      <TextDefault H3 bold style={styles.emptyStateTitle}>
        No Products Yet
      </TextDefault>
      <TextDefault style={styles.emptyStateSubtitle}>
        Start selling by creating your first ad
      </TextDefault>
        
        
    </View>
  )

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <TouchableOpacity
        style={[
          styles.createAdButton,
          { backgroundColor: branding.primaryColor }
        ]}
        onPress={handleCreateAd}
      >
        <MaterialIcons name='add' size={24} color='white' />
        <TextDefault bold style={{ color: 'white', marginLeft: 8 }}>
          Create New Ad
        </TextDefault>
      </TouchableOpacity>

      {products.length > 0 && (
        <TextDefault bold style={styles.sectionTitle}>
          Your Products
        </TextDefault>
      )}
    </View>
  )

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: branding.backgroundColor }
        ]}
      >
        <StatusBar
          barStyle='light-content'
          backgroundColor={branding.headerColor}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={branding.primaryColor} />
          <TextDefault style={{ marginTop: 16 }}>
            Loading products...
          </TextDefault>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: branding.backgroundColor }]}
      edges={['bottom', 'left', 'right']}
    >
      <StatusBar
        barStyle='light-content'
        backgroundColor={branding.headerColor}
      />

      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
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

export default Sell
