import React, { useState, useContext } from 'react'
import {
  Ionicons,
  EvilIcons,
  MaterialIcons,
  MaterialCommunityIcons,
  AntDesign,
  Feather,
  SimpleLineIcons
} from '@expo/vector-icons'
import { scale } from '../../../utils/scaling'
import styles from './styles'
import { TouchableOpacity, View } from 'react-native'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { FlashMessage } from '../../../ui/FlashMessage/FlashMessage'
import {
  useNavigation,
  CommonActions,
  useRoute
} from '@react-navigation/native'
import navigationService from '../../../routes/navigationService'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { HeaderBackButton } from '@react-navigation/elements'
import UserContext from '../../../context/User'
import { useAppBranding } from '../../../utils/translationHelper'

const rippleColor = '#6FCF97'
function BackButton(props) {
  if (props.icon === 'leftArrow') {
    return (
      <Ionicons
        name='arrow-back'
        size={18}
        style={styles().leftIconPadding}
        color={props.iconColor}
      />
    )
  } 
  // else if (props.icon === 'menu') {
  //   return (
  //     <SimpleLineIcons
  //       name='menu'
  //       size={20}
  //       color={props.iconColorDark}
  //       style={styles().leftIconPadding}
  //     />
  //   )
  // }
   else if (props.icon === 'dots') {
    return (
      <MaterialCommunityIcons
        name='dots-vertical'
        size={25}
        color={props.iconColor}
      />
    )
  } else if (props.icon === 'target') {
    return (
      <MaterialIcons name='my-location' size={16} color={props.iconColor} />
    )
  }
   else if (props.icon === 'notification') {
    return <MaterialIcons name='notifications-none' size={26} color={props.iconColor} />
  } 
  else if (props.icon === 'favourite') {
    return <MaterialIcons name='favorite-border' size={26} color={props.iconColor} />
  }
  else {
    return (
      <EvilIcons
        name='close'
        size={16}
        style={styles().leftIconPadding}
        color={props.newIconColor}
      />
    )
  }
}

function LeftButton(props) {
  const navigation = useNavigation()
  if (props.icon === 'back') {
    return (
      <HeaderBackButton
        truncatedLabel=''
        backImage={() =>
          BackButton({ iconColor: props.newIconColor, icon: 'leftArrow' })
        }
        onPress={() => {
          navigationService.goBack()
        }}
      />
    )
  } else if (props.icon === 'close') {
    return (
      <HeaderBackButton
        truncatedLabel=''
        pressColorAndroid={rippleColor}
        labelVisible={false}
        backImage={() =>
          BackButton({ iconColor: props.newIconColor, icon: 'close' })
        }
        onPress={() => {
          navigation.dispatch((state) => {
            const routes = state.routes.filter((r) => r.name === 'Main')
            return CommonActions.reset({
              ...state,
              routes,
              index: 0
            })
          })
        }}
      />
    )
  } else if (props.toggle) {
    return (
      <HeaderBackButton
        truncatedLabel=''
        labelVisible={false}
        backImage={() =>
          BackButton({
            iconColor: props.newIconColor,
            icon: props.toggleValue ? 'leftArrow' : 'close'
          })
        }
        onPress={() =>
          props.toggleValue
            ? navigation.goBack()
            : props.toggleView((prev) => !prev)
        }
      />
    )
  } 
  // else {
  //   return (
  //     <HeaderBackButton
  //       truncatedLabel=''
  //       pressColorAndroid={rippleColor}
  //       labelVisible={false}
  //       backImage={() =>
  //         BackButton({ iconColor: props.newIconColor, icon: 'menu' })
  //       }
  //       onPress={() => navigation.toggleDrawer()}
  //     />
  //   )
  // }
}

