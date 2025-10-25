import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { View, TouchableOpacity, StatusBar, Platform, Alert } from 'react-native'
import navigationService from '../../routes/navigationService'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ActiveOrders from '../../components/MyOrders/ActiveOrders'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import styles from './styles'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { scale } from '../../utils/scaling'
import Analytics from '../../utils/analytics'
import OrdersContext from '../../context/Orders'
import { HeaderBackButton } from '@react-navigation/elements'
import { useTranslation } from 'react-i18next'
import ReviewModal from '../../components/Review'
import AuthContext from '../../context/Auth'
import { API_URL } from '../../config/api'
import { useAppBranding } from '../../utils/translationHelper'
import BottomTab from '../../components/BottomTab/BottomTab'

const orderStatusActive = ['PENDING', 'PICKED', 'ACCEPTED', 'ASSIGNED', 'PROCESSING']

function MyOrders(props) {
  const reviewModalRef = useRef()
  const [reviewInfo, setReviewInfo] = useState()
  const analytics = Analytics()
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const branding = useAppBranding()
  const inset = useSafeAreaInsets()
  const { token } = useContext(AuthContext)

  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoading] = useState(true)
  const [errorOrders, setError] = useState(null)

  // Fetch orders when component mounts
  useEffect(() => {
    fetchOrders()
  }, [])

  // Fetch orders from the API
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }

      // Fetch orders using the user's phone number
      const response = await fetch(
        `${API_URL}/orders/history`,
        {
          method: 'GET',
          headers: headers,
        }
      )
      
      const data = await response.json()
      
      if (response.ok) {
        if (!data || !data.orders) {
          throw new Error('No orders data received')
        }
        setOrders(data.orders)
      } else {
        throw new Error(data.message || 'Failed to fetch orders')
      }
    } catch (err) {
      setError(err.message)
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const activeOrders = useMemo(() => {
    return orders.filter(o => orderStatusActive.includes(o.status?.toUpperCase()))
  }, [orders])

  const openReviewModal = () => {
    reviewModalRef.current.open()
  }

  const closeReviewModal = () => {
    reviewModalRef.current.close()
  }

  const onPressReview = (order, selectedRating) => {
    setReviewInfo({order, selectedRating})
    openReviewModal()
  }

  // Reload orders function for pull-to-refresh
  const reloadOrders = () => {
    fetchOrders()
  }

  useEffect(() => {
    async function Track() {
      await analytics.track(analytics.events.NAVIGATE_TO_MYORDERS)
    }
    Track()
  }, [])
  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(branding.headerColor)
    }
    StatusBar.setBarStyle('dark-content')
  })
  useEffect(() => {
    props.navigation.setOptions({
      headerRight: null,
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=""
          backImage={() => (
            <View style={styles().backButton}>
              <MaterialIcons name="arrow-back" size={25} color="white" />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      ),
      headerTitle: 'My Orders',
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18
      },
      headerTitleContainerStyle: {
        marginTop: '2%',
        paddingLeft: scale(25),
        paddingRight: scale(25),
        height: '75%',
        marginLeft: 0
      },
      headerStyle: {
        backgroundColor: branding.headerColor,
        elevation: 0,
        shadowOpacity: 0
      },
      headerTintColor: 'white'
    })
  }, [props.navigation])

  return (
    <>
      <StatusBar
        backgroundColor={branding.headerColor}
        barStyle="dark-content"
        translucent={false}
      />
      <View style={[styles(currentTheme).container, { backgroundColor: branding.backgroundColor }]}>
        <ActiveOrders
          navigation={props.navigation}
          activeOrders={activeOrders}
          loading={loadingOrders}
          error={errorOrders}
          reFetchOrders={reloadOrders}
        />
        <View
          style={{
            paddingBottom: inset.bottom,
            backgroundColor: branding.backgroundColor
          }}
        />
      </View>
      <BottomTab screen="ORDERS" />
      <ReviewModal 
        ref={reviewModalRef} 
        onOverlayPress={closeReviewModal} 
        theme={currentTheme} 
        orderId={reviewInfo?.order?.id || reviewInfo?.order?._id} 
        rating={reviewInfo?.selectedRating}
      />
    </>
  )
}

export default MyOrders
