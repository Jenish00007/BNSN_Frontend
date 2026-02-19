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
export default function RefundPolicy() {
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
            1. Refund Eligibility
          </Text>
          <Text style={styles.paragraph}>
            {appName || 'Our service'} offers refunds under the following circumstances:
            • Incorrect or damaged items received
            • Missing items from your order
            • Quality issues with received products
            • Service not provided as described
          </Text>

          <Text style={styles.sectionTitle}>
            2. Refund Process
          </Text>
          <Text style={styles.paragraph}>
            To request a refund:
            1. Contact our customer support within 24 hours of delivery
            2. Provide order details and reason for refund
            3. Submit clear photos if applicable
            4. Wait for our team to review your request
          </Text>

          <Text style={styles.sectionTitle}>
            3. Refund Timeline
          </Text>
          <Text style={styles.paragraph}>
            Once approved, refunds will be processed within 5-7 business days. The time for the refund to appear in your account depends on your payment method and financial institution.
          </Text>

          <Text style={styles.sectionTitle}>
            4. Non-Refundable Items
          </Text>
          <Text style={styles.paragraph}>
            The following are not eligible for refunds:
            • Completed service orders
            • Perishable items
            • Customized products
            • Items marked as non-refundable
          </Text>

          <Text style={styles.sectionTitle}>
            5. Partial Refunds
          </Text>
          <Text style={styles.paragraph}>
            Partial refunds may be offered in cases where only part of the order is affected or when service delivery was partially completed.
          </Text>

          <Text style={styles.sectionTitle}>
            6. Cancellation Refunds
          </Text>
          <Text style={styles.paragraph}>
            Orders cancelled before processing or shipping will be refunded in full. Orders cancelled after processing may be subject to cancellation fees.
          </Text>

          <Text style={styles.sectionTitle}>
            7. Contact Us
          </Text>
          <Text style={styles.paragraph}>
            For any questions about our refund policy, please contact our customer support team at {contactInfo?.email || 'support@7ark.com'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 