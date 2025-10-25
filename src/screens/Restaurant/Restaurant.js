import {
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native'
import React, { useState, useContext, useEffect, useRef } from 'react'
import {
  View,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  SectionList, FlatList, StyleSheet, ActivityIndicator
} from 'react-native'
// Removed animations to fix memory leaks
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade
} from 'rn-placeholder'
import ImageHeader from '../../components/Restaurant/ImageHeader'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import ConfigurationContext from '../../context/Configuration'
import UserContext from '../../context/User'
import { useRestaurant } from '../../ui/hooks'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { scale } from '../../utils/scaling'
import { theme } from '../../utils/themeColors'
import styles from './styles'
import { DAYS } from '../../utils/enums'
import { alignment } from '../../utils/alignment'
import TextError from '../../components/Text/TextError/TextError'
import { MaterialIcons } from '@expo/vector-icons'
import analytics from '../../utils/analytics'
import { gql, useApolloClient, useQuery } from '@apollo/client'
import { popularItems, food } from '../../apollo/queries'

import { useTranslation } from 'react-i18next'
import ItemCard from '../../components/ItemCards/ItemCards'
import { ScrollView } from 'react-native-gesture-handler'
import { IMAGE_LINK } from '../../utils/constants'
import { LocationContext } from '../../context/Location'
import PopularIcon from '../../assets/SVG/popular'
import { escapeRegExp } from '../../utils/regex'
import AddtoFavourites from './../../components/Favourites/AddtoFavourites'
import AuthContext from '../../context/Auth'
import { useAppBranding } from '../../utils/translationHelper'
import { API_URL } from '../../config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { height } = Dimensions.get('screen')

// Removed animated components to fix memory leaks
const TOP_BAR_HEIGHT = height * 0.05
const HEADER_MAX_HEIGHT = height * 0.4
const HEADER_MIN_HEIGHT = height * 0.07 + TOP_BAR_HEIGHT
const SCROLL_RANGE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT
const HALF_HEADER_SCROLL = HEADER_MAX_HEIGHT - TOP_BAR_HEIGHT

const POPULAR_ITEMS = gql`
  ${popularItems}
`
const FOOD = gql`
  ${food}
`

