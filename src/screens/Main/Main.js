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
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  ScrollView,
  Animated,
  FlatList,
  RefreshControl
} from 'react-native'
import {
  MaterialIcons,
  AntDesign,
  SimpleLineIcons
} from '@expo/vector-icons'
import { useMutation, useQuery, gql } from '@apollo/client'
import { useCollapsibleSubHeader } from 'react-navigation-collapsible'
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import { useLocation } from '../../ui/hooks'
import Search from '../../components/Main/Search/Search'
import UserContext from '../../context/User'
import { restaurantList, restaurantListPreview } from '../../apollo/queries'
import { selectAddress } from '../../apollo/mutations'
import { scale } from '../../utils/scaling'
import styles from './styles'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import navigationOptions from './navigationOptions'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { LocationContext } from '../../context/Location'
import { alignment } from '../../utils/alignment'
import analytics from '../../utils/analytics'
import { useTranslation } from 'react-i18next'
import MainRestaurantCard from '../../components/Main/MainRestaurantCard/MainRestaurantCard'
import { TopBrands } from '../../components/Main/TopBrands'
import Item from '../../components/Main/Stores/Item'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import useHomeRestaurants from '../../ui/hooks/useRestaurantOrderInfo'
import ErrorView from '../../components/ErrorView/ErrorView'
import ActiveOrders from '../../components/Main/ActiveOrders/ActiveOrders'
import MainLoadingUI from '../../components/Main/LoadingUI/MainLoadingUI'
import TopBrandsLoadingUI from '../../components/Main/LoadingUI/TopBrandsLoadingUI'
import Spinner from '../../components/Spinner/Spinner'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import MainModalize from '../../components/Main/Modalize/MainModalize'

import { escapeRegExp } from '../../utils/regex'
import CarouselSlider from '../../components/Slider/Slider'
import BottomTab from '../../components/BottomTab/BottomTab'
import NewAddress from '../NewAddress/NewAddress'
import NewFiggoStore from '../../components/NewFiggoStore/NewFiggoStore'
import { useAppBranding } from '../../utils/translationHelper'
import { API_URL } from '../../config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

