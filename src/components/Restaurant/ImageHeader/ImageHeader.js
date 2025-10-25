import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Dimensions,
  Text,
  // TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'
import {
  MaterialIcons,
  Ionicons,
  Entypo,
  AntDesign,
  SimpleLineIcons,
  MaterialCommunityIcons
} from '@expo/vector-icons'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { useNavigation } from '@react-navigation/native'
import { DAYS } from '../../../utils/enums'
import {
  BorderlessButton,
  RectButton,
  TouchableOpacity
} from 'react-native-gesture-handler'
import { scale } from '../../../utils/scaling'
import { alignment } from '../../../utils/alignment'
import TextError from '../../Text/TextError/TextError'
import { textStyles } from '../../../utils/textStyles'
import { useTranslation } from 'react-i18next'
import Search from '../../../components/Main/Search/Search'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import { FlashMessage } from '../../../ui/FlashMessage/FlashMessage'
import Spinner from '../../Spinner/Spinner'
import UserContext from '../../../context/User'
import { addFavouriteRestaurant } from '../../../apollo/mutations'
import { profile } from '../../../apollo/queries'
import { calculateDistance } from '../../../utils/customFunctions'
import { LocationContext } from '../../../context/Location'
import ConfigurationContext from '../../../context/Configuration'
// Removed animations to fix memory leaks
import AddToFavourites from '../../Favourites/AddtoFavourites'
import { useAppBranding } from '../../../utils/translationHelper'

// Removed animated components to fix memory leaks

const { height } = Dimensions.get('screen')
const TOP_BAR_HEIGHT = height * 0.05
const HEADER_MAX_HEIGHT = height * 0.4
const HEADER_MIN_HEIGHT = height * 0.07 + TOP_BAR_HEIGHT
const SCROLL_RANGE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT

const ADD_FAVOURITE = gql`
  ${addFavouriteRestaurant}
`
const PROFILE = gql`
  ${profile}
`

