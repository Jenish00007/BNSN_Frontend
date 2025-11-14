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
  const [actionLoadingId, setActionLoadingId] = useState(null)

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

  const renderStatusActionButton = ({
    label,
    onPress,
    loading = false,
    variant = 'primary'
  }) => {
    const variantStyle =
      variant === 'primary'
        ? styles.actionButtonPrimary
        : variant === 'secondary'
          ? styles.actionButtonSecondary
          : styles.actionButtonDestructive

    const textStyle =
      variant === 'primary'
        ? styles.actionButtonTextPrimary
        : variant === 'secondary'
          ? styles.actionButtonTextSecondary
          : styles.actionButtonTextDestructive

    const indicatorColor =
      variant === 'primary'
        ? '#FFFFFF'
        : variant === 'secondary'
          ? '#1D4ED8'
          : '#B91C1C'

    return (
      <TouchableOpacity
        style={[styles.actionButtonLarge, variantStyle]}
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size='small' color={indicatorColor} />
        ) : (
          <TextDefault bold style={textStyle}>
            {label}
          </TextDefault>
        )}
      </TouchableOpacity>
    )
  }

  const formatDateShort = (value) => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      return '—'
    }
  }

  const getStatusMeta = (product) => {
    switch (product?.status) {
      case 'sold':
        return {
          label: 'SOLD',
          chipStyle: { backgroundColor: '#DCFCE7' },
          chipTextStyle: { color: '#15803D' },
          message: 'This ad was sold',
          messageContainerStyle: { backgroundColor: '#DCFCE7' },
          messageTextStyle: { color: '#065F46' }
        }
      case 'inactive':
        return {
          label: 'EXPIRED',
          chipStyle: { backgroundColor: '#FEE2E2' },
          chipTextStyle: { color: '#B91C1C' },
          message:
            'This ad is inactive. Mark it as sold or republish to go live again.',
          messageContainerStyle: { backgroundColor: '#FEE2E2' },
          messageTextStyle: { color: '#7F1D1D' }
        }
      default:
        return {
          label: 'ACTIVE',
          chipStyle: { backgroundColor: '#DBEAFE' },
          chipTextStyle: { color: '#1D4ED8' },
          message: null
        }
    }
  }

  const performProductStatusUpdate = async ({
    productId,
    endpoint,
    successMessage,
    body
  }) => {
    if (!token) {
      Alert.alert('Error', 'Please login again to manage your ads.')
      return
    }

    const loadingKey = `${productId}:${endpoint}`
    setActionLoadingId(loadingKey)

    try {
      const response = await fetch(
        `${API_URL}/product/${endpoint}/${productId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: body ? JSON.stringify(body) : undefined
        }
      )

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data?.message || 'Failed to update ad.')
      }

      Alert.alert('Success', successMessage)
      fetchProducts()
    } catch (error) {
      console.error(`Error updating product (${endpoint}):`, error)
      Alert.alert('Error', error?.message || 'Failed to update ad.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleMarkAsSold = (product) => {
    Alert.alert(
      'Mark as sold',
      'Are you sure this item has been sold? Buyers will no longer be able to contact you.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as sold',
          style: 'destructive',
          onPress: () =>
            performProductStatusUpdate({
              productId: product._id,
              endpoint: 'mark-product-sold',
              successMessage: 'Ad marked as sold',
              body: { reason: 'Marked as sold from My Ads' }
            })
        }
      ]
    )
  }

  const handleDeactivateAd = (product) => {
    Alert.alert(
      'Move to inactive',
      'This ad will be hidden from buyers. You can republish it anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to inactive',
          style: 'destructive',
          onPress: () =>
            performProductStatusUpdate({
              productId: product._id,
              endpoint: 'mark-product-inactive',
              successMessage: 'Ad moved to inactive',
              body: { reason: 'Manually removed from My Ads' }
            })
        }
      ]
    )
  }

  const handleRepublishAd = (product) => {
    performProductStatusUpdate({
      productId: product._id,
      endpoint: 'republish-product',
      successMessage: 'Ad republished for another 30 days'
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

  const renderProductCard = ({ item }) => {
    const statusMeta = getStatusMeta(item)
    const createdLabel = formatDateShort(item.createdAt)
    const expiresLabel = formatDateShort(item.expiresAt)

    const markSoldLoading = actionLoadingId === `${item._id}:mark-product-sold`
    const deactivateLoading =
      actionLoadingId === `${item._id}:mark-product-inactive`
    const republishLoading = actionLoadingId === `${item._id}:republish-product`

    return (
      <View style={styles.productCard}>
        <TouchableOpacity onPress={() => handleAdPress(item)}>
          <View style={styles.productImageWrapper}>
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
          </View>
        </TouchableOpacity>

        <View style={styles.productInfo}>
          <TouchableOpacity onPress={() => handleAdPress(item)}>
            <TextDefault bold numberOfLines={2} style={styles.productName}>
              {item.name}
            </TextDefault>
          </TouchableOpacity>
          <TextDefault
            style={[styles.productPrice, { color: branding.primaryColor }]}
          >
            ₹{item.discountPrice || item.originalPrice || 0}
          </TextDefault>
          <TextDefault style={styles.productStock}>
            Posted on {createdLabel}
          </TextDefault>
          <TextDefault small style={styles.productMetaText}>
            Expires on {expiresLabel}
          </TextDefault>
        </View>

        <View style={styles.statusHeader}>
          <View
            style={[
              styles.statusChip,
              statusMeta.chipStyle || styles.statusChipDefault
            ]}
          >
            <TextDefault
              bold
              style={statusMeta.chipTextStyle || styles.statusChipText}
            >
              {statusMeta.label}
            </TextDefault>
          </View>
          <View style={styles.inlineActions}>
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

        {statusMeta.message && (
          <View
            style={[
              styles.statusMessageContainer,
              statusMeta.messageContainerStyle || null
            ]}
          >
            <TextDefault
              style={[
                styles.statusMessageText,
                statusMeta.messageTextStyle || null
              ]}
            >
              {statusMeta.message}
            </TextDefault>
          </View>
        )}

        <View style={styles.actionsRow}>
          {item.status === 'active' && (
            <>
              {renderStatusActionButton({
                label: 'Mark as sold',
                onPress: () => handleMarkAsSold(item),
                loading: markSoldLoading,
                variant: 'primary'
              })}
              {renderStatusActionButton({
                label: 'Remove',
                onPress: () => handleDeactivateAd(item),
                loading: deactivateLoading,
                variant: 'secondary'
              })}
            </>
          )}

          {item.status === 'inactive' && (
            <>
              {renderStatusActionButton({
                label: 'Mark as sold',
                onPress: () => handleMarkAsSold(item),
                loading: markSoldLoading,
                variant: 'secondary'
              })}
              {renderStatusActionButton({
                label: 'Republish',
                onPress: () => handleRepublishAd(item),
                loading: republishLoading,
                variant: 'primary'
              })}
            </>
          )}

          {item.status === 'sold' && (
            <>
              {renderStatusActionButton({
                label: 'Remove',
                onPress: () => handleDeleteProduct(item._id),
                loading: false,
                variant: 'destructive'
              })}
            </>
          )}
        </View>
      </View>
    )
  }

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
