import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback
} from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
  useColorScheme,
  Modal,
  Animated,
  TextInput,
  ActivityIndicator
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import AddToFavourites from './../../components/Favourites/AddtoFavourites'
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'
import AuthContext from '../../context/Auth'
import { LocationContext } from '../../context/Location'
import UserContext from '../../context/User'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors' // Import the theme object
import styles from './ProductDetailsStyles' // Base styles
import { useAppBranding } from '../../utils/translationHelper'
import { IMAGE_LINK } from '../../utils/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import { API_URL } from '../../config/api'

const { width } = Dimensions.get('window')

const ProductDetail = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { product } = route.params
  const { location } = useContext(LocationContext)
  const { isLoggedIn, addToCart } = useContext(UserContext)

  const branding = useAppBranding()
  const [loading, setLoading] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const [fullViewVisible, setFullViewVisible] = useState(false)
  const [fullViewIndex, setFullViewIndex] = useState(0)
  const reviewsRef = useRef(null)
  const { token } = useContext(AuthContext)
  const scrollViewRef = useRef(null)

  const [quantity, setQuantity] = useState(1)

  const handleIncreaseQty = () => {
    setQuantity((q) => q + 1)
  }

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1)
    }
  }

  // Review section state
  const [reviewInput, setReviewInput] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviews, setReviews] = useState(product?.reviews || [])
  const [user, setUser] = useState(null)
  const [userOrders, setUserOrders] = useState([])
  const [canReview, setCanReview] = useState(false)
  const [orderIdForReview, setOrderIdForReview] = useState(null)
  const [shopImageError, setShopImageError] = useState(false)
  const [shopImageLoading, setShopImageLoading] = useState(true)
  const [userDetails, setUserDetails] = useState(product?.user || null)
  const [userDetailsLoading, setUserDetailsLoading] = useState(false)
  const [userDetailsError, setUserDetailsError] = useState(null)
  const isMountedRef = useRef(true)

  // Get the current color scheme (system preference)
  const colorScheme = useColorScheme()

  // Check if the product has multiple images
  const hasMultipleImages =
    product?.images &&
    Array.isArray(product.images) &&
    product.images.length > 1
  const images = hasMultipleImages
    ? product.images
    : [product?.image || product?.images?.[0]]

  // Filter out any invalid image URLs and add fallback
  const validImages = images
    .filter((img) => {
      if (!img) return false
      // Handle both string URLs and objects with url property
      if (typeof img === 'string') {
        return img.trim() !== ''
      }
      if (typeof img === 'object' && img.url) {
        return img.url.trim() !== ''
      }
      return false
    })
    .map((img) => {
      // Extract URL from object or use string directly
      if (typeof img === 'string') {
        return img
      }
      if (typeof img === 'object' && img.url) {
        return img.url
      }
      return IMAGE_LINK
    })

  // If no valid images, use fallback
  const finalImages = validImages.length > 0 ? validImages : [IMAGE_LINK]
  console.log('finalImages', finalImages)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Function to get shop image source with fallback
  const getShopImageSource = () => {
    if (shopImageError) {
      return require('../../assets/images/placeholder.png')
    }

    // Try multiple possible shop image fields
    const shopImageUrl =
      product?.shop?.avatar ||
      product?.shop?.logo ||
      product?.shop?.image ||
      product?.shop?.shopAvatar ||
      product?.shop?.logo_full_url

    // Debug: Log shop data to understand the structure
    console.log('Shop data:', {
      shop: product?.shop,
      avatar: product?.shop?.avatar,
      logo: product?.shop?.logo,
      image: product?.shop?.image,
      shopAvatar: product?.shop?.shopAvatar,
      logo_full_url: product?.shop?.logo_full_url,
      shopImageUrl
    })

    if (
      shopImageUrl &&
      typeof shopImageUrl === 'string' &&
      shopImageUrl.trim() !== ''
    ) {
      // Validate URL format
      try {
        new URL(shopImageUrl)
        return { uri: shopImageUrl }
      } catch (error) {
        console.log('Invalid shop image URL:', shopImageUrl)
        return require('../../assets/images/placeholder.png')
      }
    }

    return require('../../assets/images/placeholder.png')
  }

  // Function to fetch complete shop data if needed
  const fetchShopData = async () => {
    if (!product?.shopId && !product?.shop?._id) return

    try {
      const shopId = product?.shopId || product?.shop?._id
      const response = await fetch(`${API_URL}/shop/get-shop/${shopId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json()
            if (data.success && data.shop) {
              // Update the product with complete shop data
              product.shop = data.shop
              // Force re-render
              setShopImageError(false)
            }
          } else {
            console.log('Non-JSON response received from shop API')
          }
        } catch (jsonError) {
          console.log('Error parsing JSON response:', jsonError)
        }
      }
    } catch (error) {
      console.log('Error fetching shop data:', error)
    }
  }

  // Handler for modal image scroll
  const handleFullViewScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / width)
    if (index !== fullViewIndex) {
      setFullViewIndex(index)
    }
  }

  // Remove modal/preview functions

  // Render rating stars
  const renderRatingStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)
    const halfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FontAwesome key={i} name='star' size={20} color='#FFC107' />
        )
      } else if (i === fullStars && halfStar) {
        stars.push(
          <FontAwesome key={i} name='star-half-o' size={20} color='#FFC107' />
        )
      } else {
        stars.push(
          <FontAwesome key={i} name='star-o' size={20} color='#FFC107' />
        )
      }
    }
    return stars
  }

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigation.navigate('Login')
      return
    }

    setLoading(true)
    try {
      const result = await addToCart(product)
      if (result.success) {
        Alert.alert('Success', result.message)
      } else {
        Alert.alert('Error', result.message)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      Alert.alert('Error', 'An error occurred while adding to cart.')
    } finally {
      setLoading(false)
    }
  }

  const handleChat = () => {
    if (!isLoggedIn) {
      navigation.navigate('Login')
      return
    }
    console.log('check', product)

    let sellerId = null
    let sellerDisplayName = 'Seller'
    let otherParticipant = null

    if (product?.shop?._id) {
      sellerId = product.shop._id
      sellerDisplayName =
        product.shop.name ||
        product.shop.shopName ||
        product.shop.title ||
        'Seller'
      otherParticipant = {
        ...product.shop,
        _id: product.shop._id,
        displayName: sellerDisplayName,
        role: 'seller'
      }
    } else if (product?.userId) {
      sellerId = product.userId
      const sourceUser = product?.user || userDetails
      sellerDisplayName =
        sourceUser?.displayName ||
        sourceUser?.name ||
        sourceUser?.fullName ||
        sourceUser?.username ||
        'Seller'
      if (sourceUser) {
        otherParticipant = {
          ...sourceUser,
          _id: sourceUser._id || sellerId,
          displayName: sellerDisplayName
        }
      } else if (sellerId) {
        otherParticipant = {
          _id: sellerId,
          displayName: sellerDisplayName
        }
      }
    } else if (product?.shopId) {
      sellerId = product.shopId
      sellerDisplayName = product.shopName || 'Seller'
    }

    if (sellerId) {
      navigation.navigate('Chat', {
        conversationId: product?.conversationId || null,
        shopId: sellerId,
        shopName: sellerDisplayName,
        productId: product._id,
        displayName: sellerDisplayName,
        otherUser: otherParticipant
      })
    } else {
      Alert.alert('Error', 'Unable to contact seller at this time.')
    }
  }

  const handleCall = () => {
    if (!isLoggedIn) {
      navigation.navigate('Login')
      return
    }

    const phoneNumber =
      product?.shop?.phoneNumber ||
      product?.shop?.phone ||
      userDetails?.phoneNumber ||
      userDetails?.phone

    if (phoneNumber) {
      try {
        const { Linking } = require('react-native')
        Linking.openURL(`tel:${phoneNumber}`)
      } catch (error) {
        console.error('Failed to open dialer:', error)
        Alert.alert(
          'Error',
          'Unable to launch the phone dialer. Please try again later.'
        )
      }
    } else {
      Alert.alert(
        'Phone Number Unavailable',
        'Seller phone number is not available right now.'
      )
    }
  }

  // Fetch user/token from AsyncStorage (or context)
  useEffect(() => {
    AsyncStorage.getItem('user').then((u) => u && setUser(JSON.parse(u)))
  }, [])

  // Fetch user orders to check if they can review this product
  useEffect(() => {
    if (token && user && product?._id) {
      fetchUserOrders()
    }
  }, [token, user, product?._id])

  useEffect(() => {
    if (product?.user) {
      setUserDetails((previous) => {
        if (
          previous &&
          product.user &&
          previous._id &&
          product.user._id &&
          previous._id === product.user._id
        ) {
          return previous
        }
        return product.user
      })
      setUserDetailsError(null)
    }
  }, [product?.user])

  // Fetch complete shop data if shop image is missing
  useEffect(() => {
    if (product && (!product?.shop?.avatar || shopImageError)) {
      fetchShopData()
    }
  }, [product, shopImageError])

  const fetchUserOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/order/get-all-orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setUserOrders(data.orders || [])
        // Check if user has purchased this product
        const hasPurchased = data.orders.some((order) =>
          order.items.some((item) => item._id === product._id)
        )
        setCanReview(hasPurchased)

        // Find the orderId for this product
        if (hasPurchased) {
          const orderWithProduct = data.orders.find((order) =>
            order.items.some((item) => item._id === product._id)
          )
          if (orderWithProduct) {
            setOrderIdForReview(orderWithProduct._id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user orders:', error)
    }
  }

  const fetchUserDetails = useCallback(async () => {
    if (product?.shop || !product?.userId) return

    try {
      setUserDetailsLoading(true)
      setUserDetailsError(null)

      const headers = {
        'Content-Type': 'application/json'
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(
        `${API_URL}/user/user-info/${product.userId}`,
        {
          method: 'GET',
          headers
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success || !data.user) {
        throw new Error(data.message || 'Unable to load user information')
      }

      if (isMountedRef.current) {
        setUserDetails(data.user)
      }
    } catch (error) {
      if (isMountedRef.current) {
        setUserDetailsError(error.message || 'Unable to load user information')
      }
    } finally {
      if (isMountedRef.current) {
        setUserDetailsLoading(false)
      }
    }
  }, [product?.shop, product?.userId, token])

  useEffect(() => {
    if (!product?.shop && product?.userId) {
      const userMismatch =
        userDetails && userDetails._id && userDetails._id !== product.userId

      if (userMismatch) {
        setUserDetails(null)
        return
      }

      if (!userDetails || (userDetails && !userDetails._id)) {
        fetchUserDetails()
      }
    }
  }, [product?.shop, product?.userId, userDetails, fetchUserDetails])

  const userAddress = useMemo(() => {
    if (!userDetails) return null

    if (typeof userDetails.address === 'string' && userDetails.address.trim()) {
      return userDetails.address.trim()
    }

    if (
      Array.isArray(userDetails.addresses) &&
      userDetails.addresses.length > 0
    ) {
      const primaryAddress =
        userDetails.addresses.find((addr) =>
          ['address1', 'address2', 'city', 'state', 'country', 'zipCode'].some(
            (key) => typeof addr?.[key] === 'string' && addr[key].trim()
          )
        ) || userDetails.addresses[0]

      if (primaryAddress) {
        const parts = [
          primaryAddress.address1,
          primaryAddress.address2,
          primaryAddress.city,
          primaryAddress.state,
          primaryAddress.country,
          primaryAddress.zipCode
        ]

        const filtered = parts
          .map((part) => {
            if (typeof part === 'string') return part.trim()
            if (typeof part === 'number') return part.toString()
            return ''
          })
          .filter((part) => part && part.length > 0)

        if (filtered.length > 0) {
          return filtered.join(', ')
        }
      }
    }

    return null
  }, [userDetails])

  // Helper: fetch latest reviews (simulate by updating from product)
  const refreshReviews = () => {
    setReviews(product?.reviews || [])
  }

  const renderContactRow = (icon, label, value) => {
    if (!value) return null

    return (
      <View style={styles.contactInfoRow}>
        <MaterialIcons
          name={icon}
          size={18}
          color={branding.primaryColor}
          style={styles.contactInfoIcon}
        />
        <View style={styles.contactInfoTextWrapper}>
          <Text
            style={[styles.contactInfoLabel, { color: branding.textColor }]}
          >
            {label}
          </Text>
          <Text
            style={[
              styles.contactInfoValue,
              { color: branding.textColor, opacity: 0.85 }
            ]}
          >
            {value}
          </Text>
        </View>
      </View>
    )
  }

  // Submit review
  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewInput.trim()) return
    if (!token) {
      Alert.alert('Error', 'Please login to submit a review')
      return
    }

    if (!canReview) {
      Alert.alert('Error', 'You can only review products you have purchased')
      return
    }

    if (!orderIdForReview) {
      Alert.alert(
        'Error',
        'Unable to find your purchase record for this product'
      )
      return
    }

    setSubmittingReview(true)
    try {
      console.log('Submitting review with data:', {
        rating: reviewRating,
        comment: reviewInput,
        productId: product._id,
        orderId: orderIdForReview,
        token: token ? 'Present' : 'Missing'
      })

      const res = await fetch(`${API_URL}/product/create-new-review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user: user || { _id: 'temp', name: 'User' },
          rating: reviewRating,
          comment: reviewInput,
          productId: product._id,
          orderId: orderIdForReview
        })
      })

      console.log('Response status:', res.status)
      const data = await res.json()
      console.log('Response data:', data)

      if (data.success) {
        setReviewInput('')
        setReviewRating(0)
        Alert.alert('Success', 'Review submitted successfully!')
        // Ideally, fetch updated product/reviews from backend
        refreshReviews()
      } else {
        Alert.alert('Error', data.message || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Review submission error:', error)
      Alert.alert('Error', 'Network error. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Main image and thumbnails UI
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: branding.backgroundColor }]}
    >
      <StatusBar
        backgroundColor={branding.headerColor}
        barStyle='light-content'
        translucent={false}
        animated={true}
      />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Main Image */}
        <View style={styles.mainImageContainer}>
          <TouchableOpacity
            onPress={() => {
              setFullViewIndex(activeImageIndex)
              setFullViewVisible(true)
            }}
          >
            <Image
              source={{ uri: finalImages[activeImageIndex] }}
              style={styles.productImage}
              resizeMode='cover'
            />
          </TouchableOpacity>
          <View style={styles.favIconContainer}>
            <AddToFavourites product={product} />
          </View>
          {/* Badges Row (left) */}
          <View style={styles.badgeRow}>
            {product?.bestSeller && (
              <View style={[styles.badge, styles.bestSellerBadge]}>
                <Text style={styles.badgeText}>Best Seller</Text>
              </View>
            )}
          </View>
        </View>
        {/* Thumbnails at the bottom */}
        {finalImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailRow}
            contentContainerStyle={styles.thumbnailRowContent}
          >
            {finalImages.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.thumbnailWrapper,
                  activeImageIndex === idx && styles.selectedThumbnail
                ]}
                onPress={() => setActiveImageIndex(idx)}
              >
                <Image
                  source={{ uri: img }}
                  style={styles.thumbnailImage}
                  resizeMode='cover'
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Information Section */}
        <View
          style={[
            styles.infoSection,
            { backgroundColor: branding.secondaryColor }
          ]}
        >
          <View style={styles.nameAndPrice}>
            <Text style={[styles.productName, { color: branding.textColor }]}>
              {' '}
              {product?.name}{' '}
            </Text>
            {/* Ratings as stars below name */}

            <View style={styles.priceContainer}>
              {product?.originalPrice > product?.discountPrice && (
                <Text
                  style={[styles.originalPrice, { color: branding.textColor }]}
                >
                  {' '}
                  ₹{product?.originalPrice}{' '}
                </Text>
              )}
              <Text
                style={[styles.productPrice, { color: branding.primaryColor }]}
              >
                {' '}
                ₹{product?.discountPrice}{' '}
              </Text>
            </View>
          </View>

          {/* Category and Subcategory */}
          <View style={styles.categoryContainer}>
            <Text style={[styles.categoryText, { color: branding.textColor }]}>
              {product?.category?.name}{' '}
              {product?.subcategory?.name
                ? `> ${product.subcategory.name}`
                : ''}
            </Text>
          </View>

          {/* Rating and Stock Status */}
          {/* <View style={styles.ratingStockContainer}>
                        <View style={styles.ratingContainer}>
                            <View style={styles.starsContainer}>
                                {renderRatingStars(product?.avg_rating)}
                            </View>
                            <Text style={[styles.ratingText, { color: branding.textColor }]}>
                                ({product?.reviews?.length || 0} reviews)
                            </Text>
                        </View>
                        <View style={[styles.stockBadge, {backgroundColor: stockColor + '20'}]}>
                            <Text style={[styles.stockText, {color: stockColor}]}>
                                {product.stock}
                            </Text>
                        </View>
                    </View> */}

          <View
            style={[styles.divider, { backgroundColor: branding.textColor }]}
          />

          {/* Shop/User Information */}
          {product?.shop ? (
            <View style={styles.shopContainer}>
              <Text
                style={[styles.sectionTitle, { color: branding.textColor }]}
              >
                Seller Information
              </Text>
              <View style={styles.shopInfo}>
                <Image
                  source={getShopImageSource()}
                  style={styles.shopAvatar}
                  defaultSource={require('../../assets/images/placeholder.png')}
                  onLoadStart={() => setShopImageLoading(true)}
                  onLoadEnd={() => setShopImageLoading(false)}
                  onError={(error) => {
                    console.log('Shop avatar load error:', error.nativeEvent)
                    setShopImageError(true)
                    setShopImageLoading(false)
                  }}
                />
                {shopImageLoading && (
                  <View style={[styles.shopAvatar, styles.shopAvatarLoading]}>
                    <ActivityIndicator
                      size='small'
                      color={branding.primaryColor}
                    />
                  </View>
                )}
                {shopImageError && !shopImageLoading && (
                  <TouchableOpacity
                    style={[styles.shopAvatar, styles.shopAvatarError]}
                    onPress={() => {
                      setShopImageError(false)
                      fetchShopData()
                    }}
                  >
                    <MaterialIcons
                      name='refresh'
                      size={20}
                      color={branding.primaryColor}
                    />
                  </TouchableOpacity>
                )}
                <View style={styles.shopDetails}>
                  <Text
                    style={[styles.shopName, { color: branding.textColor }]}
                  >
                    {product?.shop?.name || 'Name Not Available'}
                  </Text>
                  <Text
                    style={[styles.shopAddress, { color: branding.textColor }]}
                  >
                    {product?.shop?.address || 'Address Not Available'}
                  </Text>
                </View>
              </View>
              {(product?.shop?.email ||
                product?.shop?.phoneNumber ||
                product?.shop?.phone) && (
                <View style={styles.contactInfoContainer}>
                  {renderContactRow('email', 'Email', product?.shop?.email)}
                  {renderContactRow(
                    'phone',
                    'Phone',
                    product?.shop?.phoneNumber || product?.shop?.phone
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.shopContainer}>
              <Text
                style={[styles.sectionTitle, { color: branding.textColor }]}
              >
                User Information
              </Text>
              {userDetailsLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator
                    size='small'
                    color={branding.primaryColor}
                  />
                  <Text
                    style={[styles.loadingText, { color: branding.textColor }]}
                  >
                    Loading user details...
                  </Text>
                </View>
              ) : userDetails ? (
                <>
                  <View style={styles.shopInfo}>
                    {userDetails?.avatar ? (
                      <Image
                        source={{ uri: userDetails.avatar }}
                        style={styles.shopAvatar}
                        defaultSource={require('../../assets/images/placeholder.png')}
                      />
                    ) : (
                      <View style={[styles.shopAvatar, styles.shopAvatarError]}>
                        <MaterialIcons
                          name='person'
                          size={24}
                          color={branding.primaryColor}
                        />
                      </View>
                    )}
                    <View style={styles.shopDetails}>
                      <Text
                        style={[styles.shopName, { color: branding.textColor }]}
                      >
                        {userDetails?.name || 'Name Not Available'}
                      </Text>
                      <Text
                        style={[
                          styles.shopAddress,
                          { color: branding.textColor }
                        ]}
                      >
                        {userAddress || 'Address Not Available'}
                      </Text>
                    </View>
                  </View>
                  {(userDetails?.email || userDetails?.phoneNumber) && (
                    <View style={styles.contactInfoContainer}>
                      {renderContactRow('email', 'Email', userDetails?.email)}
                      {renderContactRow(
                        'phone',
                        'Phone',
                        userDetails?.phoneNumber
                      )}
                    </View>
                  )}
                </>
              ) : userDetailsError ? (
                <TouchableOpacity
                  style={styles.loadingRow}
                  onPress={fetchUserDetails}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name='refresh'
                    size={18}
                    color={branding.primaryColor}
                  />
                  <Text
                    style={[styles.errorText, { color: branding.primaryColor }]}
                  >
                    {userDetailsError}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.shopInfo}>
                  <View style={[styles.shopAvatar, styles.shopAvatarError]}>
                    <MaterialIcons
                      name='person'
                      size={24}
                      color={branding.primaryColor}
                    />
                  </View>
                  <View style={styles.shopDetails}>
                    <Text
                      style={[styles.shopName, { color: branding.textColor }]}
                    >
                      Seller Information Not Available
                    </Text>
                    <Text
                      style={[
                        styles.shopAddress,
                        { color: branding.textColor }
                      ]}
                    >
                      Contact support for seller details
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <View
            style={[styles.divider, { backgroundColor: branding.textColor }]}
          />

          {/* Product Description */}
          <View style={styles.descriptionContainer}>
            <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
              Description
            </Text>
            <Text
              style={[styles.productDescription, { color: branding.textColor }]}
            >
              {product?.description ||
                'No description available for this product.'}
            </Text>
          </View>

          {/* Tags */}
          {product?.tags && (
            <View style={styles.tagsContainer}>
              <Text
                style={[styles.sectionTitle, { color: branding.textColor }]}
              >
                Tags
              </Text>
              <Text style={[styles.tagsText, { color: branding.textColor }]}>
                {product.tags}
              </Text>
            </View>
          )}
          {/* Review Section */}
          <View style={styles.reviewSection}>
            {/* Enhanced Review Header */}
            {/* <View style={styles.reviewHeader}>
                            <View style={styles.reviewHeaderLeft}>
                                <Text style={[styles.sectionTitle, { color: branding.textColor }]}>Ratings & Reviews</Text>
                                <View style={styles.reviewStats}>
                                    <View style={styles.ratingDisplay}>
                                        <Text style={[styles.ratingNumber, { color: branding.primaryColor }]}>
                                            {(product?.avg_rating || 0).toFixed(1)}
                                        </Text>
                                        <View style={styles.starsContainer}>
                                            {renderRatingStars(product?.avg_rating)}
                                        </View>
                                    </View>
                                    <Text style={[styles.reviewCountText, { color: branding.textColor }]}>
                                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                                    </Text>
                                </View>
                            </View>
                            
                          
                            <View style={styles.ratingDistribution}>
                                {[5, 4, 3, 2, 1].map(rating => {
                                    const count = reviews.filter(r => Math.floor(r.rating) === rating).length;
                                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                    return (
                                        <View key={rating} style={styles.ratingBar}>
                                            <Text style={[styles.ratingLabel, { color: branding.textColor }]}>{rating}★</Text>
                                            <View style={styles.progressBar}>
                                                <View 
                                                    style={[
                                                        styles.progressFill, 
                                                        { 
                                                            width: `${percentage}%`,
                                                            backgroundColor: branding.primaryColor 
                                                        }
                                                    ]} 
                                                />
                                            </View>
                                            <Text style={[styles.ratingCount, { color: branding.textColor }]}>{count}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View> */}

            {/* Review Input Section */}
            {/* {token ? (
                            canReview ? (
                                <View style={styles.reviewInputSection}>
                                    <Text style={[styles.reviewInputTitle, { color: branding.textColor }]}>Write a Review</Text>
                                    <View style={styles.reviewInputBox}>
                                        <View style={styles.reviewStarInputRow}>
                                            <Text style={[styles.starLabel, { color: branding.textColor }]}>Your Rating:</Text>
                                            {[1,2,3,4,5].map(star => (
                                                <TouchableOpacity 
                                                    key={star} 
                                                    onPress={() => setReviewRating(star)}
                                                    style={styles.starButton}
                                                >
                                                    <FontAwesome 
                                                        name={reviewRating >= star ? "star" : "star-o"} 
                                                        size={24} 
                                                        color={reviewRating >= star ? "#FFC107" : "#D3D3D3"} 
                                                    />
                                                </TouchableOpacity>
                                            ))}
                                            <Text style={[styles.ratingText, { color: branding.textColor }]}>
                                                {reviewRating > 0 ? `${reviewRating}/5` : ''}
                                            </Text>
                                        </View>
                                        <TextInput
                                            style={[styles.reviewTextInput, { 
                                                borderColor: branding.primaryColor,
                                                color: branding.textColor,
                                                backgroundColor: branding.backgroundColor
                                            }]}
                                            placeholder="Share your experience with this product..."
                                            placeholderTextColor={branding.textColor + '80'}
                                            value={reviewInput}
                                            onChangeText={setReviewInput}
                                            multiline
                                            numberOfLines={4}
                                            maxLength={500}
                                        />
                                        <View style={styles.reviewInputFooter}>
                                            <Text style={[styles.charCount, { color: branding.textColor + '80' }]}>
                                                {reviewInput.length}/500
                                            </Text>
                                            <TouchableOpacity
                                                style={[
                                                    styles.reviewSubmitBtn, 
                                                    { backgroundColor: branding.primaryColor },
                                                    (!reviewRating || !reviewInput.trim()) && { opacity: 0.5 }
                                                ]}
                                                onPress={handleSubmitReview}
                                                disabled={!reviewRating || !reviewInput.trim() || submittingReview}
                                            >
                                                <Text style={styles.reviewSubmitBtnText}>
                                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.reviewLoginPrompt}>
                                    <MaterialIcons name="shopping-bag" size={24} color={branding.primaryColor} />
                                    <Text style={[styles.reviewLoginText, { color: branding.textColor }]}>
                                        Purchase this product to write a review
                                    </Text>
                                    <TouchableOpacity 
                                        style={[styles.loginButton, { backgroundColor: branding.primaryColor }]}
                                        onPress={() => handleAddToCart(1)}
                                    >
                                        <Text style={styles.loginButtonText}>Add to Cart</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        ) : (
                            <View style={styles.reviewLoginPrompt}>
                                <MaterialIcons name="lock" size={24} color={branding.primaryColor} />
                                <Text style={[styles.reviewLoginText, { color: branding.textColor }]}>
                                    Log in to write a review and share your experience
                                </Text>
                                <TouchableOpacity 
                                    style={[styles.loginButton, { backgroundColor: branding.primaryColor }]}
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    <Text style={styles.loginButtonText}>Login</Text>
                                </TouchableOpacity>
                            </View>
                        )} */}

            {/* Review List Header */}
            {/* {reviews.length > 0 && (
                            <View style={styles.reviewListHeader}>
                                <Text style={[styles.reviewListTitle, { color: branding.textColor }]}>
                                    Customer Reviews
                                </Text>
                                <View style={styles.reviewFilters}>
                                    <TouchableOpacity style={styles.filterButton}>
                                        <Text style={[styles.filterText, { color: branding.primaryColor }]}>Most Recent</Text>
                                        <MaterialIcons name="keyboard-arrow-down" size={16} color={branding.primaryColor} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )} */}

            {/* Enhanced Review List */}
            {/* <View style={styles.reviewList}>
                            {reviews.length === 0 ? (
                                <View style={styles.reviewEmptyState}>
                                    <MaterialIcons name="rate-review" size={48} color={branding.textColor + '40'} />
                                    <Text style={[styles.reviewEmptyText, { color: branding.textColor }]}>
                                        No reviews yet
                                    </Text>
                                    <Text style={[styles.reviewEmptySubtext, { color: branding.textColor + '80' }]}>
                                        Be the first to review this product
                                    </Text>
                                </View>
                            ) : (
                                reviews.map((rev, idx) => (
                                    <View key={idx} style={[styles.reviewItem, { borderBottomColor: branding.textColor + '20' }]}>
                                        <View style={styles.reviewItemHeader}>
                                            <View style={styles.reviewUserInfo}>
                                                <View style={styles.userAvatar}>
                                                    <Text style={styles.userInitial}>
                                                        {(rev.user?.name || 'U').charAt(0).toUpperCase()}
                                                    </Text>
                                                </View>
                                                <View style={styles.userDetails}>
                                                    <Text style={[styles.reviewUser, { color: branding.textColor }]}>
                                                        {rev.user?.name || 'Anonymous User'}
                                                    </Text>
                                                    <Text style={[styles.reviewDate, { color: branding.textColor + '80' }]}>
                                                        {moment(rev.createdAt).format('MMM DD, YYYY')}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.reviewStarsRow}>
                                                {renderRatingStars(rev.rating)}
                                            </View>
                                        </View>
                                        <Text style={[styles.reviewComment, { color: branding.textColor }]}>
                                            {rev.comment}
                                        </Text>
                                        <View style={styles.reviewActions}>
                                            <TouchableOpacity style={styles.reviewAction}>
                                                <MaterialIcons name="thumb-up-outline" size={16} color={branding.textColor + '60'} />
                                                <Text style={[styles.actionText, { color: branding.textColor + '60' }]}>Helpful</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.reviewAction}>
                                                <MaterialIcons name="reply" size={16} color={branding.textColor + '60'} />
                                                <Text style={[styles.actionText, { color: branding.textColor + '60' }]}>Reply</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View> */}

            {/* Load More Reviews Button */}
            {/* {reviews.length > 5 && (
                            <TouchableOpacity style={styles.loadMoreButton}>
                                <Text style={[styles.loadMoreText, { color: branding.primaryColor }]}>
                                    Load More Reviews
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={20} color={branding.primaryColor} />
                            </TouchableOpacity>
                        )} */}
          </View>
        </View>
        {/* Reviews Section */}
        <View ref={reviewsRef} style={styles.reviewsSection}>
          {/* ... reviews content ... */}
        </View>
      </ScrollView>

      {/* Fixed bottom action buttons */}
      <View
        style={[
          styles.bottomActions,
          { backgroundColor: branding.secondaryColor }
        ]}
      >
        {/* Chat Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: branding.primaryColor }
          ]}
          onPress={handleChat}
        >
          <Ionicons name='chatbubble-ellipses' size={24} color='#fff' />
          <Text style={styles.buttonText}>Chat</Text>
        </TouchableOpacity>

        {/* Call Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: branding.primaryColor }
          ]}
          onPress={handleCall}
        >
          <Ionicons name='call' size={24} color='#fff' />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>

        {/* Sticky Add to Cart Bar */}
        {/* <View style={styles.stickyBar}>
                    <View style={styles.qtySelector}>
                        <TouchableOpacity 
                            style={[
                                styles.qtyBtn, 
                                (!isInStock || quantity <= 1) && styles.qtyBtnDisabled
                            ]} 
                            onPress={handleDecreaseQty} 
                            disabled={!isInStock || quantity <= 1}
                        >
                            <Text style={[
                                styles.qtyBtnText,
                                (!isInStock || quantity <= 1) && styles.qtyBtnTextDisabled
                            ]}>-</Text>
                        </TouchableOpacity>
                        <Text style={[
                            styles.qtyValue,
                            !isInStock && styles.qtyValueDisabled
                        ]}>
                            {!isInStock ? 'Out of Stock' : quantity}
                        </Text>
                        <TouchableOpacity 
                            style={[
                                styles.qtyBtn,
                                (!isInStock || quantity >= maxQuantity) && styles.qtyBtnDisabled
                            ]} 
                            onPress={handleIncreaseQty} 
                            disabled={!isInStock || quantity >= maxQuantity}
                        >
                            <Text style={[
                                styles.qtyBtnText,
                                (!isInStock || quantity >= maxQuantity) && styles.qtyBtnTextDisabled
                            ]}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: branding.primaryColor }, (loading || product?.stock <= 0) && { opacity: 0.7 }]}
                        onPress={() => handleAddToCart(quantity)}
                        disabled={loading || product?.stock <= 0}
                    >
                        <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
                        <Text style={styles.buttonText}>
                            {loading ? "Adding..." : product?.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                        </Text>
                    </TouchableOpacity>
                </View> */}
      </View>

      {/* Preview Modal */}
      {/* Removed as per edit hint */}
      {/* Full View Modal */}
      <Modal
        visible={fullViewVisible}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setFullViewVisible(false)}
      >
        <View style={styles.fullViewOverlay}>
          {/* Image Counter */}
          <View style={styles.fullViewCounter}>
            <Text style={styles.fullViewCounterText}>
              {fullViewIndex + 1} / {finalImages.length}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.fullViewClose}
            onPress={() => setFullViewVisible(false)}
          >
            <MaterialIcons name='close' size={32} color='#fff' />
          </TouchableOpacity>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: fullViewIndex * width, y: 0 }}
            style={styles.fullViewScroll}
            onMomentumScrollEnd={handleFullViewScroll}
          >
            {finalImages.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={styles.fullViewImage}
                resizeMode='contain'
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default ProductDetail
