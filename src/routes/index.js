import React, { useContext, useEffect, useCallback } from 'react'
import { theme } from '../utils/themeColors'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import navigationService from './navigationService'
import * as Notifications from 'expo-notifications'
// import Login from '../screens/Login/Login'
import Login from '../screens/Login/Login'
import Register from '../screens/Register/Register'
import ForgotPassword from '../screens/ResetPassword/ForgotPassword'
import ResetWithOTP from '../screens/ResetPassword/ResetWithOTP'
import SetYourPassword from '../screens/ForgotPassword/SetYourPassword'
// import CreateAccount from '../screens/CreateAccount/CreateAccount'
import CreateAccount from '../screens/CreateAccount/CreateAccount'
import SideBar from '../components/Sidebar/Sidebar'
import ItemDetail from '../screens/ItemDetail/ItemDetail'
import MyOrders from '../screens/MyOrders/MyOrders'
import Cart from '../screens/Cart/Cart'
import SaveAddress from '../screens/SaveAddress/SaveAddress'
import RateAndReview from '../screens/RateAndReview/RateAndReview'
import Payment from '../screens/Payment/Payment'
import Help from '../screens/Help/Help'
import StripeCheckout from '../screens/Stripe/StripeCheckout'
import Profile from '../screens/Profile/Profile'
import Addresses from '../screens/Addresses/Addresses'
import NewAddress from '../screens/NewAddress/NewAddress'
import EditAddress from '../screens/EditAddress/EditAddress'
import CartAddress from '../screens/CartAddress/CartAddress'
import FullMap from '../screens/FullMap/FullMap'
import OrderDetail from '../screens/OrderDetail/OrderDetail'
import Settings from '../screens/Settings/Settings'
import HelpBrowser from '../screens/HelpBrowser/HelpBrowser'
import Main from '../screens/Main/Main'
import Restaurant from '../screens/Restaurant/Restaurant'
import About from '../screens/About/About'
import SelectLocation from '../screens/SelectLocation'
import AddNewAddress from '../screens/SelectLocation/AddNewAddress'
import CurrentLocation from '../screens/CurrentLocation'
import screenOptions from './screenOptions'
import { LocationContext } from '../context/Location'

import Favourite from '../screens/Favourite/Favourite'

import { DarkBackButton } from '../components/Header/HeaderIcons/HeaderIcons'
import EmailOtp from '../screens/Otp/Email/EmailOtp'
import SubCategory from '../screens/SubCategory/SubCategory'
import PhoneOtp from '../screens/Otp/Phone/PhoneOtp'
import ForgotPasswordOtp from '../screens/Otp/ForgotPassword/ForgetPasswordOtp'
import PhoneNumber from '../screens/PhoneNumber/PhoneNumber'
import { useApolloClient, gql } from '@apollo/client'
import { myOrders } from '../apollo/queries'
import Checkout from '../screens/Checkout/Checkout'
import Menu from '../screens/Menu/Menu'
import AllPopularItems from '../screens/Menu/AllPopularItems'
import AllCategories from '../screens/Menu/AllCategories'
import useEnvVars from '../../environment'
import * as Sentry from '@sentry/react-native'
import {
  initializeSentry,
  addBreadcrumb,
  setUserContext
} from '../utils/sentryUtils'
import SearchModal from '../components/Address/SearchModal'
import { Searchbar } from 'react-native-paper'
import SearchPage from '../screens/Searchbar/Searchbar'
import Notification from '../screens/Notification/Notification'
import ProductDetails from '../screens/ProductDetail/ProductDetails'
import Options from '../screens/Options/Options'
import OrderSummary from '../screens/OrderSummary/OrderSummary'
import OrderConfirmation from '../screens/OrderConfirmation/Orderconfirmation'
import TermsAndConditions from '../screens/Policies/TermsAndConditions'
import PrivacyPolicy from '../screens/Policies/PrivacyPolicy'
import RefundPolicy from '../screens/Policies/RefundPolicy'
import CancellationPolicy from '../screens/Policies/CancellationPolicy'
import ShippingPolicy from '../screens/Policies/ShippingPolicy'
import ChangePassword from '../screens/ResetPassword/ChangePassword'
import PhoneLogin from '../screens/PhoneLogin/PhoneLogin'
import PhoneSignup from '../screens/PhoneSignup/PhoneSignup'
import AuthContext from '../context/Auth'
import ThemeContext from '../ui/ThemeContext/ThemeContext'
import { useAppBranding } from '../utils/translationHelper'
import ConfigurationContext from '../context/Configuration'
import ChatList from '../screens/ChatList/ChatList'
import Chat from '../screens/Chat/Chat'
import MyAds from '../screens/MyAds/MyAds'
import Sell from '../screens/Sell/Sell'
import CreateAd from '../screens/Sell/CreateAd'

const NavigationStack = createStackNavigator()
const MainStack = createStackNavigator()
const SideDrawer = createDrawerNavigator()
const Location = createStackNavigator()

