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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { scale } from '../../utils/scaling';
import { API_URL } from '../../config/api';
import { theme } from '../../utils/themeColors'
import { useAppBranding } from '../../utils/translationHelper'

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 20;

const AllCategories = () => {
  const navigation = useNavigation();
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { appName, primaryColor, secondaryColor, accentColor, textColor, backgroundColor, headerColor, buttonColor } = useAppBranding();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchCategories = async (page = 1, isRefresh = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`${API_URL}/categories?page=${page}&limit=${ITEMS_PER_PAGE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'zoneId': '[1]',
          'moduleId': '1'
        }
      });

      const json = await response.json();
      
      if (json?.data && Array.isArray(json.data)) {
        const validCategories = json.data.filter(category => 
          category && 
          typeof category === 'object' && 
          category._id
        );

        if (page === 1 || isRefresh) {
          setCategories(validCategories);
        } else {
          setCategories(prev => [...prev, ...validCategories]);
        }

        // Check if we have more data
        setHasMoreData(validCategories.length === ITEMS_PER_PAGE);
      } else {
        if (page === 1) {
          setCategories([]);
        }
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (page === 1) {
        setCategories([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories(1);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchCategories(1, true);
  };

  const loadMoreCategories = () => {
    if (!loadingMore && hasMoreData) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchCategories(nextPage);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.footerText, { color: textColor }]}>
          Loading more categories...
        </Text>
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="category" size={64} color={textColor} />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        No Categories Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: textColor }]}>
        Check back later for available categories
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
        All Categories
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('SubCategory', { category: item })}
    >
      <View style={styles.categoryIconContainer}>
        <Image
          style={styles.categoryIcon}
          source={{ uri: item?.image || item?.images?.[0] }}
          defaultSource={require('../../assets/images/placeholder.png')}
        />
      </View>
      <Text style={[styles.categoryName, { color: textColor }]} numberOfLines={2}>
        {item?.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading categories...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
      {renderHeader()}
      <FlatList
        data={categories}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreCategories}
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
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  categoryItem: {
    width: (width - 64) / 3, // 3 columns with padding
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  categoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
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

export default AllCategories; 