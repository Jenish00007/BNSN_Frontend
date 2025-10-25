import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AddToFavourites from '../Favourites/AddtoFavourites';
import UserContext from '../../context/User';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppBranding } from '../../utils/translationHelper';

const OfferCard = ({item}) => {
    const navigation = useNavigation();
    const { 
        addToCart, 
        isLoggedIn, 
        getProductCartInfo, 
        updateCartQuantity, 
        removeFromCart,
        cartItems
    } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const [cartInfo, setCartInfo] = useState({ isInCart: false, quantity: 0, cartItemId: null });
    const commitTimeoutRef = useRef(null);
    const pendingQuantityRef = useRef(0);
    const branding = useAppBranding();

    // Update cart info when item or cart changes
    useEffect(() => {
        if (item?._id && getProductCartInfo) {
            const info = getProductCartInfo(item._id);
            setCartInfo(info);
        }
    }, [item?._id, getProductCartInfo, cartItems]);
    
    useEffect(() => {
        pendingQuantityRef.current = cartInfo.quantity;
    }, [cartInfo.quantity]);

    useEffect(() => () => {
        if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
    }, []);

    const scheduleQuantityCommit = (cartItemId, desiredQuantity) => {
        pendingQuantityRef.current = desiredQuantity;
        if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
        commitTimeoutRef.current = setTimeout(async () => {
            try {
                if (desiredQuantity <= 0) {
                    const res = await removeFromCart(cartItemId);
                    if (!res.success) {
                        // Revert optimistic update on error
                        const currentInfo = getProductCartInfo(item._id);
                        setCartInfo(currentInfo);
                        Alert.alert('Error', res.message || 'Failed to update cart');
                    }
                } else {
                    const res = await updateCartQuantity(cartItemId, desiredQuantity);
                    if (!res.success) {
                        // Revert optimistic update on error
                        const currentInfo = getProductCartInfo(item._id);
                        setCartInfo(currentInfo);
                        Alert.alert('Error', res.message || 'Failed to update cart');
                    }
                }
            } catch (e) {
                console.error('Commit quantity error:', e);
                // Revert optimistic update on error
                const currentInfo = getProductCartInfo(item._id);
                setCartInfo(currentInfo);
                Alert.alert('Error', 'An error occurred while updating quantity.');
            }
        }, 100); // Reduced from 250ms to 100ms for faster response
    };
    const {
        name,
        active,
        address,
        distance,   
        image,
        discountPrice
    } = item;

    const handleAddToCart = async () => {
        // If already in cart, do nothing
        if (cartInfo?.isInCart) return;
        if (!isLoggedIn) {
          navigation.navigate('Login');
          return;
        }
    
        if (item?.stock <= 0) {
          Alert.alert(
            'Out of Stock',
            'This item is currently not available.',
            [{ text: 'OK', style: 'cancel' }],
            { cancelable: true }
          );
          return;
        }
    
        // Optimistic UI update - show as in cart immediately
        setCartInfo({ isInCart: true, quantity: 1, cartItemId: 'temp_' + Date.now() });
        setIsLoading(true);
        
        try {
          const result = await addToCart(item);
          if (result.success) {
            // Update with real cart info after successful API call
            const updatedInfo = getProductCartInfo(item._id);
            setCartInfo(updatedInfo);
          } else {
            // Revert optimistic update on error
            setCartInfo({ isInCart: false, quantity: 0, cartItemId: null });
            Alert.alert("Error", result.message);
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          // Revert optimistic update on error
          setCartInfo({ isInCart: false, quantity: 0, cartItemId: null });
          Alert.alert("Error", "An error occurred while adding to cart.");
        } finally {
          setIsLoading(false);
        }
    };

    const handleQuantityChange = async (change) => {
        if (!cartInfo.cartItemId) return;
        const currentId = cartInfo.cartItemId;
        const newQuantity = cartInfo.quantity + change;

        // Check if product is in stock
        const isInStock = item?.stock > 0;
        const maxQuantity = item?.stock || 0;

        // Immediate UI update for instant feedback
        if (newQuantity <= 0) {
            setCartInfo({ isInCart: false, quantity: 0, cartItemId: null });
            scheduleQuantityCommit(currentId, 0);
            return;
        }

        // Check stock limits
        if (!isInStock) {
            Alert.alert('Out of Stock', 'This item is currently not available.');
            return;
        }

        if (newQuantity > maxQuantity) {
            Alert.alert('Limit Reached', `Maximum quantity allowed is ${maxQuantity}`);
            return;
        }

        // Immediate UI update for instant feedback
        setCartInfo(prev => ({ ...prev, quantity: newQuantity }));
        scheduleQuantityCommit(currentId, newQuantity);
    };

    const truncatedName = name?.length > 35 ? `${name.substring(0, 35)}...` : name;
    const truncatedAddress = address?.length > 30 ? `${address.substring(0, 30)}...` : address;

    // Function to format unit information
    const getUnitDisplay = () => {
        const { weight, unit, quantity, unitCount } = item || {};
        
        // If unitCount is provided, use it with unit
        if (unitCount && unit) {
            return `${unitCount} ${unit}`;
        }
        
        // If quantity is provided, use it with "Pcs"
        if (quantity) {
            return `${quantity} Pcs`;
        }
        
        // If weight is provided, use it
        if (weight) {
            return weight;
        }
        
        // If only unit is provided, use it
        if (unit) {
            return unit;
        }
        
        return null;
    };

    // Function to get unit count specifically for display
    const getUnitCountDisplay = () => {
        const { unitCount, unit } = item || {};
        if (unitCount && unit) {
            return `${unitCount} ${unit}`;
        }
        return null;
    };

    return (
        <TouchableOpacity 
            style={[styles.container, { backgroundColor: branding.backgroundColor }]}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}> 
                {(() => {
                    const firstImage = item?.images?.[0];
                    const imageUri = item?.image || (typeof firstImage === 'string' ? firstImage : firstImage?.url);
                    if (!imageUri) return null;
                    return (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    );
                })()}
                <View style={styles.favoriteButton}>
                    <AddToFavourites product={item}/>
                </View>
                {item?.discount > 0 && (
                    <View style={[styles.discountBadge, { backgroundColor: branding.primaryColor }]}>
                        <Text style={styles.discountText}>{item.discount}% OFF</Text>
                    </View>
                )}
            </View>

            <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: branding.textColor }]} numberOfLines={2}>{truncatedName}</Text>
                <Text style={[styles.address, { color: branding.textColor }]}>{truncatedAddress}</Text>
                
                {/* Unit Count Display */}
                {/* {getUnitCountDisplay() && (
                    <View style={styles.unitCountContainer}>
                        <Icon name="straighten" size={10} color="#FFFFFF" />
                        <Text style={styles.unitCountText}>
                            {getUnitCountDisplay()}
                        </Text>
                    </View>
                )} */}
                
                <View style={styles.footer}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.price, { color: branding.textColor }]}>₹{discountPrice}</Text>
                        {item?.originalPrice && (
                            <Text style={[styles.originalPrice, { color: branding.textColor }]}>₹{item.originalPrice}</Text>
                        )}
                    </View>
                    {/* Location with Address - Replace lines 245-292 */}
