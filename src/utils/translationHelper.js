import React, { useContext } from 'react'
import ThemeContext from '../ui/ThemeContext/ThemeContext'
import ConfigurationContext from '../context/Configuration'
import { theme } from './themeColors'
import Constants from 'expo-constants'


export const useAppBranding = () => {
  const themeContext = useContext(ThemeContext)
  const configuration = useContext(ConfigurationContext)
  const themeValue = themeContext?.ThemeValue || 'Pink'
  const currentTheme = theme[themeValue] || theme.Pink || theme.Dark
  
  // Get configuration data from service
  const contactInfo = configuration?.getContactInfo?.() || {}
  const homepageContent = configuration?.getHomepageContent?.() || {}
  
  // Get app configuration from app.json via Constants
  const appConfig = Constants.expoConfig || {}
  
  // Get primary color from app.json splash screen background color
  const splashBackgroundColor = appConfig.splash?.backgroundColor
  
  // Ensure currentTheme has all required properties with fallbacks
  const safeTheme = {
    secondaryBackground:  '#ECECEC',
    tagColor: splashBackgroundColor,
    fontMainColor:  '#212121',
    themeBackground:  '#fff',
    primaryColor:  splashBackgroundColor
  }
  
  return {
    // App Configuration (from app.json)
    appName: appConfig.name,
    appVersion: appConfig.version,
    appSlug: appConfig.slug,
    packageId: appConfig.ios?.bundleIdentifier,
    versionCode: appConfig.android?.versionCode,
    
    // App Icons and Assets
    appIcon: appConfig.icon,
    splashBackground: appConfig.splash?.backgroundColor,
    splashResizeMode: appConfig.splash?.resizeMode,
    
    // Theme and Branding Colors
    primaryColor: safeTheme.primaryColor,
    secondaryColor: safeTheme.secondaryBackground,
    headerColor: safeTheme.primaryColor,
    whiteColorText: safeTheme.themeBackground,
    accentColor: safeTheme.secondaryBackground,
    textColor: safeTheme.fontMainColor,
    backgroundColor: safeTheme.themeBackground,
    buttonColor: safeTheme.primaryColor,
    
    // Logo Assets (with fallbacks)
    logo: require('../../assets/logo.png'),
    splashLogo: require('../../assets/splash.png'),
    appLogo: require('../../assets/logo.png'),
    
    // Contact Information
    contactInfo: {
      email: contactInfo?.email || '',
      phone: contactInfo?.phone || ''
    },
    
    // Homepage Content
    homepageContent: {
      title: homepageContent?.title,
      description: homepageContent?.description 
    },
    
    // Cart Styling
    cartCardBackground: safeTheme.secondaryBackground,
    cartCardBorder: safeTheme.fontMainColor,
    cartPriceColor: safeTheme.primaryColor,
    cartDiscountColor: safeTheme.primaryColor,
    cartDeleteColor: safeTheme.primaryColor,
    cartQuantityButtonBg: safeTheme.primaryColor,
    cartQuantityButtonText: safeTheme.fontMainColor,
    cartTotalSectionBg: safeTheme.secondaryBackground,
    cartDividerColor: safeTheme.fontMainColor,
    
    // Platform-specific configurations
    platform: {
      ios: {
        bundleIdentifier: appConfig.ios?.bundleIdentifier ,
        supportsTablet: appConfig.ios?.supportsTablet || true,
        googleMapsApiKey: appConfig.ios?.config?.googleMapsApiKey || ''
      },
      android: {
        package: appConfig.android?.package,
        versionCode: appConfig.android?.versionCode,
        googleMapsApiKey: appConfig.android?.config?.googleMaps?.apiKey || ''
      }
    },
    
    // Notification Configuration
    notification: {
      color: appConfig.notification?.color,
      icon: appConfig.notification?.icon ,
      androidCollapsedTitle: appConfig.notification?.androidCollapsedTitle 
    },
    
    // Add more branding properties as needed
  }
}

export default useAppBranding 