import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { useContext } from 'react';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import ConfigurationContext from '../../context/Configuration';
import { theme } from '../../utils/themeColors';
import { useAppBranding } from '../../utils/translationHelper';
export default function ShippingPolicy() {
  const themeContext = useContext(ThemeContext);
  const config = useContext(ConfigurationContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const { appName, appLogo, contactInfo, homepageContent, ...branding } = useAppBranding();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: branding.backgroundColor,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    logo: {
      width: 100,
      height: 100,
      alignSelf: 'center',
      marginBottom: 20,
      resizeMode: 'contain',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 10,
      color: branding.primaryColor,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 15,
      color: branding.textColor,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={branding.headerColor} barStyle="light-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {appLogo && (
            <Image
              source={appLogo}
              style={styles.logo}
            />
          )}

          <Text style={styles.sectionTitle}>
            1. Delivery Areas
          </Text>
          <Text style={styles.paragraph}>
            {appName || 'Our service'} currently delivers to:
            • Major cities and metropolitan areas
            • Selected suburban areas
            • Specific rural locations (subject to availability)
            
            Check your location in the app to confirm delivery availability.
          </Text>

          <Text style={styles.sectionTitle}>
            2. Delivery Times
          </Text>
          <Text style={styles.paragraph}>
            Standard delivery times:
            • Urban areas: 30-45 minutes
            • Suburban areas: 45-60 minutes
            • Peak hours may require additional time
            • Adverse weather conditions may affect delivery times
          </Text>

          <Text style={styles.sectionTitle}>
            3. Shipping Fees
          </Text>
          <Text style={styles.paragraph}>
            Shipping fees are calculated based on:
            • Distance from vendor to delivery location
            • Order value
            • Time of day (peak/off-peak)
            • Special handling requirements
            
            Free delivery may be available on orders above a certain value.
          </Text>

          <Text style={styles.sectionTitle}>
            4. Order Tracking
          </Text>
          <Text style={styles.paragraph}>
            Track your order in real-time through:
            • {appName || 'Our'} mobile app
            • SMS updates
            • Email notifications
            
            Contact support if you experience any issues with tracking.
          </Text>

          <Text style={styles.sectionTitle}>
            5. Delivery Instructions
          </Text>
          <Text style={styles.paragraph}>
            You can provide:
            • Specific drop-off instructions
            • Building access codes
            • Preferred entrance information
            • Contact preferences
            
            Please ensure accurate delivery information to avoid delays.
          </Text>

          <Text style={styles.sectionTitle}>
            6. Failed Deliveries
          </Text>
          <Text style={styles.paragraph}>
            If a delivery fails due to:
            • Incorrect address
            • Customer unavailability
            • Access issues
            
            A redelivery fee may apply or the order may be cancelled with applicable fees.
          </Text>

          <Text style={styles.sectionTitle}>
            7. Contact Us
          </Text>
          <Text style={styles.paragraph}>
            For questions about our shipping policy or to track an order, contact our delivery support team at {contactInfo?.email || 'support@7ark.com'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 