<View style={styles.locationAddressContainer}>
  <Icon name="location-on" size={16} color={branding.primaryColor} />
  <Text style={styles.addressText} numberOfLines={1}>
    {item?.shop?.address || item?.address || address || 'Location not available'}
  </Text>
</View>
                    {/* {cartInfo.isInCart ? (
                        // Quantity Controls
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity 
                                onPress={() => handleQuantityChange(-1)}
                                style={[
                                    styles.quantityButton, 
                                    { backgroundColor: branding.buttonColor },
                                    (cartInfo.quantity <= 1 || item?.stock <= 0) && { opacity: 0.5 }
                                ]}
                                disabled={cartInfo.quantity <= 1 || item?.stock <= 0}
                            >
                                <Icon name="remove" size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                            
                            <Text style={[
                                styles.quantityText,
                                item?.stock <= 0 && { color: '#999', fontStyle: 'italic' }
                            ]}>
                                {item?.stock <= 0 ? 'Out of Stock' : cartInfo.quantity}
                            </Text>
                            
                            <TouchableOpacity 
                                onPress={() => handleQuantityChange(1)}
                                style={[
                                    styles.quantityButton, 
                                    { backgroundColor: branding.buttonColor },
                                    (item?.stock <= 0 || cartInfo.quantity >= (item?.stock || 0)) && { opacity: 0.5 }
                                ]}
                                disabled={item?.stock <= 0 || cartInfo.quantity >= (item?.stock || 0)}
                            >
                                <Icon name="add" size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Add to Cart Button
                        <TouchableOpacity 
                            style={[styles.addButton, { backgroundColor: branding.buttonColor }]}
                            onPress={handleAddToCart}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Icon name="add" size={24} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    )} */}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        width: 200,
        marginLeft: 12,
        marginRight: 12,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 120,
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 16,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    discountBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        borderRadius: 8,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    discountText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    contentContainer: {
        padding: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        paddingHorizontal: 2,
        lineHeight: 18,
        minHeight: 36, // Space for 2 lines
    },
    address: {
        fontSize: 12,
        marginBottom: 6,
        paddingHorizontal: 2,
    },
    unitCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
        backgroundColor: '#F16122',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    unitCountText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 2,
        paddingTop: 4,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
    },
    originalPrice: {
        fontSize: 12,
        textDecorationLine: 'line-through',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#F16122',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    quantityText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: 8,
        minWidth: 20,
        textAlign: 'center',
        color: '#FFFFFF',
    },
    locationAddressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
        paddingLeft: 4,
      },
      addressText: {
        fontSize: 11,
        color: '#666666',
        fontWeight: '500',
        flex: 1,
      },
});

export default OfferCard;