function ImageTextCenterHeader(props, ref) {
  const { translationY } = props
  const flatListRef = ref
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const branding = useAppBranding()
  const { location } = useContext(LocationContext)
  const { t } = useTranslation()
  const newheaderColor = currentTheme.backgroundColor
  const cartContainer = currentTheme.gray500
  const { profile } = useContext(UserContext)
  const configuration = useContext(ConfigurationContext)
  const heart = profile ? profile.favourite.includes(props.restaurantId) : false
  const [mutate, { loading: loadingMutation }] = useMutation(ADD_FAVOURITE, {
    onCompleted,
    refetchQueries: [{ query: PROFILE }]
  })

  // Removed animation cleanup since animations are removed

  function onCompleted() {
    FlashMessage({ message: t('favouritelistUpdated') })
  }

  const handleAddToFavorites = () => {
    <AddToFavourites restaurantId={props.restaurantId} />
  }

  
  const aboutObject = {
    latitude: props.restaurant?.location?.coordinates?.[1] ?? '',
    longitude: props.restaurant?.location?.coordinates?.[0] ?? '',
    address: props.restaurant?.address ?? '',
    restaurantName: props.restaurantName,
    restaurantImage: props.restaurantImage,
    restaurantTax: props.restaurant?.tax,
    restaurantMinOrder: props.restaurant?.minimum_order,
    deliveryTime: props.restaurant?.delivery_time ?? '...',
    average: props.restaurant?.rating_count ?? '...',
    total: props.restaurant?.avg_rating ?? '...',
    reviews: props.restaurant?.reviews ?? '...',
    isAvailable: props.restaurant?.isAvailable ?? true,
    openingTimes: props.restaurant?.schedules ?? [],
    isOpen: () => {
      if (!props.restaurant) return true
      const date = new Date()
      const day = date.getDay()
      
      // Find today's schedule
      const todaysTimings = props.restaurant.schedules?.find(
        schedule => schedule.day === day
      )
      
      if (!todaysTimings) return false
      
      const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`
      
      // Check if current time is between opening and closing time
      return currentTime >= todaysTimings.opening_time && currentTime <= todaysTimings.closing_time
    }
  }

  // Removed animated styles to fix memory leaks



  // Removed all animated styles to fix memory leaks

  const distance = calculateDistance(
    aboutObject?.latitude,
    aboutObject?.longitude,
    location?.latitude,
    location?.longitude
  )

  // Compute today's business hours from backend-provided structure
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const todayKey = dayNames[new Date().getDay()]
  const todaysHours = props.restaurant?.businessHours?.[todayKey]

  const emptyView = () => {
    return (
      <View
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <TextError text={t('noItemsExists')} />
      </View>
    )
  }

  return (
    <View style={[styles(currentTheme).mainContainer, { height: HEADER_MAX_HEIGHT }]}>
      <View style={[{ height: HEADER_MAX_HEIGHT - TOP_BAR_HEIGHT }]}>
        <View pointerEvents="box-none" style={[styles().overlayContainer]}>
          <View style={[styles().fixedViewNavigation, { zIndex: 20, elevation: 20 }]}>
            <View style={styles().backIcon}>
              {props.searchOpen ? (
                <BorderlessButton
                  activeOpacity={0.7}
                  style={[
                    styles().touchArea,
                    {
                      backgroundColor: props.themeBackground,
                      borderRadius: props.iconRadius,
                      height: props.iconTouchHeight
                    }
                  ]}
                  onPress={props.searchPopupHandler}
                >
                  <Entypo
                    name='cross'
                    color={currentTheme.newIconColor}
                    size={scale(22)}
                  />
                </BorderlessButton>
              ) : (
                <BorderlessButton
                  activeOpacity={0.7}
                  style={[
                    styles().touchArea,
                    {
                      backgroundColor: props.themeBackground,
                      borderRadius: props.iconRadius,
                      height: props.iconTouchHeight
                    }
                  ]}
                  onPress={() => navigation.goBack()}
                >
              
                  <Ionicons
                    name='arrow-back'
                    color={currentTheme.newIconColor}
                    size={scale(22)}
                  />
                </BorderlessButton>
              )}
            </View>
            <View style={styles().center}>
              {!props.searchOpen && (
                <Text
                  numberOfLines={1}
                  style={[styles(currentTheme).headerTitle]}
                >
                  {t('delivery')} {aboutObject.deliveryTime} {t('Min')}
                </Text>
              )}
            </View>
            <View style={styles().fixedIcons} pointerEvents="box-none">
              {props.searchOpen ? (
                <>
                  <Search
                    setSearch={props.setSearch}
                    search={props.search}
                    newheaderColor={newheaderColor}
                    cartContainer={cartContainer}
                    placeHolder={t('searchItems')}
                  />
                </>
              ) : (
                <>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles().touchArea,
                      {
                        backgroundColor: props.themeBackground,
                        borderRadius: props.iconRadius,
                        height: props.iconTouchHeight
                      }
                    ]}
                    onPress={handleAddToFavorites}
                  >
                    {/* <View>
                      {loadingMutation ? (
                        <Spinner
                          size={'small'}
                          backColor={'transparent'}
                          spinnerColor={currentTheme.iconColorDark}
                        />
                      ) : (
                        <AntDesign
                          name={heart ? 'heart' : 'hearto'}
                          size={scale(15)}
                          color={currentTheme.newIconColor}
                        />
                      )}
                    </View> */}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles(currentTheme).touchArea,
                      {
                        backgroundColor: props.themeBackground,
                        borderRadius: props.iconRadius,
                        height: props.iconTouchHeight
                      }
                    ]}
                    onPress={props.searchHandler}
                  >
                    <Ionicons
                      name='search-outline'
                      style={{
                        fontSize: props.iconSize
                      }}
                      color={currentTheme.newIconColor}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          {!props.search && !props.loading && (
            <View pointerEvents="none" style={[styles().restaurantDetails]}>
              <View
                style={[
                  {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: scale(15),
                    marginBottom: scale(20)
                  }
                ]}
              >
                <View style={[styles().restImageContainer]}>
                  <Image
                    resizeMode='cover'
                    source={{ uri: aboutObject.restaurantImage }}
                    style={[styles().restaurantImg]}
                  />
                </View>
                <View style={[styles().restaurantTitle, { flex: 1 }]}>
                  <TextDefault
                    H4
                    bolder
                    textColor={currentTheme.fontMainColor}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >
                    {aboutObject.restaurantName}
                  </TextDefault>
                   {/* Add the AddtoFavourites component here */}
        
                  {/* Store Status and Rating Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(4), justifyContent: 'space-between' }}>
                    {/* Open/Closed Status */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: props.restaurant?.open ? currentTheme.success : currentTheme.error,
                      paddingHorizontal: scale(8),
                      paddingVertical: scale(2),
                      borderRadius: scale(12),
                    }}>
                      <MaterialCommunityIcons 
                        name="clock-outline"
                        size={scale(14)}
                        color={currentTheme.white}
                      />
                      <TextDefault
                        style={{ marginLeft: scale(4) }}
                        textColor={currentTheme.white}
                        small
                      >
                        {props.restaurant?.open ? t('Open') : t('Closed')} 
                      </TextDefault>
                      <TextDefault
                        style={{ marginLeft: scale(4) }}
                        textColor={currentTheme.white}
                        small
                      >
                        {props.restaurant?.delivery_time}
                      </TextDefault>
                    </View>

                    {/* Rating Badge */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: currentTheme.secondaryBackground,
                      paddingHorizontal: scale(8),
                      paddingVertical: scale(2),
                      borderRadius: scale(12),
                    }}>
                      <MaterialIcons
                        name="star"
                        size={scale(14)}
                        color={currentTheme.yellow}
                      />
                      <TextDefault
                        textColor={currentTheme.fontMainColor}
                        style={{ marginLeft: scale(4) }}
                        small
                      >
                        {props.restaurant?.avg_rating} ({props.restaurant?.rating_count})
                      </TextDefault>
                    </View>
                  </View>
                </View>
              </View>

              <View style={{ display: 'flex', flexDirection: 'row', gap: 7 }}>
                <TextDefault
                  style={styles().restaurantAbout}
                  textColor={currentTheme.fontMainColor}
                >
                  {distance.toFixed(2)}km {t('away')}
                </TextDefault>
                <TextDefault
                  style={styles().restaurantAbout}
                  textColor={currentTheme.fontMainColor}
                >
                  |
                </TextDefault>
                <TextDefault
                  style={styles().restaurantAbout}
                  textColor={currentTheme.fontMainColor}
                >
                  ₹{'0'}{aboutObject.restaurantMinOrder} {t('minimum')}
                </TextDefault>
              </View>

              {/* Store Contact Info */}
              <View style={{ marginTop: scale(8) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(5) }}>
                  <MaterialIcons
                    name="phone"
                    size={scale(18)}
                    color={currentTheme.fontMainColor}
                  />
                  <TextDefault
                    style={styles().restaurantAbout}
                    textColor={currentTheme.fontMainColor}
                  >
                    {props.restaurant?.phoneNumber}
                  </TextDefault>
                </View>
              </View>

              {/* Store Address */}
              <View style={{ marginTop: scale(8) }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: scale(5) }}>
                  <MaterialIcons
                    name="location-on"
                    size={scale(18)}
                    color={currentTheme.fontMainColor}
                  />
                  <TextDefault
                    style={[styles().restaurantAbout, { flex: 1 }]}
                    textColor={currentTheme.fontMainColor}
                    numberOfLines={2}
                  >
                    {aboutObject.address}
                  </TextDefault>
                </View>
              </View>

              {/* Store Features */}
              <View style={{ marginTop: scale(8), flexDirection: 'row', flexWrap: 'wrap', gap: scale(10) }}>
                {props.restaurant?.delivery && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(4) }}>
                    <MaterialCommunityIcons
                      name="truck-delivery"
                      size={scale(18)}
                      color={currentTheme.fontMainColor}
                    />
                    <TextDefault
                      style={styles().restaurantAbout}
                      textColor={currentTheme.fontMainColor}
                    >
                      {t('Delivery Available')}
                    </TextDefault>
                  </View>
                )}
                
                {props.restaurant?.take_away && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(4) }}>
                    <MaterialCommunityIcons
                      name="shopping"
                      size={scale(18)}
                      color={currentTheme.fontMainColor}
                    />
                    <TextDefault
                      style={styles().restaurantAbout}
                      textColor={currentTheme.fontMainColor}
                    >
                      {t('Takeaway Available')}
                    </TextDefault>
                  </View>
                )}
              </View>

              {/* Store Hours */}
              <View style={{ marginTop: scale(8) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(5) }}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={scale(18)}
                    color={currentTheme.fontMainColor}
                  />
                  <TextDefault
                    style={styles().restaurantAbout}
                    textColor={currentTheme.fontMainColor}
                  >
                    {todaysHours?.isOpen ? t('Open') : t('Closed')} {todaysHours ? `(${todaysHours.openTime} - ${todaysHours.closeTime})` : ''}
                  </TextDefault>
                </View>
              </View>

              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 7,
                  marginTop: scale(10)
                }}
              >
                <TextDefault
                  style={styles().restaurantAbout}
                  textColor={currentTheme.fontMainColor}
                >
                  {props.restaurant?.delivery ? t('Delivery Available') : ''} 
                  {props.restaurant?.delivery && props.restaurant?.take_away ? ' | ' : ''}
                  {props.restaurant?.take_away ? t('Takeaway Available') : ''}
                </TextDefault>
              </View>
            </View>
          )}
        </View>
      </View>

      {!props.search && (
        <>
          {!props.loading && (
           
            <FlatList
              ref={flatListRef}
              style={styles(currentTheme).flatListStyle}
              contentContainerStyle={{ flexGrow: 1 }}
              data={props.loading ? [] : props.topaBarData}
              horizontal={true}
              ListEmptyComponent={null}
              showsHorizontalScrollIndicator={false}
              onScrollToIndexFailed={({ index }) => {
                flatListRef.current?.scrollToOffset?.({ animated: true, offset: Math.max(0, index - 1) * 100 })
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex?.({ animated: true, index, viewPosition: 0.5 })
                }, 80)
              }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <View
                  style={
                    props.selectedLabel === index
                      ? styles(currentTheme, branding).activeHeader
                      : null
                  }
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    onPress={() => {
                      // Ensure parent receives the press first to load products
                      if (props.onItemPress) {
                        props.onItemPress(item.id)
                      }
                      // Then update the visual selection state
                      props.changeIndex(index)
                    }}
                    style={styles(currentTheme, branding).headerContainer}
                  >
                    <View style={styles().navbarTextContainer}>
                      <TextDefault
                        style={
                          props.selectedLabel === index
                            ? textStyles.Bolder
                            : textStyles.H5
                        }
                        textColor={
                          props.selectedLabel === index
                            ? currentTheme.fontFourthColor
                            : currentTheme.gray500
                        }
                        center
                        H5
                      >
                        {item.name}
                      </TextDefault>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </>
      )}
    </View>
  )
}

export default React.forwardRef(ImageTextCenterHeader)
