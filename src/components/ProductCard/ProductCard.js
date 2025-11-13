// components/ProductCard.js
import React, { useContext, useState, useEffect, useRef } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import AddToFavourites from '../Favourites/AddtoFavourites'
import { LocationContext } from '../../context/Location'
import AuthContext from '../../context/Auth'
import { useNavigation } from '@react-navigation/native'
import UserContext from '../../context/User'
import { useAppBranding } from '../../utils/translationHelper'

// Assuming styles are defined here
export const ProductCard = ({ item }) => {
  const {
    isLoggedIn,
    addToCart,
    getProductCartInfo,
    updateCartQuantity,
    removeFromCart
  } = useContext(UserContext)
  const { location } = useContext(LocationContext)
  const { token } = useContext(AuthContext)
  const navigation = useNavigation()
  const [isLoading, setIsLoading] = useState(false)
  const [cartInfo, setCartInfo] = useState({
    isInCart: false,
    quantity: 0,
    cartItemId: null
  })
  const branding = useAppBranding()
  const commitTimeoutRef = useRef(null)
  const pendingQuantityRef = useRef(0)

  // Update cart info when item or cart changes
  useEffect(() => {
    if (item?._id && getProductCartInfo) {
      const info = getProductCartInfo(item._id)
      setCartInfo(info)
    }
  }, [item?._id, getProductCartInfo])

  useEffect(() => {
    pendingQuantityRef.current = cartInfo.quantity
  }, [cartInfo.quantity])

  useEffect(
    () => () => {
      if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current)
    },
    []
  )

  const scheduleQuantityCommit = (cartItemId, desiredQuantity) => {
    pendingQuantityRef.current = desiredQuantity
    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current)
    commitTimeoutRef.current = setTimeout(async () => {
      try {
        if (desiredQuantity <= 0) {
          const res = await removeFromCart(cartItemId)
          if (!res.success) {
            // Revert optimistic update on error
            const currentInfo = getProductCartInfo(item._id)
            setCartInfo(currentInfo)
            Alert.alert('Error', res.message || 'Failed to update cart')
          }
        } else {
          const res = await updateCartQuantity(cartItemId, desiredQuantity)
          if (!res.success) {
            // Revert optimistic update on error
            const currentInfo = getProductCartInfo(item._id)
            setCartInfo(currentInfo)
            Alert.alert('Error', res.message || 'Failed to update cart')
          }
        }
      } catch (e) {
        console.error('Commit quantity error:', e)
        // Revert optimistic update on error
        const currentInfo = getProductCartInfo(item._id)
        setCartInfo(currentInfo)
        Alert.alert('Error', 'An error occurred while updating quantity.')
      }
    }, 100) // Reduced from 250ms to 100ms for faster response
  }

  // Function to limit the product name to allow 2 lines
  const getShortenedName = (name) => {
    if (name.length > 35) {
      return name.slice(0, 35) + '...'
    }
    return name
  }

  // Function to format unit information
  const getUnitDisplay = () => {
    const { weight, unit, quantity, unitCount } = item || {}

    // If unitCount is provided, use it with unit
    if (unitCount && unit) {
      return `${unitCount} ${unit}`
    }

    // If quantity is provided, use it with "Pcs"
    if (quantity) {
      return `${quantity} Pcs`
    }

    // If weight is provided, use it
    if (weight) {
      return weight
    }

    // If only unit is provided, use it
    if (unit) {
      return unit
    }

    return null
  }

  // Function to get unit count specifically for display
  const getUnitCountDisplay = () => {
    const { unitCount, unit } = item || {}
    if (unitCount && unit) {
      return `${unitCount} ${unit}`
    }
    return null
  }

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigation.navigate('Login')
      return
    }

    // Optimistic UI update - show as in cart immediately
    setCartInfo({
      isInCart: true,
      quantity: 1,
      cartItemId: 'temp_' + Date.now()
    })
    setIsLoading(true)

    try {
      const result = await addToCart(item)
      if (result.success) {
        // Update with real cart info after successful API call
        const updatedInfo = getProductCartInfo(item._id)
        setCartInfo(updatedInfo)
      } else {
        // Revert optimistic update on error
        setCartInfo({ isInCart: false, quantity: 0, cartItemId: null })
        Alert.alert('Error', result.message)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      // Revert optimistic update on error
      setCartInfo({ isInCart: false, quantity: 0, cartItemId: null })
      Alert.alert('Error', 'An error occurred while adding to cart.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = async (change) => {
    if (!cartInfo.cartItemId) return
    const currentId = cartInfo.cartItemId
    const newQuantity = cartInfo.quantity + change

    // Check if product is in stock
    const isInStock = item?.stock > 0
    const maxQuantity = item?.stock || 0

    // Immediate UI update for instant feedback
    if (newQuantity <= 0) {
      setCartInfo({ isInCart: false, quantity: 0, cartItemId: null })
      scheduleQuantityCommit(currentId, 0)
      return
    }

    // Check stock limits
    if (!isInStock) {
      Alert.alert('Out of Stock', 'This item is currently not available.')
      return
    }

    if (newQuantity > maxQuantity) {
      Alert.alert('Limit Reached', `Maximum quantity allowed is ${maxQuantity}`)
      return
    }

    // Immediate UI update for instant feedback
    setCartInfo((prev) => ({ ...prev, quantity: newQuantity }))
    scheduleQuantityCommit(currentId, newQuantity)
  }

  return (
    <View style={styles.container}>
      <View style={styles.itemWrapper}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ProductDetail', { product: item })
          }
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.itemContainer,
              { backgroundColor: branding.backgroundColor }
            ]}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.image_full_url }}
                style={styles.cardImageBG}
                resizeMode='cover'
              />
              <View style={styles.favoritePosition}>
                <AddToFavourites product={item} />
              </View>
            </View>
            <Text
              style={[styles.cardTitle, { color: branding.textColor }]}
              numberOfLines={2}
            >
              {getShortenedName(item.name)}
            </Text>

            {/* Shop/Seller Information */}
            {item.shop && (
              <View style={styles.sellerContainer}>
                <Image
                  source={{
                    uri:
                      item.shop.avatar ||
                      item.shop.logo ||
                      item.shop.image ||
                      ''
                  }}
                  style={styles.sellerAvatar}
                  defaultSource={require('../../assets/images/placeholder.png')}
                />
                <View style={styles.sellerInfo}>
                  <Text
                    style={[styles.sellerName, { color: branding.textColor }]}
                    numberOfLines={1}
                  >
                    {item.shop.name}
                  </Text>
                  {item.shop.address && (
                    <Text
                      style={[
                        styles.sellerAddress,
                        { color: branding.textColor, opacity: 0.7 }
                      ]}
                      numberOfLines={1}
                    >
                      {item.shop.address}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Weight/Unit Information */}
            {getUnitDisplay() && (
              <View
                style={[
                  styles.unitContainer,
                  { backgroundColor: branding.secondaryColor }
                ]}
              >
                <Icon name='scale' size={12} color='#666' />
                <Text style={styles.unitText}>{getUnitDisplay()}</Text>
              </View>
            )}

            {/* Unit Count Display (if available) */}
            {getUnitCountDisplay() && (
              <View
                style={[
                  styles.unitCountContainer,
                  { backgroundColor: branding.primaryColor }
                ]}
              >
                <Icon name='straighten' size={10} color='#FFFFFF' />
                <Text style={styles.unitCountText}>
                  {getUnitCountDisplay()}
                </Text>
              </View>
            )}

            <View style={styles.cardFooterRow}>
              <View style={styles.priceContainer}>
                <Text
                  style={[
                    styles.cardPriceCurrency,
                    { color: branding.textColor }
                  ]}
                >
                  ₹
                </Text>
                <Text style={[styles.cardPrice, { color: branding.textColor }]}>
                  {item.price}
                </Text>
              </View>

              {/* Smart Cart Controls */}
              {cartInfo.isInCart ? (
                // Quantity Controls
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(-1)}
                    style={[
                      styles.quantityButton,
                      { backgroundColor: branding.buttonColor },
                      (cartInfo.quantity <= 1 || item?.stock <= 0) && {
                        opacity: 0.5
                      }
                    ]}
                    disabled={cartInfo.quantity <= 1 || item?.stock <= 0}
                  >
                    <Icon name='remove' size={16} color={branding.textColor} />
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.quantityText,
                      { color: branding.textColor },
                      item?.stock <= 0 && { color: '#999', fontStyle: 'italic' }
                    ]}
                  >
                    {item?.stock <= 0 ? 'Out of Stock' : cartInfo.quantity}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleQuantityChange(1)}
                    style={[
                      styles.quantityButton,
                      { backgroundColor: branding.buttonColor },
                      (item?.stock <= 0 ||
                        cartInfo.quantity >= (item?.stock || 0)) && {
                        opacity: 0.5
                      }
                    ]}
                    disabled={
                      item?.stock <= 0 ||
                      cartInfo.quantity >= (item?.stock || 0)
                    }
                  >
                    <Icon name='add' size={16} color={branding.textColor} />
                  </TouchableOpacity>
                </View>
              ) : (
                // Add to Cart Button
                <TouchableOpacity
                  onPress={handleAddToCart}
                  style={[
                    styles.addButton,
                    { backgroundColor: branding.buttonColor }
                  ]}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      size='small'
                      color={branding.textColor}
                    />
                  ) : (
                    <Icon name='add' size={20} color={branding.textColor} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Define the styles here
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 10
  },
  itemWrapper: {
    flex: 1,
    marginBottom: 10
  },
  itemContainer: {
    padding: 12,
    borderRadius: 12,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 11
    },
    elevation: 24,
    marginBottom: 10,
    width: 180
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 10
  },
  cardImageBG: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden'
  },
  favoritePosition: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    marginBottom: 5,
    overflow: 'hidden',
    lineHeight: 20,
    minHeight: 40 // Space for 2 lines
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8
  },
  sellerInfo: {
    flex: 1
  },
  sellerName: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2
  },
  sellerAddress: {
    fontSize: 9
  },
  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'center'
  },
  unitText: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4
  },
  unitCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  unitCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardPriceCurrency: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 2
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700'
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 15,
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  quantityButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center'
  }
})
