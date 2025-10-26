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
import AsyncStorage from '@react-native-async-storage/async-storage'
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
  const { isLoggedIn } = useContext(UserContext)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [sellerData, setSellerData] = useState(null)

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchSellerData()
    }
  }, [isLoggedIn, token])

  useEffect(() => {
    if (sellerData?._id) {
      fetchProducts()
    }
  }, [sellerData])

  const fetchSellerData = async () => {
    try {
      const response = await fetch(`${API_URL}/shop/getSeller`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok && (data.user || data.seller)) {
        const seller = data.user || data.seller
        setSellerData(seller)
      }
    } catch (error) {
      console.error('Error fetching seller data:', error)
    }
  }

  const fetchProducts = async () => {
    if (!sellerData?._id) return

    setLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/product/shop/${sellerData._id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()

      if (response.ok) {
        setProducts(data.products || data.data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchProducts()
  }

  const handleDeleteProduct = (productId) => {
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
              const response = await fetch(`${API_URL}/product/${productId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })

              if (response.ok) {
                Alert.alert('Success', 'Product deleted successfully')
                fetchProducts() // Refresh the list
              } else {
                Alert.alert('Error', 'Failed to delete product')
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
        <TextDefault small style={styles.productStock}>
          Stock: {item.stock}
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
      <View style={styles.statsContainer}>
        <View
          style={[styles.statCard, { backgroundColor: branding.primaryColor }]}
        >
          <MaterialIcons name='inventory' size={24} color='white' />
          <TextDefault bold style={styles.statNumber}>
            {products.length}
          </TextDefault>
          <TextDefault small style={styles.statLabel}>
            Total Products
          </TextDefault>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
          <MaterialIcons name='trending-up' size={24} color='white' />
          <TextDefault bold style={styles.statNumber}>
            {products.filter((p) => p.stock > 0).length}
          </TextDefault>
          <TextDefault small style={styles.statLabel}>
            In Stock
          </TextDefault>
        </View>
      </View>

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