function Drawer() {
  return (
    <SideDrawer.Navigator drawerContent={(props) => <SideBar {...props} />}>
      <SideDrawer.Screen
        options={{ headerShown: false }}
        name='NoDrawer'
        component={NoDrawer}
      />
    </SideDrawer.Navigator>
  )
}
function NoDrawer() {
  const themeContext = useContext(ThemeContext)
  const branding = useAppBranding()
  const { getAppType } = useContext(ConfigurationContext)
  const appType = getAppType ? getAppType() : undefined

  return (
    <NavigationStack.Navigator
      screenOptions={screenOptions({
        theme: themeContext.ThemeValue,
        headerMenuBackground: branding.headerColor,
        backColor: branding.headerColor,
        lineColor: branding.borderColor,
        textColor: branding.textColor,
        iconColor: branding.textColor
      })}
    >
      {appType === 'singlevendor' && (
        <NavigationStack.Screen name='Menu' component={Menu} />
      )}
      {appType === 'multivendor' && (
        <NavigationStack.Screen name='Main' component={Main} />
      )}
      <NavigationStack.Screen
        options={{ header: () => null }}
        name='AllPopularItems'
        component={AllPopularItems}
      />
      <NavigationStack.Screen
        options={{ header: () => null }}
        name='AllCategories'
        component={AllCategories}
      />
      <NavigationStack.Screen
        name='Restaurant'
        component={Restaurant}
        options={{ header: () => null }}
      />
      {<NavigationStack.Screen name='ItemDetail' component={ItemDetail} />}
      <NavigationStack.Screen name='Cart' component={Cart} />
      <NavigationStack.Screen name='Checkout' component={Checkout} />
      <NavigationStack.Screen name='Options' component={Profile} />
      <NavigationStack.Screen name='SearchPage' component={SearchPage} />
      <NavigationStack.Screen name='Addresses' component={Addresses} />
      <NavigationStack.Screen name='NewAddress' component={NewAddress} />
      <NavigationStack.Screen name='EditAddress' component={EditAddress} />
      <NavigationStack.Screen name='FullMap' component={FullMap} />
      <NavigationStack.Screen name='CartAddress' component={CartAddress} />
      <NavigationStack.Screen name='SubCategory' component={SubCategory} />
      <NavigationStack.Screen name='Payment' component={Payment} />
      <NavigationStack.Screen
        name='OrderDetail'
        component={OrderDetail}
        options={{
          headerBackImage: () =>
            DarkBackButton({
              iconColor: branding.textColor,
              iconBackground: branding.secondaryColor
            })
        }}
      />
      <NavigationStack.Screen name='Settings' component={Settings} />
      <NavigationStack.Screen name='MyOrders' component={MyOrders} />

      <NavigationStack.Screen name='Help' component={Help} />
      <NavigationStack.Screen name='HelpBrowser' component={HelpBrowser} />
      <NavigationStack.Screen
        name='About'
        component={About}
        options={{ header: () => null }}
      />

      <NavigationStack.Screen name='RateAndReview' component={RateAndReview} />

      <NavigationStack.Screen
        name='StripeCheckout'
        component={StripeCheckout}
      />

      {/* Authentication Login */}
      <NavigationStack.Screen name='CreateAccount' component={CreateAccount} />
      <NavigationStack.Screen name='Login' component={Login} />
      <NavigationStack.Screen name='Register' component={Register} />
      <NavigationStack.Screen name='PhoneLogin' component={PhoneLogin} />
      <NavigationStack.Screen name='PhoneSignup' component={PhoneSignup} />
      <NavigationStack.Screen name='PhoneNumber' component={PhoneNumber} />
      <NavigationStack.Screen
        name='ForgotPassword'
        component={ForgotPassword}
      />
      <NavigationStack.Screen
        name='SetYourPassword'
        component={SetYourPassword}
      />
      <NavigationStack.Screen name='EmailOtp' component={EmailOtp} />
      <NavigationStack.Screen name='PhoneOtp' component={PhoneOtp} />
      <NavigationStack.Screen
        name='ForgotPasswordOtp'
        component={ForgotPasswordOtp}
      />
      <NavigationStack.Screen
        name='SelectLocation'
        component={SelectLocation}
      />
      <NavigationStack.Screen name='AddNewAddress' component={AddNewAddress} />
      <NavigationStack.Screen name='SaveAddress' component={SaveAddress} />
      <NavigationStack.Screen name='Favourite' component={Favourite} />

      <NavigationStack.Screen name='Notification' component={Notification} />
      <NavigationStack.Screen name='ProductDetail' component={ProductDetails} />
      <NavigationStack.Screen name='Profile' component={Options} />
      <NavigationStack.Screen name='OrderSummary' component={OrderSummary} />
      <NavigationStack.Screen name='OrderDetails' component={OrderDetail} />
      <NavigationStack.Screen
        name='OrderConfirmation'
        component={OrderConfirmation}
      />

      {/* Policy Screens */}
      <NavigationStack.Screen
        name='TermsAndConditions'
        component={TermsAndConditions}
      />
      <NavigationStack.Screen name='PrivacyPolicy' component={PrivacyPolicy} />
      <NavigationStack.Screen name='RefundPolicy' component={RefundPolicy} />
      <NavigationStack.Screen
        name='CancellationPolicy'
        component={CancellationPolicy}
      />
      <NavigationStack.Screen
        name='ShippingPolicy'
        component={ShippingPolicy}
      />

      <NavigationStack.Screen
        name='ChangePassword'
        component={ChangePassword}
      />

      <NavigationStack.Screen name='ResetWithOTP' component={ResetWithOTP} />
      {/* Chat Screens */}
      <NavigationStack.Screen
        name='Chats'
        component={ChatList}
        options={{ title: 'Messages' }}
      />
      <NavigationStack.Screen
        name='Chat'
        component={Chat}
        options={({ route }) => ({
          title: route.params?.groupTitle || 'Chat'
        })}
      />
      {/* My Ads Screen */}
      <NavigationStack.Screen
        name='MyAds'
        component={MyAds}
        options={{ title: 'My Ads' }}
      />
      <NavigationStack.Screen
        name='CreateAd'
        component={CreateAd}
        options={{ headerShown: false }}
      />
      {/* Sell Screen */}
      <NavigationStack.Screen
        name='Sell'
        component={Sell}
        options={{ title: 'Sell' }}
      />
    </NavigationStack.Navigator>
  )
}

