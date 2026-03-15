import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { scale } from '../../utils/scaling'

const Categories = React.memo(function Categories({ categories }) {
  const navigation = useNavigation()
  const [renderedCategories, setRenderedCategories] = useState([])
  const processedRef = useRef(false)

  // Process categories with useMemo for better performance
  const processedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return []

    return categories.map((category, index) => ({
      ...category,
      _key: `category-${category._id || index}-${index}`,
      imageUrl: category?.image || category?.images?.[0]
    }))
  }, [categories])

  // Update rendered categories when processed categories change
  useEffect(() => {
    if (processedCategories.length > 0) {
      // Show maximum 8 categories (4 per row, 2 rows)
      setRenderedCategories(processedCategories.slice(0, 8))
    }
  }, [processedCategories])

  // Memoized navigation handler
  const handleCategoryPress = useCallback(
    (category) => {
      navigation.navigate('SubCategory', { category })
    },
    [navigation]
  )

  const renderCategory = ({ item, index }) => {
    const imageUrl = item?.imageUrl || item?.image || item?.images?.[0]

    return (
      <TouchableOpacity
        onPress={() => handleCategoryPress(item)}
        style={styles.touchableContainer}
        key={item._key}
      >
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Image
              style={styles.icon}
              source={{
                uri: imageUrl,
                cache: 'force-cache'
              }}
              onError={(error) => {
                console.error(
                  `Image load error for category ${index} (${item?.name}):`,
                  error.nativeEvent
                )
              }}
              defaultSource={require('../../assets/images/placeholder.png')}
              resizeMode='cover'
              progressiveRenderingEnabled={true}
              fadeDuration={0}
            />
          </View>
          <Text style={styles.text} numberOfLines={2}>
            {item?.name}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }


  // If no categories, show empty state
  if (!categories || categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No categories available</Text>
      </View>
    )
  }


  // Ensure we have categories to render
  if (!renderedCategories || renderedCategories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading categories...</Text>
      </View>
    )
  }

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={renderedCategories}
        showsVerticalScrollIndicator={false}
        horizontal={false}
        numColumns={4}
        renderItem={renderCategory}
        keyExtractor={(item) => item._key}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={8}
        removeClippedSubviews={false}
        getItemLayout={(data, index) => ({
          length: scale(80),
          offset: scale(80) * Math.floor(index / 4) * 2,
          index
        })}
        contentContainerStyle={styles.listContainer}
        extraData={renderedCategories.length}
        scrollEnabled={false}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1
  },
  listContainer: {
    paddingHorizontal: scale(10)
  },
  touchableContainer: {
    flex: 1,
    margin: scale(5),
    maxWidth: scale(80)
  },
  iconContainer: {
    backgroundColor: '#F5F5F5',
    padding: scale(8),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(60),
    height: scale(60)
  },
  container: {
    alignItems: 'center',
    padding: scale(5),
    width: scale(80)
  },
  icon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(16)
  },
  text: {
    marginTop: scale(3),
    fontSize: scale(11),
    textAlign: 'center',
    fontWeight: '500'
  },
  emptyContainer: {
    padding: scale(20),
    alignItems: 'center'
  },
  emptyText: {
    fontSize: scale(16),
    color: '#666'
  }
})

export default Categories
