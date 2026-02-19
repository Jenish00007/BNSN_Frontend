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

const BuyContacts = () => {
  const navigation = useNavigation()
  const { addContactCredits, subscriptionLoading } = useSubscription()
  const { primaryColor, textColor, backgroundColor } = useAppBranding()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const [processingPayment, setProcessingPayment] = useState(false)

  const contactPackages = [
    {
      credits: 7,
      price: 49,
      description: 'Perfect for getting started',
      popular: true
    },
    {
      credits: 15,
      price: 99,
      description: 'Best value for regular users',
      popular: false
    },
    {
      credits: 30,
      price: 199,
      description: 'Great for power users',
      popular: false
    }
  ]

  const handlePurchase = async (credits, price) => {
    setProcessingPayment(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const success = await addContactCredits(credits)
      
      if (success) {
        Alert.alert(
          'Payment Successful!',
          `You've successfully purchased ${credits} contact credits!`,
          [
            {
              text: 'Great!',
              onPress: () => navigation.goBack()
            }
          ]
        )
      } else {
        Alert.alert('Error', 'Failed to process payment. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      Alert.alert('Error', 'Payment failed. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  if (subscriptionLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading contact packages...
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
          Buy Contact Credits
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: primaryColor + '20' }]}>
            <MaterialIcons name="contact-phone" size={60} color={primaryColor} />
          </View>
          <Text style={[styles.heroTitle, { color: textColor }]}>
            Get More Contact Views
          </Text>
          <Text style={[styles.heroSubtitle, { color: textColor + '80' }]}>
            Purchase credits to view more seller contact information. Each contact can be viewed multiple times with a single credit.
          </Text>
        </View>

        <View style={styles.packagesSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Choose Your Package
          </Text>
          
          {contactPackages.map((pkg, index) => (
            <View 
              key={index}
              style={[
                styles.packageCard,
                pkg.popular && styles.popularCard,
                { borderColor: pkg.popular ? primaryColor : currentTheme.border }
              ]}
            >
              {pkg.popular && (
                <View style={[styles.popularBadge, { backgroundColor: primaryColor }]}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}
              
              <View style={styles.packageHeader}>
                <Text style={[styles.credits, { color: primaryColor }]}>
                  {pkg.credits}
                </Text>
                <Text style={[styles.creditsLabel, { color: textColor }]}>
                  Contact Credits
                </Text>
              </View>
              
              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: primaryColor }]}>
                  ₹{pkg.price}
                </Text>
              </View>
              
              <Text style={[styles.description, { color: textColor + '80' }]}>
                {pkg.description}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  pkg.popular 
                    ? { backgroundColor: primaryColor }
                    : { backgroundColor: primaryColor, opacity: 0.8 }
                ]}
                onPress={() => handlePurchase(pkg.credits, pkg.price)}
                disabled={processingPayment}
                activeOpacity={0.8}
              >
                {processingPayment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.purchaseButtonText}>
                    Buy {pkg.credits} Credits
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <MaterialIcons name="info" size={20} color={primaryColor} />
            <Text style={[styles.infoText, { color: textColor + '80' }]}>
              One credit allows you to view one unique contact. You can view the same contact multiple times without using additional credits.
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialIcons name="security" size={20} color={primaryColor} />
            <Text style={[styles.infoText, { color: textColor + '80' }]}>
              Secure payment processing. Your credits will be added immediately after successful payment.
            </Text>
          </View>
        </View>

        <Text style={[styles.termsText, { color: textColor + '60' }]}>
          By purchasing credits, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default BuyContacts