// const concat = (...args) => args.join('')
function Restaurant(props) {
  const { _id: restaurantId } = props.route.params
  const Analytics = analytics()
  const { t } = useTranslation()
  const scrollRef = useRef(null)
  const flatListRef = useRef(null)
  const navigation = useNavigation()
  const route = useRoute()
  const propsData = route.params
  // Removed shared values to fix memory leaks
  const themeContext = useContext(ThemeContext)
  const { addToCart, isLoggedIn, restaurant: restaurantCart, setCartRestaurant, cartCount, addQuantity, clearCart, checkItemCart } = useContext(UserContext);
  const { location } = useContext(LocationContext);
  const { token } = useContext(AuthContext);
  const currentTheme = theme[themeContext.ThemeValue]
  const configuration = useContext(ConfigurationContext)
  const branding = useAppBranding();
  const [selectedLabel, selectedLabelSetter] = useState(0)
  const [buttonClicked, buttonClickedSetter] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [storeDetailsByAll, setStoreDetailsByAll] = useState([])
  const [storeDetailsById, setStoreDetailsById] = useState([])
  const [loadingItemId, setLoadingItemId] = useState(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const moduleId = propsData.module_id


  const { data, refetch, networkStatus, loading, error } = useRestaurant(
    propsData._id
  )

  const client = useApolloClient()
  const { data: popularItems } = useQuery(POPULAR_ITEMS, {
    variables: { restaurantId }
  })

  const fetchFoodDetails = (itemId) => {
    return client.readFragment({ id: `Food:${itemId}`, fragment: FOOD })
  }

  const dataList =
    popularItems &&
    popularItems?.popularItems?.map((item) => {
      const foodDetails = fetchFoodDetails(item.id)
      return foodDetails
    })

  const searchHandler = () => {
    setSearchOpen(!searchOpen)
    setShowSearchResults(!showSearchResults)
  }

  const searchPopupHandler = () => {
    setSearchOpen(!searchOpen)
    setSearch('')
    translationY.value = 0
  }


  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(branding.headerColor)
    }
    StatusBar.setBarStyle('dark-content')
  })
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_RESTAURANTS)
    }
    Track()
  }, [])

  // Removed animated styles to fix memory leaks

  const isOpen = () => {
    if (storeDetailsByAll) {
      if (storeDetailsByAll?.current_opening_time?.length < 1) return false
      const date = new Date()
      const day = date.getDay()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const todaysTimings = storeDetailsByAll?.current_opening_time?.find(
        (o) => o.day === DAYS[day]
      )
      if (todaysTimings === undefined) return false
      const times = todaysTimings.times.filter(
        (t) =>
          hours >= Number(t.startTime[0]) &&
          minutes >= Number(t.startTime[1]) &&
          hours <= Number(t.endTime[0]) &&
          minutes <= Number(t.endTime[1])
      )
      return times?.length > 0
    } else {
      return false
    }
  }



  function wrapContentAfterWords(content, numWords) {
    const words = content.split(' ')
    const wrappedContent = []

    for (let i = 0; i < words.length; i += numWords) {
      wrappedContent.push(words.slice(i, i + numWords).join(' '))
    }

    return wrappedContent.join('\n')
  }



  function tagCart(itemId) {
    if (checkItemCart) {
      const cartValue = checkItemCart(itemId)
      if (cartValue.exist) {
        return (
          <>
            <View style={styles(branding.secondaryColor).triangleCorner} />
            <TextDefault
              style={styles(branding.secondaryColor).tagText}
              numberOfLines={1}
              textColor={branding.textColor}
              bold
              small
              center
            >
              {cartValue.quantity}
            </TextDefault>
          </>
        )
      }
    }
    return null
  }

  // Removed button animation to fix memory leaks
  
  // Removed animation config to fix memory leaks

  const scrollToSection = (index) => {
    if (scrollRef.current != null) {
      scrollRef.current.scrollToLocation({
        animated: true,
        sectionIndex: index,
        itemIndex: 0,
        viewOffset: -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT),
        viewPosition: 0
      })
    }
  }

  const onScrollEndSnapToEdge = (event) => {
    // Removed animation logic to fix memory leaks
    buttonClickedSetter(false)
  }
  
  // Removed scroll handler animation to fix memory leaks

  // Removed animation cleanup since animations are removed

  function changeIndex(index) {
    if (selectedLabel !== index) {
      selectedLabelSetter(index)
      buttonClickedSetter(true)
      scrollToSection(index)
      scrollToNavbar(index)
    }
  }
  function scrollToNavbar(value = 0) {
    if (flatListRef.current && typeof flatListRef.current.scrollToIndex === 'function') {
      try {
        flatListRef.current.scrollToIndex({ animated: true, index: value, viewPosition: 0.5 })
      } catch (e) {
        // ensure the index exists, fallback to nearest
        flatListRef.current.scrollToOffset?.({ animated: true, offset: Math.max(0, value - 1) * 100 })
      }
    }
  }

  function onViewableItemsChanged({ viewableItems }) {
    buttonClickedSetter(false)
    if (viewableItems.length === 0) return
    if (
      selectedLabel !== viewableItems[0].section.index &&
      buttonClicked === false
    ) {
      selectedLabelSetter(viewableItems[0].section.index)
      scrollToNavbar(viewableItems[0].section.index)
    }
  }

  const iconColor = branding.textColor
  const iconBackColor = branding.textColor
  const iconRadius = scale(15)
  const iconSize = scale(20)
  const iconTouchHeight = scale(30)
  const iconTouchWidth = scale(30)




  // const handleItemPress = (ShopcategoriId) => {
  //   setShopcategoriId(ShopcategoriId)
  //   fetchStoreDetailsById()
  // };


  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        // Get authentication token
        const token = await AsyncStorage.getItem('token');
        
        // First fetch store details to get categories using new API
        const shopId = propsData._id || propsData.id; // Use _id from shop data, fallback to id
        const storeResponse = await fetch(`${API_URL}/shops/categories/${shopId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        const storeJson = await storeResponse.json();

        if (storeJson.success && storeJson.categories) {
          // Map the new categories structure to match existing code expectations
          const mappedCategories = storeJson.categories.map(category => ({
            id: category._id,
            _id: category._id,
            name: category.name,
            image: category.image,
            description: category.description,
            isActive: category.isActive
          }));
          
          setStoreDetailsByAll(mappedCategories);

          // Get first category ID and fetch its products from backend
          if (mappedCategories.length > 0) {
            const firstCategoryId = mappedCategories[0].id;
            
            const productsResponse = await fetch(`${API_URL}/shops/products-by/shop-category/${shopId}/${firstCategoryId}?offset=0&limit=13`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
              }
            });
            const json = await productsResponse.json();

            if (json?.products && Array.isArray(json.products)) {
              // Bind directly without remapping
              setStoreDetailsById(json.products);
            }
          }
        } else {
          console.error('Error: No categories found or invalid response format');
          setStoreDetailsByAll([]);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setStoreDetailsByAll([]);
        setStoreDetailsById([]);
      }
    };

    fetchInitialProducts();
  }, [moduleId, propsData._id, propsData.id]);

  const handleItemPress = async (ShopcategoriId) => {
    try {
      const shopId = propsData._id || propsData.id; // Use _id from shop data, fallback to id
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/shops/products-by/shop-category/${shopId}/${ShopcategoriId}?offset=0&limit=13`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const json = await response.json();

      // Check if products exist and have valid data
      if (json?.products && Array.isArray(json.products)) {
        // Bind directly without remapping

        setStoreDetailsById(json.products);
      } else {
        console.log('No valid products found in response');
        setStoreDetailsById([]);
      }
    } catch (error) {
      console.error('Error fetching fetchStoreDetailsById:', error);
      setStoreDetailsById([]);
    }
  };



  useEffect(() => {
    const fetchStoreDetailsByAll = async () => {
      try {
        // Get authentication token
        const token = await AsyncStorage.getItem('token');
        
        const shopId = propsData._id || propsData.id; // Use _id from shop data, fallback to id
        const response = await fetch(`${API_URL}/shops/categories/${shopId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        const json = await response.json();

        if (json.success && json.categories) {
          // Map the new categories structure to match existing code expectations
          const mappedCategories = json.categories.map(category => ({
            id: category._id,
            _id: category._id,
            name: category.name,
            image: category.image,
            description: category.description,
            isActive: category.isActive
          }));
          
          setStoreDetailsByAll(mappedCategories);
        } else {
          console.error('Error: No categories found or invalid response format');
          setStoreDetailsByAll([]);
        }
      } catch (error) {
        console.error('Error fetching fetchStoreDetailsByAll:', error);
        setStoreDetailsByAll([]);
      }
    };

    fetchStoreDetailsByAll();
  }, [propsData._id, propsData.id]);
  // Code that processes the dummy data
  

  const handleAddToCart = async (item) => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    // Check if product is in stock
    if (item?.stock <= 0) {
      Alert.alert(
        '',
        'Restaurant Closed at the moment',
        [
          {
            text: 'Go back to restaurants',
            onPress: () => {
              navigation.goBack()
            },
            style: 'cancel'
          }
        ],
        { cancelable: false }
      );
      return;
    }

    setLoadingItemId(item.id);
    try {
      const result = await addToCart(item);
      if (result.success) {
        Alert.alert("Success", result.message);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "An error occurred while adding to cart.");
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <>
      <SafeAreaView style={styles(branding.backgroundColor).flex}>
        <View style={styles(branding.backgroundColor).flex}>
          <ImageHeader
            ref={flatListRef}
            iconColor={iconColor}
            iconSize={iconSize}
            onItemPress={handleItemPress}
            iconBackColor={iconBackColor}
            iconRadius={iconRadius}
            iconTouchWidth={iconTouchWidth}
            iconTouchHeight={iconTouchHeight}
            restaurantName={propsData?.name}
            restaurantId={propsData?._id}
            restaurantImage={propsData?.avatar}
            restaurant={propsData}
            topaBarData={storeDetailsByAll}
            changeIndex={changeIndex}
            selectedLabel={selectedLabel}
            minimumOrder={propsData?.minimum_order ?? data?.restaurant?.minimum_order}
            tax={propsData?.tax ?? data?.restaurant?.tax}
            searchOpen={searchOpen}
            showSearchResults={showSearchResults}
            setSearch={setSearch}
            search={search}
            searchHandler={searchHandler}
            searchPopupHandler={searchPopupHandler}
            translationY={translationY}
          />

         

          {showSearchResults || searchOpen ? (
            <ScrollView
              style={{
                flexGrow: 1,
                marginTop: HEADER_MIN_HEIGHT,
                backgroundColor: branding.backgroundColor,
              }}
              contentContainerStyle={{
                paddingTop: (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) + scale(60),
                paddingBottom: scale(16)
              }}
              onScrollEndDrag={onScrollEndSnapToEdge}
              onMomentumScrollEnd={onScrollEndSnapToEdge}
            >
              {storeDetailsById.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles(branding.secondaryColor).searchDealSection}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <View style={styles(branding.secondaryColor).deal}>
                        {item?.images?.length > 0 ? (() => {
                          const firstImage = item.images[0];
                          const imageUri = typeof firstImage === 'string' ? firstImage : firstImage?.url;
                          if (!imageUri) return null;
                          return (
                            <Image
                            style={{
                              height: scale(60),
                              width: scale(60),
                              borderRadius: 30
                            }}
                            source={{ uri: imageUri }}
                          />
                          );
                        })() : null}
                        <View style={styles(branding.secondaryColor).flex}>
                          <View style={styles(branding.secondaryColor).dealDescription}>
                            <TextDefault
                              textColor={branding.textColor}
                              style={styles(branding.secondaryColor).headerText}
                              numberOfLines={1}
                              bolder
                            >
                              {item.name}
                            </TextDefault>
                            <TextDefault
                              style={styles(branding.secondaryColor).priceText}
                              small
                            >
                              {wrapContentAfterWords(item.description, 5)}
                            </TextDefault>
                            <View style={styles(branding.secondaryColor).dealPrice}>
                              <TextDefault
                                numberOfLines={1}
                                textColor={branding.textColor}
                                style={styles(branding.secondaryColor).priceText}
                                bolder
                                small
                              >
                                ₹{' '}
                                {parseFloat((item?.discountPrice > 0 ? item.discountPrice : item?.originalPrice) || 0).toFixed(2)}
                              </TextDefault>
                              {item?.discountPrice > 0 && (
                                <TextDefault
                                  numberOfLines={1}
                                  textColor={branding.textColor}
                                  style={styles().priceText}
                                  small
                                  lineOver
                                >
                                  ₹{' '}
                                  {parseFloat(item?.discountPrice || 0).toFixed(2)}
                                </TextDefault>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={[styles().addToCart, { backgroundColor: branding.buttonColor }]}
                        onPress={() => handleAddToCart(item)}
                        disabled={loadingItemId === item.id}
                      >
                        {loadingItemId === item.id ? (
                          <ActivityIndicator size="small" color={branding.textColor} />
                        ) : (
                          <MaterialIcons
                            name="add"
                            size={scale(20)}
                            color={branding.textColor}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                    {tagCart(item.id)}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (


            <FlatList
              data={storeDetailsById}
              keyExtractor={(item, index) => String(index)}
              contentContainerStyle={{
                flexGrow: 1,
                paddingTop: (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) + scale(60),
                marginTop: HEADER_MIN_HEIGHT,
              }}
              renderItem={({ item, index }) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles(branding.secondaryColor).searchDealSection}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View style={styles(branding.secondaryColor).deal}>
                        {item?.images?.length > 0 ? (() => {
                          const firstImage = item.images[0];
                          const imageUri = typeof firstImage === 'string' ? firstImage : firstImage?.url;
                          if (!imageUri) return null;
                          return (
                            <Image
                            style={{
                              height: scale(60),
                              width: scale(60),
                              borderRadius: 30,
                            }}
                            source={{ uri: imageUri }}
                          />
                          );
                        })() : null}
                        <View style={styles(branding.secondaryColor).flex}>
                          <View style={styles(branding.secondaryColor).dealDescription}>
                            <TextDefault
                              textColor={branding.textColor}
                              style={styles(branding.secondaryColor).headerText}
                              numberOfLines={1}
                              bolder
                            >
                              {item.name}
                            </TextDefault>
                            <View style={styles(branding.secondaryColor).dealPrice}>
                              <TextDefault
                                numberOfLines={1}
                                textColor={branding.textColor}
                                style={styles(branding.secondaryColor).priceText}
                                bolder
                                small
                              >
                                ₹{' '}
                                {parseFloat(item.discountPrice).toFixed(2)}
                              </TextDefault>
                              {item?.originalPrice > 0 && (
                                <TextDefault
                                  numberOfLines={1}
                                  textColor={branding.textColor}
                                  style={styles().priceText}
                                  small
                                  lineOver
                                >
                                  ₹ {item?.originalPrice.toFixed(2)}
                                </TextDefault>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={[styles().addToCart, { backgroundColor: branding.buttonColor }]}
                        onPress={() => handleAddToCart(item)}
                        disabled={loadingItemId === item.id}
                      >
                        {loadingItemId === item.id ? (
                          <ActivityIndicator size="small" color={branding.textColor} />
                        ) : (
                          <MaterialIcons
                            name="add"
                            size={scale(20)}
                            color={branding.textColor}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                    {tagCart(item.id)}
                  </TouchableOpacity>
                </View>
              )}
            />


          )}


          {cartCount > 0 && (
            <View style={styles(branding.backgroundColor).buttonContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles(branding.buttonColor).button}
                onPress={() => navigation.navigate('Cart')}
              >
                <View style={styles().buttontLeft}>
                  <View
                    style={[
                      styles(branding.buttonColor).buttonLeftCircle,
                      {
                        width: 30,
                        height: 30,
                        borderRadius: 15
                      }
                    ]}
                  >
                    <Text
                      style={[styles(branding.buttonColor).buttonTextLeft]}
                    >
                      {cartCount}
                    </Text>
                  </View>
                </View>
                <TextDefault
                  style={styles().buttonText}
                  textColor={branding.whiteColorText}
                  uppercase
                  center
                  bolder
                  small
                >
                  {t('viewCart')}
                </TextDefault>
                <View style={styles().buttonTextRight} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  )
}

export default Restaurant