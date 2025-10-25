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
export default function PrivacyPolicy() {
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
            1. Information We Collect
          </Text>
          <Text style={styles.paragraph}>
            At {appName || 'our service'}, we collect various types of information to provide and improve our service:
            • Personal Information (name, email, phone number)
            • Location Data
            • Device Information
            • Transaction History
            • Usage Data
          </Text>

          <Text style={styles.sectionTitle}>
            2. How We Use Your Information
          </Text>
          <Text style={styles.paragraph}>
            We use the collected information for:
            • Processing your orders
            • Providing customer support
            • Sending important updates
            • Improving our services
            • Personalizing your experience
          </Text>

          <Text style={styles.sectionTitle}>
            3. Data Security
          </Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
          </Text>

          <Text style={styles.sectionTitle}>
            4. Third-Party Services
          </Text>
          <Text style={styles.paragraph}>
            We may employ third-party companies and individuals to facilitate our service, provide service-related services, or assist us in analyzing how our service is used.
          </Text>

          <Text style={styles.sectionTitle}>
            5. Your Rights
          </Text>
          <Text style={styles.paragraph}>
            You have the right to:
            • Access your personal data
            • Correct inaccurate data
            • Request deletion of your data
            • Object to data processing
            • Data portability
          </Text>

          <Text style={styles.sectionTitle}>
            6. Changes to This Policy
          </Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>

          <Text style={styles.sectionTitle}>
            7. Contact Us
          </Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at {contactInfo?.email || 'bnsn.info@gmail.com'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 