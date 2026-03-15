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
  StatusBar,
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
    <View style={[styles.header, { borderBottomColor: '#E5E5E5' }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color={textColor} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          All Categories
        </Text>
      </View>
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
        <StatusBar 
          barStyle={themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content'} 
          backgroundColor={backgroundColor} 
        />
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
      <StatusBar 
        barStyle={themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={backgroundColor} 
      />
      {renderHeader()}
      <View style={{ flex: 1, paddingTop: 10 }}>
        <FlatList
          data={categories}
          numColumns={4}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
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
      </View>
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
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    zIndex: 1,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  columnWrapper: {
    justifyContent: 'flex-start',
    marginBottom: 5,
  },
  categoryItem: {
    margin: scale(5),
    width: (width - scale(40)) / 4,
    alignItems: 'center',
  },
  categoryIconContainer: {
    backgroundColor: '#F5F5F5',
    padding: scale(8),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(60),
    height: scale(60),
  },
  categoryIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(16),
    resizeMode: 'cover',
  },
  categoryName: {
    marginTop: scale(3),
    fontSize: scale(11),
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: scale(14),
    height: scale(30), // Slightly more height for 2 lines
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