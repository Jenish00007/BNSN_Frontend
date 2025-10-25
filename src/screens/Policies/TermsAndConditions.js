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

export default function TermsAndConditions() {
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
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
      color: branding.textColor,
    },
    lastUpdated: {
      fontSize: 14,
      marginBottom: 20,
      textAlign: 'center',
      color: branding.textColor,
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
            1. Acceptance of Terms
          </Text>
          <Text style={styles.paragraph}>
            Welcome to {appName || 'Our Service'}! By accessing or using our mobile application, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our service.
          </Text>

          <Text style={styles.sectionTitle}>
            2. Use of Service
          </Text>
          <Text style={styles.paragraph}>
            {appName || 'Our Service'} provides a multivendor marketplace platform connecting customers with various vendors. Users must be at least 18 years old to create an account and use our services.
          </Text>

          <Text style={styles.sectionTitle}>
            3. User Accounts
          </Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use of your account.
          </Text>

          <Text style={styles.sectionTitle}>
            4. Orders and Payments
          </Text>
          <Text style={styles.paragraph}>
            By placing an order through {appName || 'our service'}, you agree to pay all charges at the prices listed. All payments must be made through our approved payment methods. Prices and availability are subject to change.
          </Text>

          <Text style={styles.sectionTitle}>
            5. Delivery
          </Text>
          <Text style={styles.paragraph}>
            Delivery times are estimates and may vary based on location and other factors. {appName || 'We'} are not responsible for delays caused by circumstances beyond our control.
          </Text>

          <Text style={styles.sectionTitle}>
            6. Modifications
          </Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the app. Your continued use of {config?.appName || 'our service'} constitutes acceptance of any modifications.
          </Text>

          <Text style={styles.sectionTitle}>
            7. Contact Us
          </Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, please contact us at {contactInfo?.email || 'bnsn.info@gmail.com'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 