function RightButton(props) {
  const { t } = props
  const [password, setPassword] = useState(false)
  const navigation = useNavigation()
  const route = useRoute()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const branding = useAppBranding()
  const { cartCount, isLoggedIn, profile } = useContext(UserContext)
  function showPasswordButton() {
    props.titlePosition((prev) => !prev)
    setPassword((prev) => !prev)
  }
  function clickPasswordButton() {
    props.titlePosition((prev) => !prev)
    setPassword((prev) => !prev)
    props.modalVisible((prev) => !prev)
  }

  function cartIcon() {
    return (
      <View style={styles().rightContainer}>
        <SimpleLineIcons
          name='handbag'
          size={24}
          color="#FFFFFF"
        />
        <View
          style={
            styles(route.name === 'Main' ? 'black' : branding.backgroundColor)
              .absoluteContainer
          }
        >
          <TextDefault
            textColor={branding.backgroundColor}
            style={{ fontSize: scale(12) }}
            center
            bolder
          >
            {cartCount}
          </TextDefault>
        </View>
      </View>
    )
  }

  function navigateCart() {
    if (cartCount > 0) {
      navigation.navigate('Cart')
    } else {
      FlashMessage({
        message: t('cartIsEmpty')
      })
    }
  }
  if (props.icon === 'dots') {
    return (
      <View>
        {password ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles().rightContainer, styles().passwordContainer]}
            onPress={clickPasswordButton}
          >
            <View style={styles(branding.secondaryColor).titlePasswordText}>
              <TextDefault
                style={{ fontSize: scale(11) }}
                textColor={branding.textColor}
                bold
              >
                {t('changePassword')}
              </TextDefault>
            </View>
          </TouchableOpacity>
        ) : (
          <HeaderBackButton
            truncatedLabel=''
            labelVisible={false}
            backImage={() => (
              <View style={styles().rightContainer}>
                {BackButton({ iconColor: "#FFFFFF", icon: 'dots' })}
              </View>
            )}
            onPress={showPasswordButton}
          />
        )}
      </View>
    )
  } else if (props.icon === 'cart') {
    return (
      <View style={{ flexDirection: 'row' }}>
        {cartCount >= 0 && (
          <HeaderBackButton
            truncatedLabel=''
            pressColorAndroid={route.name === 'Main' && rippleColor}
            labelVisible={false}
            backImage={cartIcon}
            onPress={navigateCart}
          />
        )}
      </View>
    )
  } else if (props.icon === 'target') {
    return (
      <HeaderBackButton
        truncatedLabel=''
        pressColorAndroid={rippleColor}
        labelVisible={false}
        backImage={() => (
          <View style={[styles().rightContainer]}>
            {BackButton({ iconColor: props.iconColor, icon: 'target' })}
          </View>
        )}
        onPress={props.onPressRight}
      />
    )
  } else if (props.icon === 'menu') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {/* Favorite Icon */}
        <HeaderBackButton
          truncatedLabel=''
          pressColorAndroid={route.name === 'Main' && rippleColor}
          labelVisible={false}
          backImage={() => (
            <View style={styles().favContainer}>
              {BackButton({ iconColor: "#FFFFFF", icon: 'favourite' })}
            </View>
          )}
          bolder
          onPress={() =>
            isLoggedIn 
              ? navigation.navigate('Favourite')
              : navigation.navigate('CreateAccount')
          }
        />
        {/* Notification Icon */}
        <HeaderBackButton
          truncatedLabel=''
          pressColorAndroid={route.name === 'Main' && rippleColor}
          labelVisible={false}
          backImage={() => (
            <View style={styles().favContainer}>
              {BackButton({ iconColor: "#FFFFFF", icon: 'notification' })}
            </View>
          )}
          bolder
          onPress={() =>
            isLoggedIn 
              ? navigation.navigate('Notification')
              : navigation.navigate('CreateAccount')
          }
        />
      </View>
    )
  } else {
    return null
  }
}
function DarkBackButton(props) {
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const branding = useAppBranding()
  return (
    <View
      style={{
        backgroundColor: props.themeBackground,
        borderRadius: 5,
      }}
    >
      <Ionicons
        name='close-circle-outline'
        size={20}
        style={styles().darkBackArrow}
        color="#FFFFFF"
      />
    </View>
  )
}

function HelpButton({ iconBackground, navigation, t }) {
  const branding = useAppBranding()
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Help')}
      style={[styles().rightContainer, { backgroundColor: iconBackground || branding.primaryColor }]}
    >
      <MaterialIcons name="help-outline" size={24} color="white" />
    </TouchableOpacity>
  )
}

export { BackButton, LeftButton, RightButton, DarkBackButton, HelpButton }
