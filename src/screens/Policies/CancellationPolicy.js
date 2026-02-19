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

export default function CancellationPolicy() {
  const themeContext = useContext(ThemeContext);
  const config = useContext(ConfigurationContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const branding = useAppBranding();

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
          {config?.logo && (
            <Image
              source={{ uri: config.logo }}
              style={styles.logo}
            />
          )}

          <Text style={styles.sectionTitle}>
            1. Order Cancellation Window
          </Text>
          <Text style={styles.paragraph}>
            • Orders can be cancelled within 30 minutes of placing the order
            • For scheduled deliveries, cancellation is allowed up to 2 hours before the delivery time
            • Some items may have different cancellation windows based on their nature
          </Text>

          <Text style={styles.sectionTitle}>
            2. Cancellation Process
          </Text>
          <Text style={styles.paragraph}>
            To cancel an order:
            1. Go to 'My Orders' in the app
            2. Select the order you wish to cancel
            3. Click on the 'Cancel Order' button
            4. Select a reason for cancellation
            5. Confirm your cancellation
          </Text>

          <Text style={styles.sectionTitle}>
            3. Cancellation Fees
          </Text>
          <Text style={styles.paragraph}>
            • No cancellation fee if cancelled within 5 minutes of ordering
            • 5% cancellation fee if cancelled after 5 minutes but before vendor acceptance
            • 15% cancellation fee if cancelled after vendor acceptance but before preparation
            • Orders cannot be cancelled once preparation begins
          </Text>

          <Text style={styles.sectionTitle}>
            4. Refund for Cancelled Orders
          </Text>
          <Text style={styles.paragraph}>
            • Full refund for cancellations within 5 minutes
            • Refund minus cancellation fee for other eligible cancellations
            • Refund will be processed to the original payment method
            • Processing time: 5-7 business days
          </Text>

          <Text style={styles.sectionTitle}>
            5. Non-Cancellable Orders
          </Text>
          <Text style={styles.paragraph}>
            The following orders cannot be cancelled:
            • Custom-made items
            • Orders in preparation or shipping
            • Perishable items
            • Special category items marked as non-cancellable
          </Text>

          <Text style={styles.sectionTitle}>
            6. Vendor Cancellation
          </Text>
          <Text style={styles.paragraph}>
            If a vendor cancels your order:
            • You will receive a full refund
            • Additional compensation may be provided
            • Alternative options will be suggested
          </Text>

          <Text style={styles.sectionTitle}>
            7. Contact Us
          </Text>
          <Text style={styles.paragraph}>
            For any questions about our cancellation policy or assistance with cancelling an order, please contact our customer support team at {config?.contactInfo?.email || 'support@7ark.com'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 