/* eslint-disable react/display-name */
import React, {
  useRef,
  useContext,
  useLayoutEffect,
  useState,
  useEffect
} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator
} from 'react-native';
import styles from './styles'
import { Ionicons, Feather } from '@expo/vector-icons';
import Products from '../../components/Products/Products';
import { useNavigation } from '@react-navigation/native';
import BottomTab from '../../components/BottomTab/BottomTab';
import Search from '../../components/Main/Search/Search';
import { scale } from '../../utils/scaling';
import { Placeholder, Fade, PlaceholderLine } from 'rn-placeholder';
import { API_URL } from '../../config/api'
import { useAppBranding } from "../../utils/translationHelper";

const SubCategory = ({ route }) => {
  const { category } = route.params;
  const menucategoryId = category._id;
  const branding = useAppBranding();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const moduleId = 1;
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const newheaderColor = branding.headerColor;

  // Fetch products based on category
  useEffect(() => {
    if (!isSearching) {
      resetPagination();
      fetchProducts(1, false);
    }
  }, [isSearching]);

  // Search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() !== '') {
        resetPagination();
        fetchSearchResults(search);
      } else {
        setIsSearching(false);
        resetPagination();
        fetchProducts(1, false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      console.log('Fetching products for category:', menucategoryId, 'page:', page);
      
      const response = await fetch(
        `${API_URL}/product/categories/items/${menucategoryId}?limit=10&offset=${page}&type=all`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            zoneId: '[1]',
            moduleId: moduleId
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      console.log('API Response:', json);

      if (json?.success && Array.isArray(json?.products)) {
        if (isLoadMore) {
          // Append new products to existing ones
          setProducts(prevProducts => [...prevProducts, ...json.products]);
        } else {
          // Replace products for new category/tab selection
          setProducts(json.products);
        }
        
        // Update pagination state
        setTotalProducts(json.total || 0);
        setCurrentPage(page);
        setHasMore(json.products.length === 10 && (page * 10) < (json.total || 0));
      } else {
        console.log('No products found or invalid response format');
        if (!isLoadMore) {
          setProducts([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error fetching products');
      if (!isLoadMore) {
        setProducts([]);
      }
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchSearchResults = async (text) => {
    if (text.trim() === "") {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const url = `${API_URL}/search/products?keyword=${encodeURIComponent(text)}&category_id=${menucategoryId}&sortBy=name&sortOrder=asc&page=1&limit=10`;
      console.log('Search URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'zoneId': '[1]',
          'moduleId': moduleId.toString()
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      console.log('Search Response:', json);
      
      if (json?.success && Array.isArray(json?.products)) {
        setProducts(json.products);
        setError(null);
      } else {
        setProducts([]);
        setError('No products found');
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError(error.message || 'Failed to fetch search results');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (!loadingMore && hasMore && !isSearching) {
      const nextPage = currentPage + 1;
      await fetchProducts(nextPage, true);
    }
  };

  const resetPagination = () => {
    setCurrentPage(1);
    setHasMore(true);
    setTotalProducts(0);
    setLoadingMore(false);
  };

  const handleSearchChange = (text) => {
    setSearch(text);
  };

  const renderProductItem = ({ item }) => (
    <View style={{ 
      width: '48%',
      marginBottom: 10
    }}>
      <Products
        item={item}
        horizontal={false}
      />
    </View>
  );

  const renderLoadingComponent = () => (
    <View style={{ 
      flexDirection: 'row',
      paddingHorizontal: scale(12)
    }}>
      {[...Array(3)].map((_, index) => (
        <View
          key={index}
          style={{
            marginRight: scale(10),
            backgroundColor: branding.secondaryColor,
            borderRadius: 8,
            width: '100%',
            height: scale(120),
            overflow: 'hidden'
          }}>
          <Placeholder
            Animation={props => (
              <Fade
                {...props}
                style={{ backgroundColor: branding.secondaryColor }}
                duration={500}
                iterationCount={1}
              />
            )}>
            <PlaceholderLine 
              style={{ 
                height: '60%', 
                marginBottom: 0,
                opacity: 0.7
              }} 
            />
            <View style={{ padding: 8 }}>
              <PlaceholderLine 
                width={80} 
                style={{ opacity: 0.5 }}
              />
              <PlaceholderLine 
                width={50} 
                style={{ opacity: 0.3 }}
              />
            </View>
          </Placeholder>
        </View>
      ))}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={{
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ActivityIndicator 
          size="small" 
          color={branding.primaryColor} 
        />
        <Text style={{
          marginTop: 10,
          color: branding.textColor,
          fontSize: 14
        }}>
          Loading more products...
        </Text>
      </View>
    );
  };

  return (
    <>
      <SafeAreaView
        edges={['left', 'right']}
        style={[styles(branding).flex, { backgroundColor: branding.backgroundColor }]}>
        <View style={[styles(branding).flex, { backgroundColor: branding.backgroundColor }]}>
          <View style={styles(branding).flex}>
            <View style={[styles(branding).mainContentContainer, { backgroundColor: branding.backgroundColor }]}>

              {/* Search Bar Section */}
              <View style={[styles(branding).searchbar, { backgroundColor: branding.primaryColor }]}>
                <Search
                  setSearch={handleSearchChange}
                  search={search}
                  newheaderColor={newheaderColor}
                  placeHolder="Search Items"
                />
              </View>

              {/* Loading State */}
              {loading && (
                <View style={[styles(branding).loadingContainer, {
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center'
                }]}>
                  {renderLoadingComponent()}
                </View>
              )}

              {/* Error State */}
              {error && (
                <View style={styles(branding).errorContainer}>
                  <Text style={[styles(branding).errorText, { color: '#FF3B30' }]}>{error}</Text>
                </View>
              )}

              {/* Content Rendering */}
              {!loading && !error && (
                <FlatList
                  key={`products-grid`}
                  data={products}
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
                  renderItem={renderProductItem}
                  keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                  onEndReached={loadMoreProducts}
                  onEndReachedThreshold={0.1}
                  ListFooterComponent={renderFooter}
                  ListEmptyComponent={
                    <View style={{ 
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 20,
                      minHeight: 200
                    }}>
                      <Text style={{
                        fontSize: 16,
                        color: branding.textColor,
                        textAlign: 'center'
                      }}>No products found</Text>
                    </View>
                  }
                />
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
      <BottomTab screen="HOME" />
    </>
  );
};

export default SubCategory;