import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AuthContext from '../../context/Auth';
import UserContext from '../../context/User';
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import { useAppBranding } from '../../utils/translationHelper';
import { API_URL } from '../../config/api';
import styles from './styles';

const MyAds = () => {
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userShop, setUserShop] = useState(null);
  
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const { profile, isLoggedIn } = useContext(UserContext);
  const branding = useAppBranding();

  // Fetch user's shop and ads when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (token && profile) {
        fetchUserShop();
      } else {
        setLoading(false);
      }
    }, [token, profile])
  );

  const fetchUserShop = async () => {
    try {
      // First, get user's shop information
      // Assuming user's email or phone is linked to shop
      const shopResponse = await fetch(
        `${API_URL}/shop/get-shop-info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (shopResponse.ok) {
        const shopData = await shopResponse.json();
        if (shopData.shop) {
          setUserShop(shopData.shop);
          fetchMyAds(shopData.shop._id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user shop:', error);
      setLoading(false);
    }
  };

  const fetchMyAds = async (shopId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/product/get-all-products-shop/${shopId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setMyAds(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching my ads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (userShop) {
      fetchMyAds(userShop._id);
    } else {
      fetchUserShop();
    }
  };

  const handleAdPress = (ad) => {
    navigation.navigate('ProductDetail', {
      id: ad._id,
      product: ad,
    });
  };

  const handleEditAd = (ad) => {
    // Navigate to edit product screen (you'll need to create this)
    Alert.alert('Edit Ad', `Edit functionality for ${ad.name} coming soon!`);
  };

  const handleDeleteAd = (ad) => {
    Alert.alert(
      'Delete Ad',
      `Are you sure you want to delete "${ad.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAd(ad._id),
        },
      ]
    );
  };

  const deleteAd = async (productId) => {
    try {
      const response = await fetch(
        `${API_URL}/product/delete-shop-product/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Ad deleted successfully');
        // Refresh the list
        if (userShop) {
          fetchMyAds(userShop._id);
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to delete ad');
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
      Alert.alert('Error', 'Failed to delete ad');
    }
  };

  const formatPrice = (price) => {
    return `₹${price?.toLocaleString() || 0}`;
  };

  const renderAdItem = ({ item }) => {
    const hasDiscount = item.originalPrice && item.originalPrice > item.discountPrice;
    const imageUrl = item.images && item.images.length > 0 
      ? item.images[0] 
      : null;

    return (
      <TouchableOpacity
        style={[
          styles.adCard,
          { backgroundColor: branding.backgroundColor || '#fff' }
        ]}
        onPress={() => handleAdPress(item)}
      >
        <View style={styles.adImageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.adImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.adImagePlaceholder, { backgroundColor: '#f0f0f0' }]}>
              <MaterialIcons name="image" size={50} color="#ccc" />
            </View>
          )}
          {item.stock <= 0 && (
            <View style={styles.outOfStockBadge}>
              <TextDefault style={styles.outOfStockText}>Out of Stock</TextDefault>
            </View>
          )}
        </View>

        <View style={styles.adContent}>
          <TextDefault H5 bold numberOfLines={2} style={styles.adTitle}>
            {item.name}
          </TextDefault>
          
          <View style={styles.priceContainer}>
            <TextDefault H4 bold style={{ color: branding.primaryColor }}>
              {formatPrice(item.discountPrice)}
            </TextDefault>
            {hasDiscount && (
              <TextDefault 
                style={styles.originalPrice}
                numberOfLines={1}
              >
                {formatPrice(item.originalPrice)}
              </TextDefault>
            )}
          </View>

          <View style={styles.adInfo}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons 
                name="package-variant" 
                size={16} 
                color="#666" 
              />
              <TextDefault style={styles.infoText}>
                Stock: {item.stock} {item.unit}
              </TextDefault>
            </View>
            
            {item.category?.name && (
              <View style={styles.infoRow}>
                <MaterialIcons name="category" size={16} color="#666" />
                <TextDefault style={styles.infoText} numberOfLines={1}>
                  {item.category.name}
                </TextDefault>
              </View>
            )}
          </View>

          <View style={styles.adActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: branding.primaryColor }
              ]}
              onPress={() => handleEditAd(item)}
            >
              <MaterialIcons name="edit" size={18} color="#fff" />
              <TextDefault bold style={styles.actionButtonText}>
                Edit
              </TextDefault>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteAd(item)}
            >
              <MaterialIcons name="delete" size={18} color="#fff" />
              <TextDefault bold style={styles.actionButtonText}>
                Delete
              </TextDefault>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isLoggedIn || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={branding.headerColor} 
        />
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name="shopping-bag" 
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
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={branding.headerColor} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={branding.primaryColor} 
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={styles.container}
      edges={['bottom', 'left', 'right']}
    >
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={branding.headerColor} 
      />
      
      {myAds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name="add-shopping-cart" 
            size={80} 
            color={branding.iconColor || '#ccc'} 
          />
          <TextDefault H4 bold style={styles.emptyText}>
            You haven't posted any ads yet
          </TextDefault>
          <TextDefault style={styles.emptySubtext}>
            Start selling by creating your first ad!
          </TextDefault>
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: branding.primaryColor }
            ]}
            onPress={() => navigation.navigate('Sell')}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <TextDefault bold style={{ color: '#fff', marginLeft: 8 }}>
              Create Ad
            </TextDefault>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TextDefault H4 bold>
              My Ads ({myAds.length})
            </TextDefault>
            <TouchableOpacity
              style={[
                styles.createButtonSmall,
                { backgroundColor: branding.primaryColor }
              ]}
              onPress={() => navigation.navigate('Sell')}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={myAds}
            renderItem={renderAdItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[branding.primaryColor]}
              />
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default MyAds;