function LocationStack() {
  return (
    <Location.Navigator>
      <Location.Screen
        name='CurrentLocation'
        component={CurrentLocation}
        options={{ header: () => null }}
      />
      <Location.Screen name='SelectLocation' component={SelectLocation} />
      <Location.Screen name='AddNewAddress' component={AddNewAddress} />
      <Location.Screen name='Menu' component={Menu} />
    </Location.Navigator>
  )
}

function AppContainer() {
  const client = useApolloClient()
  const { location } = useContext(LocationContext)
  const { SENTRY_DSN } = useEnvVars()
  const lastNotificationResponse = Notifications.useLastNotificationResponse()
  const { token, isLoading, profile } = useContext(AuthContext)

  const handleNotification = useCallback(
    async (response) => {
      const { _id } = response.notification.request.content.data
      const lastNotificationHandledId = await AsyncStorage.getItem(
        '@lastNotificationHandledId'
      )
      await client.query({
        query: gql`
          ${myOrders}
        `,
        fetchPolicy: 'network-only'
      })
      const identifier = response.notification.request.identifier
      if (lastNotificationHandledId === identifier) return
      await AsyncStorage.setItem('@lastNotificationHandledId', identifier)
      navigationService.navigate('OrderDetail', {
        _id
      })
    },
    [lastNotificationResponse]
  )

  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data?.type ===
        'order' &&
      lastNotificationResponse.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      handleNotification(lastNotificationResponse)
    }
  }, [lastNotificationResponse])

  useEffect(() => {
    // Initialize Sentry in both development and production environments
    if (SENTRY_DSN) {
      initializeSentry({
        dsn: SENTRY_DSN,
        environment: __DEV__ ? 'development' : 'production',
        enableInExpoDevelopment: true,
        debug: __DEV__, // Enable debug mode in development
        tracesSampleRate: __DEV__ ? 1.0 : 0.1, // Higher sample rate in development
        enableTracing: true,
        beforeSend(event) {
          // In development, you might want to filter certain events
          if (__DEV__) {
            // You can add development-specific filtering here
            console.log('Sentry event:', event)
          }
          return event
        },
        beforeBreadcrumb(breadcrumb) {
          return breadcrumb
        }
      })

      console.log(
        `Sentry enabled in ${__DEV__ ? 'development' : 'production'} mode`
      )
    } else {
      console.log('Sentry DSN not found, Sentry disabled')
    }
  }, [SENTRY_DSN])

  // Set user context when profile changes
  useEffect(() => {
    if (profile) {
      setUserContext(profile)
      addBreadcrumb('User logged in', 'auth', { userId: profile._id })
    } else {
      setUserContext(null)
      addBreadcrumb('User logged out', 'auth')
    }
  }, [profile])

  if (isLoading) {
    return null // Or a loading screen component
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={(ref) => {
          navigationService.setGlobalRef(ref)
        }}
        onStateChange={(state) => {
          // Add navigation breadcrumbs
          if (state?.routes?.length > 0) {
            const currentRoute = state.routes[state.index]
            addBreadcrumb(`Navigated to ${currentRoute.name}`, 'navigation', {
              routeName: currentRoute.name,
              params: currentRoute.params
            })
          }
        }}
      >
        <MainStack.Navigator initialRouteName={'Drawer'}>
          <MainStack.Screen
            options={{ headerShown: false }}
            name='Drawer'
            component={Drawer}
          />
          <MainStack.Screen
            options={{ headerShown: false }}
            name='Login'
            component={Login}
          />
        </MainStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default Sentry.withProfiler(AppContainer)
