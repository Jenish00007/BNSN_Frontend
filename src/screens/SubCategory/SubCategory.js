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
  const [activeTab, setActiveTab] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subcat, setSubcat] = useState([]);
  const [subcatId, setSubcatId] = useState(null);
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

  // Fetch subcategories
  useEffect(() => {
    const fetchSubcat = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/categories/${menucategoryId}`,
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
        if (json.success && json.data && json.data.subcategories) {
          setSubcat(json.data.subcategories);
        } else {
          console.log('No subcategories found');
          setSubcat([]);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setError('Error fetching subcategories');
      } finally {
        setLoading(false);
      }
    };

    fetchSubcat();
  }, [moduleId, menucategoryId]);

  // Fetch products based on subcategory or default category
  useEffect(() => {
    if (!isSearching) {
      resetPagination();
      fetchProducts(1, false);
    }
  }, [subcatId, isSearching]);

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
      const categoryId = subcatId || menucategoryId;
      console.log('Fetching products for category:', categoryId, 'page:', page);
      
      const response = await fetch(
        `${API_URL}/product/categories/items/${categoryId}?limit=10&offset=${page}&type=all`,
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
    const categoryId = subcatId || menucategoryId;

    try {
      const url = `${API_URL}/search/products?keyword=${encodeURIComponent(text)}&category_id=${categoryId}&sortBy=name&sortOrder=asc&page=1&limit=10`;
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

  const getSubcategoryNames = () => {
    const tabs = ['All'];
    if (subcat && subcat.length > 0) {
      subcat.forEach((subcategory) => {
        if (subcategory.name && subcategory.isActive) {
          tabs.push(subcategory.name);
        }
      });
    }
    return tabs;
  };

  const tabs = getSubcategoryNames();

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

  const handleTabPress = (tab) => {
    if (tab === 'All') {
      setSubcatId(null);
    } else {
      const subcategory = subcat.find((item) => item.name === tab);
      if (subcategory) {
        setSubcatId(subcategory._id);
      }
    }
    setActiveTab(tab);
    resetPagination();
    if (search.trim() !== '') {
      setSearch('');
      setIsSearching(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearch(text);
  };

  // Simple render functions
  const renderTabItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles(branding).tab, 
        activeTab === item && {
          ...styles(branding).activeTab,
          backgroundColor: branding.primaryColor
        }
      ]}
      onPress={() => handleTabPress(item)}
    >
      <Text
        style={[
          styles(branding).tabText,
          { color: branding.textColor },
          activeTab === item && {
            ...styles(branding).activeTabText,
            color: branding.backgroundColor
          }
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

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
        edges={['bottom', 'left', 'right']}
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

              {/* Category Tabs */}
              <View style={styles(branding).tabContainer}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={tabs}
                  keyExtractor={(item) => item}
                  renderItem={renderTabItem}
                  contentContainerStyle={{ paddingHorizontal: 10 }}
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