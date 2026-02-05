import React, {
  useRef,
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react'
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Text,
  RefreshControl,
  FlatList,
  ActivityIndicator
} from 'react-native'
import {
  MaterialIcons,
  SimpleLineIcons,
  AntDesign,
  MaterialCommunityIcons,
  Feather
} from '@expo/vector-icons'
import { useLocation } from '../../ui/hooks'
import Search from '../../components/Main/Search/Search'
import UserContext from '../../context/User'
import { LocationContext } from '../../context/Location'
import { scale } from '../../utils/scaling'
import { safeJsonParse } from '../../utils/stockUtils'
import {
  calculateDistanceKm,
  getSellerCoordinates
} from '../../utils/geolocation'

// Utility function to safely parse JSON responses
const safeJsonResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Response is not JSON')
  }

  return await response.json()
}
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import styles from './styles'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import navigationOptions from '../Main/navigationOptions'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import analytics from '../../utils/analytics'
import { useTranslation } from 'react-i18next'
import { FILTER_TYPE } from '../../utils/enums'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import Spinner from '../../components/Spinner/Spinner'
import CarouselSlider from '../../components/Slider/Slider'
import Categories from '../../components/Categories/Categories'
import BottomTab from '../../components/BottomTab/BottomTab'
import Products from '../../components/Products/Products'
import CategoryListView from '../../components/NearByShop/CategoryListView'
import EventCard from '../../components/EventCard/EventCard'
import { API_URL } from '../../config/api'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { useAppBranding } from '../../utils/translationHelper'
import {
  captureError,
  addBreadcrumb,
  withPerformanceMonitoring
} from '../../utils/sentryUtils'

export const FILTER_VALUES = {
  Sort: {
    type: FILTER_TYPE.RADIO,
    values: ['Relevance (Default)', 'Fast Delivery', 'Distance'],
    selected: []
  },
  Offers: {
    selected: [],
    type: FILTER_TYPE.CHECKBOX,
    values: ['Free Delivery', 'Accept Vouchers', 'Deal']
  },
  Rating: {
    selected: [],
    type: FILTER_TYPE.CHECKBOX,
    values: ['3+ Rating', '4+ Rating', '5 star Rating']
  }
}