const RESTAURANTS = gql`
  ${restaurantListPreview}
`
const SELECT_ADDRESS = gql`
  ${selectAddress}
`
function Main(props) {
  const Analytics = analytics()

  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const { loadingOrders, isLoggedIn, profile } = useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const [search, setSearch] = useState('')
  const modalRef = useRef(null)
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const branding = useAppBranding()
  const { getCurrentLocation } = useLocation()
  const locationData = location
  const [hasActiveOrders, setHasActiveOrders] = useState(false)

  //Added
  const [stores, setStores] = useState([]);
  const [loadingdata, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [storeSearch, setStoreSearch] = useState([]);

  // Add loading placeholder component
  const ListLoadingComponent = ({ horizontal = true, count = 3, type = 'store' }) => {
    // Define sizes based on type
    const sizes = {
      banner: { width: '100%', height: scale(150) },
      category: { width: scale(80), height: scale(80) },
      store: { width: scale(150), height: scale(180) },
      nearbyStore: { width: scale(200), height: scale(120) },
      offer: { width: scale(200), height: scale(120) },
      product: { width: scale(130), height: scale(160) },
      allStore: { width: '100%', height: scale(120) },
      featuredStore: { width: scale(200), height: scale(220) }
    };

    const currentSize = sizes[type];

    return (
      <View style={{ 
        flexDirection: horizontal ? 'row' : 'column',
        paddingHorizontal: scale(12)
      }}>
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
            }}>
            <Placeholder
              Animation={props => (
                <Fade
                  {...props}
                  style={{ backgroundColor: currentTheme.placeHolderColor }}
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
  };

  useEffect(() => {
    // Function to fetch data from API
    const fetchStores = async () => {
      try {
        // Get authentication token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        
        const response = await fetch(
          `${API_URL}/shops/latest`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );

        const json = await response.json();
        console.log('Featured stores API response:', json);
        
        if (json.success && json.shops) {
          // Use data as-is from backend without remapping
          setStores(json.shops);
        } else {
          console.error('Error: No shops found or invalid response format');
          setStores([]);
        }
      } catch (error) {
        console.error('Error fetching featured stores:', error);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);


  useEffect(() => {
    // Function to fetch all stores for search
    const SearchStores = async () => {
      try {
        // Get authentication token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        
        // Using the same endpoint but could be a different one for all shops
        const response = await fetch(
          `${API_URL}/shops/latest`, // You might want to create a separate endpoint for all shops
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
          }
        );

        const json = await response.json();
        console.log('Search stores API response:', json);
        
        if (json.success && json.shops) {
          // Use data as-is from backend without remapping
          setStoreSearch(json.shops);
        } else {
          console.error('Error: No shops found for search or invalid response format');
          setStoreSearch([]);
        }
      } catch (error) {
        console.error('Error fetching search stores:', error);
        setStoreSearch([]);
      }
    };

    SearchStores();
  }, []);



  useEffect(() => {
    const fetchBanners = async () => {
      setBannersLoading(true);
      try {
        const response = await fetch(`${API_URL}/admin-banner/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'zoneId': '[1]',
            'moduleId': '1'
          }
        });
        const json = await response.json();
        if (json?.banners && json.banners.length > 0) {
          setBanners(json.banners);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setBannersLoading(false);
      }
    };
    fetchBanners();
  }, []);


  const {  refetch, networkStatus, loading, error } = useQuery(
    RESTAURANTS,
    {
      variables: {
        longitude: location.longitude || null,
        latitude: location.latitude || null,
        shopType: null,
        ip: null
      },
      fetchPolicy: 'network-only'
    }
  )

  const [mutate, { loading: mutationLoading }] = useMutation(SELECT_ADDRESS, {
    onError
  })
  
 

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(branding.headerColor)
    }
    StatusBar.setBarStyle('dark-content')
  })
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_MAIN)
    }
    Track()
  }, [])
  useLayoutEffect(() => {
    navigation.setOptions(
      navigationOptions({
        headerMenuBackground: branding.headerColor,
        fontMainColor: branding.textColor,
        iconColorPink: branding.textColor,
        iconColor: "#FFFFFF",
        locationColor: "#FFFFFF",
        locationLabelColor: "#FFFFFF",
        open: onOpen,
        navigation
      })
    )
  }, [navigation, branding])

  const onOpen = () => {
    const modal = modalRef.current
    if (modal) {
      modal.open()
    }
  }

  function onError(error) {
    console.log(error)
  }

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }

  const {
    onScroll /* Event handler */,
    containerPaddingTop /* number */,
    scrollIndicatorInsetTop /* number */
  } = useCollapsibleSubHeader()

  // Fallback values in case the hook returns undefined
  const safeContainerPaddingTop = containerPaddingTop || 0
  const safeScrollIndicatorInsetTop = scrollIndicatorInsetTop || 0

  const setAddressLocation = async (address) => {
    setLocation({
      _id: address._id,
      label: address.label,
      latitude: Number(address.location.coordinates[1]),
      longitude: Number(address.location.coordinates[0]),
      deliveryAddress: address.deliveryAddress,
      details: address.details
    })
    mutate({ variables: { id: address._id } })
    modalRef.current.close()
  }

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
          console.log(address)
        }
      })
      .catch((error) => {
        console.error('Error fetching reverse geocoding data:', error)
      })
  }

  const modalHeader = () => (
    <View style={[styles().addNewAddressbtn]}>
      <View style={styles({...currentTheme, primaryColor: branding.primaryColor}).addressContainer}>
        <TouchableOpacity
          style={[styles({...currentTheme, primaryColor: branding.primaryColor}).addButton]}
          activeOpacity={0.7}
          onPress={setCurrentLocation}
          disabled={busy}
        >
          <View style={styles().addressSubContainer}>
            {
              busy ? <Spinner size='small' /> : (
                <>
                  <SimpleLineIcons name="target" size={scale(18)} color={branding.textColor} />
                  <View style={styles().mL5p} />
                  <TextDefault bold>{t('currentLocation')}</TextDefault>
                </>
              )
            }
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )

  const emptyView = () => {
    if (loading || mutationLoading || loadingOrders) return <MainLoadingUI />
    else {
      return (
        <View style={styles({...currentTheme, primaryColor: branding.primaryColor}).emptyViewContainer}>
          <View style={styles({...currentTheme, primaryColor: branding.primaryColor}).emptyViewBox}>
            <TextDefault bold H4 center textColor={currentTheme.fontMainColor}>
              {t('notAvailableinYourArea')}
            </TextDefault>
            <TextDefault textColor={currentTheme.fontGrayNew} center>
              {t('noRestaurant')}
            </TextDefault>
          </View>
        </View>
      )
    }
  }

  const modalFooter = () => (
    <View style={styles().addNewAddressbtn}>
      <View style={styles({...currentTheme, primaryColor: branding.primaryColor}).addressContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles({...currentTheme, primaryColor: branding.primaryColor}).addButton}
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate('AddNewAddress', {
                ...locationData
              })
            } else {
              const modal = modalRef.current
              modal?.close()
              props.navigation.navigate({
                name: 'CreateAccount'
              })
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

 

 
  const searchAllShops = (searchText) => {
    const data = [];
    const escapedSearchText = escapeRegExp(searchText);
    const regex = new RegExp(escapedSearchText, 'i');

    // Use storeSearch array for searching
    storeSearch?.forEach((store) => {
      // Check if store.name exists and matches the regex
      if (store.name && regex.test(store.name)) {
        data.push(store); // Add the store to the data array if it matches
      }
    });

    return data; // Return the filtered stores
  };


  // if (error) return <ErrorView />

  return (
    <>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles().flex]}>
        <View style={[styles().flex, styles({...currentTheme, primaryColor: branding.primaryColor}).screenBackground]}>
          <View style={styles().flex}>
            <View style={styles().mainContentContainer}>
              <View style={[styles().flex, styles().subContainer]}>
                <View style={styles({...currentTheme, primaryColor: branding.primaryColor}).searchbar}>
                  <Search
                    setSearch={setSearch}
                    search={search}
                    newheaderColor={branding.headerColor}
                    placeHolder={t('Search Products')}
                  />
                </View>
                {search ? (
                  <View style={styles().searchList}>
                    <Animated.FlatList
                      contentInset={{
                        top: safeContainerPaddingTop
                      }}
                      contentContainerStyle={{
                        paddingTop:
                          Platform.OS === 'ios' ? 0 : safeContainerPaddingTop
                      }}
                      contentOffset={{
                        y: -safeContainerPaddingTop
                      }}
                      onScroll={onScroll}
                      scrollIndicatorInsets={{
                        top: safeScrollIndicatorInsetTop
                      }}
                      showsVerticalScrollIndicator={false}
                      ListEmptyComponent={emptyView()}
                      keyExtractor={(item) => item.id.toString()}
                      refreshControl={
                        <RefreshControl
                          progressViewOffset={safeContainerPaddingTop}
                          colors={[branding.primaryColor]}
                          refreshing={networkStatus === 4}
                          onRefresh={() => {
                            if (networkStatus === 7) {
                              refetch()
                            }
                          }}
                        />
                      }
                      data={searchAllShops(search)}

                      renderItem={({ item }) => (
                        <NewFiggoStore item={item} />
                      )}
                    />
                  </View>
                ) : (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                  >

                    <View style={{ padding: 10 }}>
                      {bannersLoading ? (
                        <ListLoadingComponent horizontal={false} count={1} type="banner" />
                      ) : banners.length > 0 ? (
                        <CarouselSlider banners={banners} />
                      ) : null}
                    </View>

                    <View style={styles().mainItemsContainer}>
                      <TouchableOpacity
                        style={styles().mainItem}
                        onPress={() =>
                          navigation.navigate('Menu', {
                            selectedType: 'restaurant', moduleId: '4'
                          })
                        }
                      >
                        <View>


                        </View>
                        <Image
                          source={require('../../assets/images/ItemsList/4.png')}
                          style={styles().popularMenuImg}
                        // resizeMode='contain'
                        />
                        <TextDefault
                          H4
                          bolder
                          textColor={currentTheme.fontThirdColor}
                          style={styles().ItemName}
                        >
                          {t('foodDelivery')}
                        </TextDefault>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles().mainItem}
                        onPress={() =>
                          navigation.navigate('Menu', {
                            selectedType: 'grocery', moduleId: '1'
                          })
                        }
                      >
                        <View>


                        </View>
                        <Image
                          source={require('../../assets/images/ItemsList/2.png')}
                          style={styles().popularMenuImg}
                        // resizeMode='contain'
                        />
                        <TextDefault
                          H4
                          bolder
                          textColor={currentTheme.fontThirdColor}
                          style={styles().ItemName}
                        >
                          {t('grocery')}
                        </TextDefault>
                      </TouchableOpacity>

                    </View>

                    <View>
                      <View>
                        {loadingdata ? (
                          <View>
                            <TextDefault H4 bold style={styles().sectionTitle}>
                              Featured Stores
                            </TextDefault>
                            <ListLoadingComponent count={3} type="featuredStore" />
                          </View>
                        ) : (
                          <MainRestaurantCard
                            orders={stores}
                            title={'Featured Stores'}
                          />
                        )}
                      </View>
                    </View>
                   
                  </ScrollView>
                )}
              </View>
            </View>
          </View>
        
          <MainModalize
            modalRef={modalRef}
            currentTheme={currentTheme}
            isLoggedIn={isLoggedIn}
            addressIcons={addressIcons}
            modalHeader={modalHeader}
            modalFooter={modalFooter}
            setAddressLocation={setAddressLocation}
            profile={profile}
            location={location}
          />

        </View>
        <BottomTab screen="HOME" />
      </SafeAreaView>
    </>
  )
}

export default Main
