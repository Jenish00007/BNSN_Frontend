import React, { useState, useEffect, useContext } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationContext } from '../../context/Location';
import AuthContext from '../../context/Auth';
import UserContext from '../../context/User';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../../config/api'
import { useAppBranding } from '../../utils/translationHelper';

const AddToFavourites = ({ product, restaurantId }) => {
    const [isFavourite, setIsFavourite] = useState(false);
    const [loading, setLoading] = useState(false);
    const { location } = useContext(LocationContext);
    const { token } = useContext(AuthContext);
    const { isLoggedIn } = useContext(UserContext);
    const navigation = useNavigation();
    const branding = useAppBranding();

    useEffect(() => {
        if (token && product?._id) {
            checkFavouriteStatus();
        }
    }, [token, product?._id, restaurantId]);

    const checkFavouriteStatus = async () => {
        if (!token || !product?._id) return;
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };
            
            const response = await fetch(`${API_URL}/favorites/all`, {
                method: 'GET',
                headers: headers,
            });

            if (response.ok) {
                const result = await response.json();
                const favorites = result.favorites || [];
                const isInWishlist = favorites.some(item => 
                    item.product?._id === product._id
                );
                setIsFavourite(isInWishlist);
            }
        } catch (error) {
            console.error("Error checking favourite status:", error);
        }
    };

    const toggleFavourites = async () => {
        if (loading || !product?._id) return;
        
        if (!isLoggedIn) {
            navigation.navigate('Login');
            return;
        }
        
        setLoading(true);
        try {
            const productId = product._id;
            if (!productId) {
                throw new Error('Invalid product ID');
            }

            const endpoint = isFavourite
                ? `${API_URL}/favorites/remove/${productId}`
                : `${API_URL}/favorites/add`;
            
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            const response = await fetch(endpoint, {
                method: isFavourite ? 'DELETE' : 'POST',
                headers: headers,
                body: isFavourite ? undefined : JSON.stringify({
                    productId: productId
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update favorites');
            }
            
            if (result.success) {
                setIsFavourite(!isFavourite);
                Alert.alert(
                    isFavourite ? "Removed" : "Success",
                    isFavourite ? "Removed from Favourites." : "Added to Favourites."
                );
            } else {
                throw new Error(result.message || 'Failed to update favorites');
            }
        } catch (error) {
            console.error("Error toggling favourites:", error);
            Alert.alert(
                "Error", 
                error.message === 'Product not found' 
                    ? 'This product is no longer available' 
                    : error.message || "Failed to update Favourites."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!product?._id) {
        return null;
    }

    return (
        <TouchableOpacity onPress={toggleFavourites} disabled={loading}>
            {loading ? (
                <ActivityIndicator size="small" color={branding.primaryColor} />
            ) : (
                <Ionicons
                    name={isFavourite ? 'heart' : 'heart-outline'}
                    size={28}
                    color={isFavourite ? branding.primaryColor : 'gray'}
                />
            )}
        </TouchableOpacity>
    );
};

export default AddToFavourites;