function Menu() {
  const Analytics = analytics()
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const { loadingOrders, isLoggedIn, profile, fetchCartItems } =
    useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    popular: {
      type: 'checkbox',
      values: ['Option 1', 'Option 2'],
      selected: []
    },
    latest: { type: 'radio', values: ['Option A', 'Option B'], selected: [] },
    topOffer: { type: 'checkbox', values: ['Offer 1', 'Offer 2'], selected: [] }
  })
  const [selectedFilter, setSelectedFilter] = useState('all')
  const modalRef = useRef(null)
  const navigation = useNavigation()

  // Removed animation cleanup; no animations used on Menu screen

  const { getCurrentLocation } = useLocation()
  const locationData = location

  const buyerCoordinates = useMemo(() => {
    if (
      location?.latitude !== undefined &&
      location?.longitude !== undefined &&
      location?.latitude !== null &&
      location?.longitude !== null
    ) {
      return {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude)
      }
    }
    return null
  }, [location?.latitude, location?.longitude])

  // Check if location permission is denied
  const isLocationPermissionDenied =
    location?.label === 'locationPermissionDenied'
  const [localZoneId, setLocalZoneId] = useState('[1]')
  const [recommendedItem, setRecommendedItem] = useState([])
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [supermarkets, setSupermarkets] = useState([])
  const [nearbymarketsOffer, setNearbymarketsOffer] = useState([])
  const [popularItem, setPopularItem] = useState([])
  const [specialItem, setSpecialItem] = useState([])
  const [allStores, setAllStore] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [zoneId, setZoneId] = useState('[1]')
  const [flashSaleItem, setFlashSaleItem] = useState([])
  const [events, setEvents] = useState([])
  const [selectedType, setSelectedType] = useState('all')
  const [moduleId, setModuleId] = useState('1')
  const [allproducts, setAllproducts] = useState([])
  const [latestItem, setLatestItem] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchResultsWithDistance, setSearchResultsWithDistance] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [distanceFilterKm, setDistanceFilterKm] = useState(null)
  const [isDistanceComputing, setIsDistanceComputing] = useState(false)
  const searchTimeoutRef = useRef(null)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const [sellerCache, setSellerCache] = useState({})

  // Pagination state for all products
  const [allProductsPage, setAllProductsPage] = useState(1)
  const [allProductsLoading, setAllProductsLoading] = useState(true)
  const [allProductsLoadingMore, setAllProductsLoadingMore] = useState(false)
  const [hasMoreAllProducts, setHasMoreAllProducts] = useState(true)
  const ITEMS_PER_PAGE = 10

  //Search Placeholder Text Changes
  const searchPlaceholderText =
    selectedType === 'restaurant' ? t('searchRestaurant') : t('Search Products')
  useEffect(() => {
    if (!search) {
      setDistanceFilterKm(null)
    }
  }, [search])
  const menuPageHeading =
    selectedType === 'restaurant' ? t('allRestaurant') : t('allGrocery')
  const emptyViewDesc =
    selectedType === 'restaurant' ? t('noRestaurant') : t('noGrocery')

  const {
    appName,
    primaryColor,
    secondaryColor,
    accentColor,
    textColor,
    backgroundColor,
    headerColor,
    buttonColor
  } = useAppBranding()

  // Create branding object for styles
  const brandingColors = {
    primaryColor,
    secondaryColor,
    accentColor,
    textColor,
    backgroundColor,
    headerColor,
    buttonColor
  }

  const getNewOnAppText = () => {
    return `New on ${appName}`
  }

  //Theme setup android and ios
  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(primaryColor)
    }
    StatusBar.setBarStyle('dark-content')
  })

  // Fetch cart items when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn && fetchCartItems) {
        fetchCartItems()
      }
    }, [isLoggedIn, fetchCartItems])
  )

  //Track Analytics
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_MAIN)
    }
    Track()
  }, [])

  //Model open
  const onOpen = () => {
    const modal = modalRef.current
    if (modal) {
      modal.open()
    }
  }

  //App Layout Theme
  useLayoutEffect(() => {
    navigation.setOptions(
      navigationOptions({
        headerMenuBackground: primaryColor,
        horizontalLine: primaryColor,
        fontMainColor: textColor,
        iconColorPink: primaryColor,
        iconColor: '#FFFFFF',
        locationColor: '#FFFFFF',
        locationLabelColor: '#FFFFFF',
        open: onOpen,
        headerLeft: null
      })
    )
  }, [navigation, currentTheme])

  //Remove the onError function and any other unused GraphQL-related code

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }

  const setAddressLocation = async (address) => {
    setLocation({
      _id: address._id,
      label: address.label,
      latitude: Number(address.location.coordinates[1]),
      longitude: Number(address.location.coordinates[0]),
      deliveryAddress: address.deliveryAddress,
      details: address.details
    })
    // mutate({ variables: { id: address._id } }) // This line was removed as per the edit hint
    modalRef.current.close()
  }

  //Location Fetch
  const setCurrentLocation = async () => {
    setBusy(true)
    const { error, coords } = await getCurrentLocation()

    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.log('Reverse geocoding request failed:', data.error)
        } else {
          let address = data.display_name
          if (address.length > 21) {
            address = address.substring(0, 21) + '...'
          }

          if (error) navigation.navigate('SelectLocation')
          else {
            modalRef.current.close()
            setLocation({
              label: 'currentLocation',
              latitude: coords.latitude,
              longitude: coords.longitude,
              deliveryAddress: address
            })
            setBusy(false)
          }
          // console.log(address)
        }
      })
      .catch((error) => {
        console.error('Error fetching reverse geocoding data:', error)
      })
  }

  // Refresh location when user comes back from settings
  const refreshLocationPermission = async () => {
    try {
      const { error, coords } = await getCurrentLocation()
      if (!error && coords) {
        const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
        const response = await fetch(apiUrl)

        if (response.ok) {
          try {
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json()

              if (!data.error) {
                let address = data.display_name
                if (address.length > 21) {
                  address = address.substring(0, 21) + '...'
                }

                setLocation({
                  label: 'currentLocation',
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  deliveryAddress: address
                })
              }
            } else {
              console.log('Non-JSON response from location API')
            }
          } catch (jsonError) {
            console.log('Error parsing location JSON response:', jsonError)
          }
        } else {
          console.log('Location API error:', response.status)
        }
      }
    } catch (error) {
      console.error('Error refreshing location:', error)
    }
  }

  // Add loading states
  const [bannersLoading, setBannersLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [supermarketsLoading, setSupermarketsLoading] = useState(true)
  const [nearbyMarketsLoading, setNearbyMarketsLoading] = useState(true)
  const [nearbyMarketsOfferLoading, setNearbyMarketsOfferLoading] =
    useState(true)
  const [popularItemLoading, setPopularItemLoading] = useState(true)
  const [allStoresLoading, setAllStoresLoading] = useState(true)
  const [flashSaleItemLoading, setFlashSaleItemLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [recommendedItemLoading, setRecommendedItemLoading] = useState(true)

  // Add ref to track if categories have been fetched
  const categoriesFetchedRef = useRef(false)

  // Add loading placeholder component
  const ListLoadingComponent = ({
    horizontal = true,
    count = 3,
    type = 'store'
  }) => {
    // Define sizes based on type
    const sizes = {
      banner: { width: '100%', height: scale(150) },
      category: { width: scale(80), height: scale(80) },
      store: { width: scale(150), height: scale(180) },
      nearbyStore: { width: scale(200), height: scale(120) },
      offer: { width: scale(200), height: scale(120) },
      product: { width: scale(130), height: scale(160) },
      allStore: { width: '100%', height: scale(120) }
    }

    const currentSize = sizes[type]

    return (
      <View
        style={{
          flexDirection: horizontal ? 'row' : 'column',
          paddingHorizontal: scale(12)
        }}
      >
        {[...Array(count)].map((_, index) => (
          <View
            key={index}
            style={{
              marginRight: horizontal ? scale(10) : 0,
              marginBottom: !horizontal ? scale(10) : 0,
              backgroundColor: currentTheme.placeHolderColor,
              borderRadius: 8,
              width: currentSize.width,
              height: currentSize.height,
              overflow: 'hidden'
            }}
          >
            <Placeholder>
              <PlaceholderLine
                style={{
                  height: type === 'nearbyStore' ? '70%' : '60%',
                  marginBottom: 0,
                  opacity: 0.5
                }}
              />
              <View style={{ padding: 8 }}>
                <PlaceholderLine width={80} style={{ opacity: 0.4 }} />
                {type !== 'category' && (
                  <PlaceholderLine width={50} style={{ opacity: 0.25 }} />
                )}
              </View>
            </Placeholder>
          </View>
        ))}
      </View>
    )
  }

  // Optimized parallel data fetching useEffect
  useEffect(() => {
    const fetchAllData = async () => {
      // Create all fetch promises for parallel execution
      const fetchPromises = []

      // Banners
      fetchPromises.push(
        fetch(`${API_URL}/admin-banner/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            zoneId: zoneId,
            moduleId: moduleId
          }
        })
          .then(async (response) => {
            if (response.ok) {
              const json = await safeJsonParse(response)
              if (json?.banners && json.banners.length > 0) {
                setBanners(json.banners)
              }
            }
          })
          .catch((error) => console.error('Error fetching banners:', error))
          .finally(() => setBannersLoading(false))
      )

      // Categories (only once)
      if (!categoriesFetchedRef.current) {
        fetchPromises.push(
          fetch(`${API_URL}/categories`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              zoneId: zoneId,
              moduleId: moduleId
            }
          })
            .then(async (response) => {
              const json = await response.json()
              if (json?.data?.length > 0) {
                setCategories(json.data)
              } else {
                setCategories([])
              }
            })
            .catch((error) => {
              console.error('Error fetching categories:', error)
              setCategories([])
            })
            .finally(() => {
              setCategoriesLoading(false)
              categoriesFetchedRef.current = true
            })
        )
      }

      // Supermarkets
      fetchPromises.push(
        fetch(
          'https://6ammart-admin.6amtech.com/api/v1/stores/latest?type=all',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              zoneId: zoneId,
              moduleId: moduleId
            }
          }
        )
          .then(async (response) => {
            const json = await safeJsonResponse(response)
            if (json?.stores && json.stores.length > 0) {
              setSupermarkets(json.stores)
            } else {
              setSupermarkets([])
            }
          })
          .catch((error) => {
            console.error('Error fetching supermarkets:', error)
            setSupermarkets([])
          })
          .finally(() => setSupermarketsLoading(false))
      )

      // All products
      fetchPromises.push(
        fetch(
          `${API_URL}/product/get-all-products?page=1&limit=${ITEMS_PER_PAGE}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
          .then(async (response) => {
            const json = await response.json()
            if (json?.products && json.products.length > 0) {
              setAllproducts(json.products)
              setHasMoreAllProducts(json.products.length === ITEMS_PER_PAGE)
            } else {
              setAllproducts([])
              setHasMoreAllProducts(false)
            }
          })
          .catch((error) => {
            console.error('Error fetching all products:', error)
            setAllproducts([])
            setHasMoreAllProducts(false)
          })
          .finally(() => setAllProductsLoading(false))
      )

      // Latest items
      fetchPromises.push(
        fetch(`${API_URL}/user-products/latest`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(async (response) => {
            const json = await response.json()
            if (json?.products && json.products.length > 0) {
              setLatestItem(json.products)
            }
          })
          .catch((error) =>
            console.error('Error fetching latest items:', error)
          )
          .finally(() => setNearbyMarketsLoading(false))
      )

      // Nearby market offers
      fetchPromises.push(
        fetch(
          'https://6ammart-admin.6amtech.com/api/v1/stores/top-offer-near-me',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              zoneId: zoneId,
              moduleId: moduleId
            }
          }
        )
          .then(async (response) => {
            const json = await safeJsonResponse(response)
            if (json?.stores && json.stores.length > 0) {
              setNearbymarketsOffer(json.stores)
            } else {
              setNearbymarketsOffer([])
            }
          })
          .catch((error) => {
            console.error('Error fetching nearby market offers:', error)
            setNearbymarketsOffer([])
          })
          .finally(() => setNearbyMarketsOfferLoading(false))
      )

      // Popular items
      fetchPromises.push(
        fetch(`${API_URL}/user-products/popular`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(async (response) => {
            const json = await response.json()
            if (json?.products && Array.isArray(json.products)) {
              const validProducts = json.products.filter(
                (product) =>
                  product && typeof product === 'object' && product._id
              )
              setPopularItem(validProducts)
            } else {
              setPopularItem([])
            }
          })
          .catch((error) => {
            console.error('Error fetching popular items:', error)
            setPopularItem([])
          })
          .finally(() => setPopularItemLoading(false))
      )

      // Flash sale items
      fetchPromises.push(
        fetch(`${API_URL}/user-products/flash-sale`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(async (response) => {
            const json = await response.json()
            if (json?.products && Array.isArray(json.products)) {
              const validProducts = json.products.filter(
                (product) =>
                  product && typeof product === 'object' && product._id
              )
              setFlashSaleItem(validProducts)
            } else {
              setFlashSaleItem([])
            }
          })
          .catch((error) => {
            console.error('Error fetching flash sale items:', error)
            setFlashSaleItem([])
          })
          .finally(() => setFlashSaleItemLoading(false))
      )

      // Recommended items
      fetchPromises.push(
        fetch(`${API_URL}/user-products/recommended`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(async (response) => {
            const json = await response.json()
            if (json?.products && Array.isArray(json.products)) {
              const validProducts = json.products.filter(
                (product) =>
                  product && typeof product === 'object' && product._id
              )
              setRecommendedItem(validProducts)
            } else {
              setRecommendedItem([])
            }
          })
          .catch((error) => {
            console.error('Error fetching recommended items:', error)
            setRecommendedItem([])
          })
          .finally(() => setRecommendedItemLoading(false))
      )

      // Events/flash sales
      fetchPromises.push(
        fetch(`${API_URL}/event/get-all-events`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Response is not JSON')
            }

            const json = await response.json()
            if (json?.success && Array.isArray(json?.events)) {
              const validEvents = json.events.filter(
                (event) =>
                  event &&
                  typeof event === 'object' &&
                  event._id &&
                  event.status === 'Running' &&
                  new Date(event.Finish_Date) > new Date()
              )
              setEvents(validEvents)
            } else {
              setEvents([])
            }
          })
          .catch((error) => {
            console.error('Error fetching events:', error)
            setEvents([])
          })
          .finally(() => {
            setEventsLoading(false)
          })
      )

      // Execute all promises in parallel
      await Promise.allSettled(fetchPromises)
    }

    fetchAllData()
  }, [moduleId, zoneId])

  // Update fetchData
  const fetchData = async (category) => {
    setAllStoresLoading(true)
    let url = ''
    switch (category) {
      case 'popular':
        url = 'https://6ammart-admin.6amtech.com/api/v1/stores/popular?type=all'
        break
      case 'latest':
        url = 'https://6ammart-admin.6amtech.com/api/v1/stores/latest?type=all'
        break
      case 'top-offer':
        url =
          'https://6ammart-admin.6amtech.com/api/v1/stores/top-offer-near-me'
        break
      default:
        url =
          'https://6ammart-admin.6amtech.com/api/v1/stores/get-stores/all?store_type=all'
        break
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          zoneId: zoneId,
          moduleId: moduleId
        }
      })

      const data = await safeJsonResponse(response)
      if (data?.stores && Array.isArray(data.stores)) {
        // Filter out any invalid stores
        const validStores = data.stores.filter(
          (store) => store && typeof store === 'object' && store._id
        )
        setAllStore(validStores)
      } else {
        setAllStore([])
        console.log('No valid stores found in response')
      }
    } catch (error) {
      console.error('Error fetching stores data:', error)
      setAllStore([])
    } finally {
      setAllStoresLoading(false)
    }
  }

  const applyFilters = (filter) => {
    setSelectedFilter(filter)

    // Trigger the corresponding API call based on filter
    switch (filter) {
      case 'popular':
        fetchData('popular')
        break
      case 'latest':
        fetchData('latest')
        break
      case 'top-offer':
        fetchData('top-offer')
        break
      default:
        fetchData('all')
        break
    }
  }

  useEffect(() => {
    fetchData('all')
  }, [])

  // Header
  const modalHeader = () => (
    <View style={[styles().addNewAddressbtn]}>
      <View style={styles().addressContainer}>
        <TouchableOpacity
          style={[styles(currentTheme, brandingColors).addButton]}
          activeOpacity={0.7}
          onPress={setCurrentLocation}
          disabled={busy}
        >
          <View style={styles().addressSubContainer}>
            {busy ? (
              <Spinner size='small' />
            ) : (
              <>
                <SimpleLineIcons
                  name='target'
                  size={scale(18)}
                  color={currentTheme.black}
                />
                <View style={styles().mL5p} />
                <TextDefault bold>{t('currentLocation')}</TextDefault>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )

  //App not Available in YourArea
  const emptyView = () => {
    return (
      <View style={styles().emptyViewContainer}>
        <View style={styles(currentTheme, brandingColors).emptyViewBox}>
          <TextDefault bold H4 center textColor={currentTheme.fontMainColor}>
            {t('notAvailableinYourArea')}
          </TextDefault>
          <TextDefault textColor={currentTheme.fontMainColor} center>
            {emptyViewDesc}
          </TextDefault>
        </View>
      </View>
    )
  }

  //Footer Modal
  const modalFooter = () => (
    <View style={styles().addNewAddressbtn}>
      <View style={styles(currentTheme).addressContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles(currentTheme, brandingColors).addButton}
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate('AddNewAddress', { ...locationData })
            } else {
              const modal = modalRef.current
              modal?.close()
              navigation.navigate({ name: 'CreateAccount' })
            }
          }}
        >
          <View style={styles().addressSubContainer}>
            <AntDesign
              name='pluscircleo'
              size={scale(20)}
              color={currentTheme.black}
            />
            <View style={styles().mL5p} />
            <TextDefault bold>{t('addAddress')}</TextDefault>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles().addressTick}></View>
    </View>
  )
  // console.log(filters);

  // Add debounced search function
  const debouncedSearch = useCallback((searchTerm) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setSearchResults([])
        return
      }

      setSearchLoading(true)
      try {
        const response = await fetch(
          `${API_URL}/search/products?keyword=${encodeURIComponent(searchTerm.trim())}&sortBy=name&sortOrder=asc&page=1&limit=10`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        if (!response.ok) {
          throw new Error('Search request failed')
        }

        const json = await response.json()
        if (json?.success && Array.isArray(json?.products)) {
          setSearchResults(json.products)
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error('Error searching products:', error)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 500) // 500ms debounce delay
  }, [])

  const fetchSellerUser = useCallback(
    async (userId) => {
      if (!userId) return null
      if (sellerCache[userId]) {
        return sellerCache[userId]
      }

      try {
        const response = await fetch(`${API_URL}/user/user-info/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data?.success && data?.user) {
            setSellerCache((prev) => ({ ...prev, [userId]: data.user }))
            return data.user
          }
        }
      } catch (error) {
        console.error('Error fetching seller user:', error)
      }

      return null
    },
    [sellerCache]
  )

  useEffect(() => {
    let isMounted = true

    const enhanceWithDistance = async () => {
      if (!searchResults?.length) {
        if (isMounted) {
          setSearchResultsWithDistance([])
        }
        return
      }

      if (!buyerCoordinates) {
        if (isMounted) {
          setSearchResultsWithDistance(
            searchResults.map((product) => ({
              ...product,
              distanceKm: null,
              distanceLabel: 'N/A'
            }))
          )
        }
        return
      }

      setIsDistanceComputing(true)

      const enrichedResults = await Promise.all(
        searchResults.map(async (product) => {
          let sellerUser = product?.user
          if (!sellerUser && product?.userId) {
            sellerUser = await fetchSellerUser(product.userId)
          }

          const sellerCoords = getSellerCoordinates(product, sellerUser)

          if (!sellerCoords) {
            return {
              ...product,
              distanceKm: null,
              distanceLabel: 'N/A'
            }
          }

          const distanceKm = calculateDistanceKm(
            buyerCoordinates.latitude,
            buyerCoordinates.longitude,
            sellerCoords.latitude,
            sellerCoords.longitude
          )

          return {
            ...product,
            distanceKm,
            distanceLabel:
              typeof distanceKm === 'number'
                ? `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`
                : 'N/A'
          }
        })
      )

      if (isMounted) {
        setSearchResultsWithDistance(enrichedResults)
        setIsDistanceComputing(false)
      }
    }

    enhanceWithDistance()

    return () => {
      isMounted = false
    }
  }, [searchResults, buyerCoordinates, fetchSellerUser])

  const filteredSearchResults = useMemo(() => {
    if (
      distanceFilterKm === null ||
      distanceFilterKm === undefined ||
      !Number.isFinite(Number(distanceFilterKm)) ||
      Number(distanceFilterKm) <= 0
    ) {
      return searchResultsWithDistance
    }

    const maxDistance = Number(distanceFilterKm)
    return searchResultsWithDistance.filter(
      (product) =>
        typeof product.distanceKm === 'number' &&
        product.distanceKm <= maxDistance
    )
  }, [searchResultsWithDistance, distanceFilterKm])

  // Update search handler
  const handleSearch = useCallback(
    (text) => {
      setSearch(text)
      debouncedSearch(text)
    },
    [debouncedSearch]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Refresh location when screen comes into focus (user might have enabled location in settings)
  useFocusEffect(
    useCallback(() => {
      if (isLocationPermissionDenied) {
        refreshLocationPermission()
      }
    }, [isLocationPermissionDenied])
  )

  // Function to load more products
  const loadMoreAllProducts = async () => {
    if (allProductsLoadingMore || !hasMoreAllProducts) return

    setAllProductsLoadingMore(true)
    try {
      const nextPage = allProductsPage + 1
      const response = await fetch(
        `${API_URL}/product/get-all-products?page=${nextPage}&limit=${ITEMS_PER_PAGE}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      const json = await response.json()

      if (json?.products && json.products.length > 0) {
        setAllproducts((prev) => [...prev, ...json.products])
        setAllProductsPage(nextPage)
        setHasMoreAllProducts(json.products.length === ITEMS_PER_PAGE)
      } else {
        setHasMoreAllProducts(false)
      }
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      setAllProductsLoadingMore(false)
    }
  }

  return (
    <>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={[styles().flex, { backgroundColor: 'black' }]}
      >
        <View
          style={[
            styles().flex,
            styles(currentTheme, brandingColors).screenBackground
          ]}
        >
          <View style={styles().flex}>
            <View style={styles().mainContentContainer}>
              {/* Search Bar Section */}

              <Search
                setSearch={handleSearch}
                search={search}
                newheaderColor={primaryColor}
                placeHolder={searchPlaceholderText}
                distanceFilter={distanceFilterKm}
                onDistanceFilterChange={setDistanceFilterKm}
                isFilteringByDistance={isDistanceComputing}
              />

              {search ? (
                <View style={styles().searchList}>
                  <FlatList
                    key='search-results-grid'
                    contentInset={{
                      top: 0
                    }}
                    contentContainerStyle={{
                      paddingTop: 0,
                      paddingHorizontal: scale(12)
                    }}
                    contentOffset={{
                      y: 0
                    }}
                    scrollIndicatorInsets={{
                      top: 0
                    }}
                    showsVerticalScrollIndicator={false}
                    numColumns={2} // Add 2-column layout
                    columnWrapperStyle={{ justifyContent: 'space-between' }} // Space between columns
                    ListEmptyComponent={
                      searchLoading ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                          <Spinner size='small' />
                        </View>
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 20,
                            minHeight: 200
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              color: textColor,
                              textAlign: 'center'
                            }}
                          >
                            No products found
                          </Text>
                        </View>
                      )
                    }
                    keyExtractor={(item, index) =>
                      `search-${item?._id?.toString() || index}-${index}`
                    }
                    refreshControl={
                      <RefreshControl
                        progressViewOffset={0}
                        colors={[currentTheme.iconColorPink]}
                        refreshing={searchLoading}
                        onRefresh={() => debouncedSearch(search)}
                      />
                    }
                    data={filteredSearchResults}
                    renderItem={({ item }) => (
                      <Products item={item} maxDistanceKm={distanceFilterKm} />
                    )}
                    ItemSeparatorComponent={() => (
                      <View style={{ height: scale(8) }} />
                    )}
                  />
                </View>
              ) : (
                <FlatList
                  data={[
                    // { type: 'banner', id: 'banner' },
                    { type: 'categories', id: 'categories' },
                    // { type: 'latest', id: 'latest' },
                    { type: 'events', id: 'events' },
                    { type: 'recommended', id: 'recommended' },
                    { type: 'offers', id: 'offers' },
                    // { type: 'popular', id: 'popular' },
                    { type: 'allProducts', id: 'allProducts' }
                  ]}
                  keyExtractor={(item) => item.id}
                  onEndReached={loadMoreAllProducts}
                  onEndReachedThreshold={0.1}
                  renderItem={({ item }) => {
                    switch (item.type) {
                      // case 'banner':
                      //   return (
                      //     <View style={{ padding: 10 }}>
                      //       {bannersLoading ? (
                      //         <ListLoadingComponent horizontal={false} count={1} type="banner" />
                      //       ) : banners.length > 0 ? (
                      //         <CarouselSlider banners={banners} />
                      //       ) : null}
                      //     </View>
                      //   );

                      case 'categories':
                        return (
                          <>
                            <View style={styles().sectionHeader}>
                              <TextDefault style={styles().sectionTitle}>
                                Brows Categories
                              </TextDefault>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('AllCategories')
                                }
                                style={styles().viewAllButton}
                              >
                                <Text
                                  style={[
                                    styles().viewAllText,
                                    { color: primaryColor }
                                  ]}
                                >
                                  See All
                                </Text>
                                <MaterialIcons
                                  name='arrow-forward-ios'
                                  size={14}
                                  color={primaryColor}
                                />
                              </TouchableOpacity>
                            </View>
                            {categoriesLoading ? (
                              <ListLoadingComponent count={4} type='category' />
                            ) : (
                              <Categories categories={categories} />
                            )}
                          </>
                        )

                      case 'recommended':
                        return (
                          <>
                            <View style={styles().sectionHeader}>
                              <TextDefault style={styles().sectionTitle}>
                                Fresh recommendations
                              </TextDefault>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('AllPopularItems', {
                                    type: 'recommended'
                                  })
                                }
                                style={styles().viewAllButton}
                              >
                                <Text
                                  style={[
                                    styles().viewAllText,
                                    { color: primaryColor }
                                  ]}
                                >
                                  View All
                                </Text>
                                <MaterialIcons
                                  name='arrow-forward-ios'
                                  size={14}
                                  color={primaryColor}
                                />
                              </TouchableOpacity>
                            </View>
                            {recommendedItemLoading ? (
                              <ListLoadingComponent count={3} type='product' />
                            ) : (
                              <View>
                                <FlatList
                                  data={recommendedItem}
                                  horizontal={true}
                                  showsHorizontalScrollIndicator={false}
                                  renderItem={({
                                    item: productItem,
                                    index
                                  }) => (
                                    <CategoryListView
                                      data={{ item: productItem, index }}
                                    />
                                  )}
                                  keyExtractor={(productItem, index) =>
                                    `recommended-${productItem?._id?.toString() || index}-${index}`
                                  }
                                />
                              </View>
                            )}
                          </>
                        )

                      case 'offers':
                        return (
                          <>
                            <View style={styles().sectionHeader}>
                              <TextDefault style={styles().sectionTitle}>
                                Near By Products
                              </TextDefault>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('AllPopularItems', {
                                    type: 'nearby'
                                  })
                                }
                                style={styles().viewAllButton}
                              >
                                <Text
                                  style={[
                                    styles().viewAllText,
                                    { color: primaryColor }
                                  ]}
                                >
                                  View All
                                </Text>
                                <MaterialIcons
                                  name='arrow-forward-ios'
                                  size={14}
                                  color={primaryColor}
                                />
                              </TouchableOpacity>
                            </View>
                            {popularItemLoading ? (
                              <ListLoadingComponent count={3} type='product' />
                            ) : (
                              <View>
                                <FlatList
                                  data={popularItem}
                                  horizontal={true}
                                  showsHorizontalScrollIndicator={false}
                                  renderItem={({ item: productItem }) => (
                                    <Products
                                      item={productItem}
                                      horizontal={true}
                                    />
                                  )}
                                  keyExtractor={(productItem, index) =>
                                    `offers-${productItem?._id?.toString() || index}-${index}`
                                  }
                                />
                              </View>
                            )}
                          </>
                        )

                      case 'events':
                        // Only show events section if there are events available
                        if (events.length === 0 && !eventsLoading) {
                          return null
                        }
                        return (
                          <>
                            <View style={styles().sectionHeader}>
                              <TextDefault style={styles().sectionTitle}>
                                Flash Sale ⚡
                              </TextDefault>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('AllPopularItems', {
                                    type: 'events'
                                  })
                                }
                                style={styles().viewAllButton}
                              >
                                <Text
                                  style={[
                                    styles().viewAllText,
                                    { color: primaryColor }
                                  ]}
                                >
                                  View All
                                </Text>
                                <MaterialIcons
                                  name='arrow-forward-ios'
                                  size={14}
                                  color={primaryColor}
                                />
                              </TouchableOpacity>
                            </View>
                            {eventsLoading ? (
                              <ListLoadingComponent count={3} type='product' />
                            ) : (
                              <View>
                                <FlatList
                                  data={events}
                                  horizontal={true}
                                  showsHorizontalScrollIndicator={false}
                                  renderItem={({ item: eventItem }) => (
                                    <Products
                                      item={eventItem}
                                      horizontal={true}
                                    />
                                  )}
                                  keyExtractor={(eventItem, index) =>
                                    `events-${eventItem?._id?.toString() || index}-${index}`
                                  }
                                />
                              </View>
                            )}
                          </>
                        )

                      // case 'latest':
                      //   return (
                      //     <>
                      //       <View style={styles().sectionHeader}>
                      //         <TextDefault style={styles().sectionTitle}>{getNewOnAppText()}</TextDefault>
                      //         <TouchableOpacity
                      //           onPress={() => navigation.navigate('AllPopularItems', { type: 'latest' })}
                      //           style={styles().viewAllButton}
                      //         >
                      //           <Text style={[styles().viewAllText, { color: primaryColor }]}>
                      //             View All
                      //           </Text>
                      //           <MaterialIcons name="arrow-forward-ios" size={14} color={primaryColor} />
                      //         </TouchableOpacity>
                      //       </View>
                      //       {nearbyMarketsLoading ? (
                      //         <ListLoadingComponent count={3} type="nearbyStore" />
                      //       ) : (
                      //         <View >
                      //           <FlatList
                      //             data={latestItem}
                      //             horizontal={true}
                      //             showsHorizontalScrollIndicator={false}
                      //             renderItem={({ item: productItem, index }) => (
                      //               <CategoryListView data={{ item: productItem, index }} />
                      //             )}
                      //             keyExtractor={(productItem, index) => `latest-${productItem?._id?.toString() || index}-${index}`}
                      //           />
                      //         </View>
                      //       )}
                      //     </>
                      //   );

                      case 'popular':
                        return (
                          <>
                            <View style={styles().sectionHeader}>
                              <TextDefault style={styles().sectionTitle}>
                                Most Popular Items 🔥
                              </TextDefault>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('AllPopularItems')
                                }
                                style={styles().viewAllButton}
                              >
                                <Text
                                  style={[
                                    styles().viewAllText,
                                    { color: primaryColor }
                                  ]}
                                >
                                  View All
                                </Text>
                                <MaterialIcons
                                  name='arrow-forward-ios'
                                  size={14}
                                  color={primaryColor}
                                />
                              </TouchableOpacity>
                            </View>
                            {popularItemLoading ? (
                              <ListLoadingComponent count={3} type='product' />
                            ) : (
                              <View>
                                <FlatList
                                  data={popularItem}
                                  horizontal={true}
                                  showsHorizontalScrollIndicator={false}
                                  renderItem={({ item: productItem }) => (
                                    <Products
                                      item={productItem}
                                      horizontal={true}
                                    />
                                  )}
                                  keyExtractor={(productItem, index) =>
                                    `popular-${productItem?._id?.toString() || index}-${index}`
                                  }
                                />
                              </View>
                            )}
                          </>
                        )

                      case 'allProducts':
                        return (
                          <>
                            <TextDefault style={styles().sectionTitle}>
                              All Items 🔥
                            </TextDefault>
                            {allProductsLoading ? (
                              <View style={{ paddingHorizontal: scale(12) }}>
                                <ListLoadingComponent
                                  horizontal={false}
                                  count={3}
                                  type='allStore'
                                />
                              </View>
                            ) : (
                              <View style={{ padding: 10 }}>
                                {allproducts && allproducts.length > 0 ? (
                                  <>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        justifyContent: 'space-between'
                                      }}
                                    >
                                      {allproducts.map((productItem, index) => (
                                        <View
                                          key={`all-items-${productItem?._id?.toString() || index}-${index}`}
                                          style={{
                                            width: '48%',
                                            marginBottom: 10
                                          }}
                                        >
                                          <Products
                                            item={productItem}
                                            horizontal={false}
                                          />
                                        </View>
                                      ))}
                                    </View>
                                    {allProductsLoadingMore && (
                                      <View
                                        style={{
                                          paddingVertical: 20,
                                          alignItems: 'center',
                                          width: '100%'
                                        }}
                                      >
                                        <ActivityIndicator
                                          size='large'
                                          color={primaryColor}
                                        />
                                        <Text
                                          style={{
                                            marginTop: 8,
                                            fontSize: 14,
                                            color: textColor
                                          }}
                                        >
                                          Loading more products...
                                        </Text>
                                      </View>
                                    )}
                                  </>
                                ) : (
                                  <View
                                    style={{
                                      flex: 1,
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      padding: 20,
                                      minHeight: 200
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        color: currentTheme.fontSecondColor,
                                        textAlign: 'center'
                                      }}
                                    >
                                      No products found
                                    </Text>
                                  </View>
                                )}
                              </View>
                            )}
                          </>
                        )

                      default:
                        return null
                    }
                  }}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </View>

          {/* Modal */}
          {/* <MainModalize
            modalRef={modalRef}
            currentTheme={currentTheme}
            isLoggedIn={isLoggedIn}
            addressIcons={addressIcons}
            modalHeader={modalHeader}
            modalFooter={modalFooter}
            setAddressLocation={setAddressLocation}
            profile={profile}
            location={location}
          /> */}
        </View>
      </SafeAreaView>
      <BottomTab screen='HOME' />
    </>
  )
}

export default Menu
