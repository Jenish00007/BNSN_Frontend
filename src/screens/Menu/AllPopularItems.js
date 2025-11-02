import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Products from '../../components/Products/Products';

import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { scale } from '../../utils/scaling';
import { API_URL } from '../../config/api';
import { theme } from '../../utils/themeColors'
import { useAppBranding } from '../../utils/translationHelper'  

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 10;

const AllPopularItems = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { appName, primaryColor, secondaryColor, accentColor, textColor, backgroundColor, headerColor, buttonColor } = useAppBranding();

  const { type = 'popular' } = route.params || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const getEndpoint = () => {
    switch (type) {
      case 'recommended':
        return 'recommended';
      case 'offers':
        return 'top-offers';
      case 'latest':
        return 'latest';
      case 'nearby':
        return 'popular';
      case 'popular':
      default:
        return 'popular';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'recommended':
        return 'Recommended Items';
      case 'offers':
        return 'Top Offers';
      case 'latest':
        return `New on ${appName}`;
      case 'nearby':
        return 'Near By Products';
      case 'popular':
      default:
        return 'Most Popular Items';
    }
  };

  const fetchItems = async (page = 1, isRefresh = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const endpoint = getEndpoint();
      const response = await fetch(`${API_URL}/user-products/${endpoint}?page=${page}&limit=${ITEMS_PER_PAGE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const json = await response.json();
      
      if (json?.products && Array.isArray(json.products)) {
        const validProducts = json.products.filter(product => 
          product && 
          typeof product === 'object' && 
          product._id
        );

        if (page === 1 || isRefresh) {
          setItems(validProducts);
        } else {
          setItems(prev => [...prev, ...validProducts]);
        }

        // Check if we have more data
        setHasMoreData(validProducts.length === ITEMS_PER_PAGE);
      } else {
        if (page === 1) {
          setItems([]);
        }
        setHasMoreData(false);
      }
    } catch (error) {
      console.error(`Error fetching ${type} items:`, error);
      if (page === 1) {
        setItems([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, [type]);

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchItems(1, true);
  };

  const loadMoreItems = () => {
    if (!loadingMore && hasMoreData) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchItems(nextPage);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.footerText, { color: textColor }]}>
          Loading more items...
        </Text>
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="shopping-bag" size={64} color={textColor} />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        No {getTitle()} Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: textColor }]}>
        Check back later for {type === 'popular' ? 'trending' : type === 'latest' ? 'new' : type === 'offers' ? 'discounted' : type === 'nearby' ? 'nearby' : 'recommended'} products
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color={textColor} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: textColor }]}>
        {getTitle()}
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading {getTitle().toLowerCase()}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
      {renderHeader()}
      <FlatList
        data={items}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Products item={item} horizontal={false} />
          </View>
        )}
        keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            colors={[primaryColor]}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 20,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemContainer: {
    width: '48%',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AllPopularItems; 