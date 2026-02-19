import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useSubscription } from '../../context/Subscription'
import { useAppBranding } from '../../utils/translationHelper'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import styles from './styles'

const Subscription = () => {
  const navigation = useNavigation()
  const { activateUnlimitedContacts, subscriptionLoading } = useSubscription()
  const { primaryColor, textColor, backgroundColor } = useAppBranding()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const [processingPayment, setProcessingPayment] = useState(false)

  const handlePurchase = async () => {
    setProcessingPayment(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const success = await activateUnlimitedContacts()
      
      if (success) {
        Alert.alert(
          'Success!',
          'You now have unlimited access to seller contacts!',
          [
            {
              text: 'Great!',
              onPress: () => navigation.goBack()
            }
          ]
        )
      } else {
        Alert.alert('Error', 'Failed to activate subscription. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      Alert.alert('Error', 'Payment failed. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  const features = [
    {
      icon: 'phone',
      title: 'Unlimited Contacts',
      description: 'View unlimited seller phone numbers'
    },
    {
      icon: 'star',
      title: 'Priority Support',
      description: 'Get faster response from sellers'
    },
    {
      icon: 'verified',
      title: 'Verified Sellers',
      description: 'Access to verified seller profiles'
    },
    {
      icon: 'speed',
      title: 'No Limits',
      description: 'Browse without any restrictions'
    }
  ]

  if (subscriptionLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading subscription info...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Upgrade to Premium
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: primaryColor + '20' }]}>
            <MaterialIcons name="phone-locked" size={60} color={primaryColor} />
          </View>
          <Text style={[styles.heroTitle, { color: textColor }]}>
            Unlock Unlimited Contacts
          </Text>
          <Text style={[styles.heroSubtitle, { color: textColor + '80' }]}>
            Get instant access to all seller phone numbers and connect faster
          </Text>
        </View>

        <View style={styles.pricingCard}>
          <View style={styles.priceHeader}>
            <Text style={[styles.price, { color: primaryColor }]}>
              $9.99
            </Text>
            <Text style={[styles.pricePeriod, { color: textColor }]}>
              /month
            </Text>
          </View>
          <Text style={[styles.priceDescription, { color: textColor + '80' }]}>
            Billed monthly. Cancel anytime.
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            What you'll get:
          </Text>
          
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: primaryColor + '20' }]}>
                <MaterialIcons name={feature.icon} size={20} color={primaryColor} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: textColor }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: textColor + '80' }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.guaranteeSection}>
          <View style={[styles.guaranteeBadge, { borderColor: primaryColor }]}>
            <MaterialIcons name="verified" size={20} color={primaryColor} />
            <Text style={[styles.guaranteeText, { color: primaryColor }]}>
              30-day money-back guarantee
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.purchaseButton, { backgroundColor: primaryColor }]}
          onPress={handlePurchase}
          disabled={processingPayment}
          activeOpacity={0.8}
        >
          {processingPayment ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.purchaseButtonText}>
              Upgrade Now - $9.99/month
            </Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.termsText, { color: textColor + '60' }]}>
          By subscribing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Subscription
