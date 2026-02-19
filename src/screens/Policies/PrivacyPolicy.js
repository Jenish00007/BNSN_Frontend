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
            We collect information you provide directly to us, such as when you create an account, list an item, or contact us. This may include:{'\n'}
            • Name and contact information{'\n'}
            • Email address and phone number{'\n'}
            • Profile information and preferences{'\n'}
            • Item listings and descriptions{'\n'}
            • Messages and communications
          </Text>

          <Text style={styles.sectionTitle}>
            2. How We Use Your Information
          </Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:{'\n'}
            • Provide, maintain, and improve our services{'\n'}
            • Process transactions and facilitate communication between users{'\n'}
            • Send you technical notices and support messages{'\n'}
            • Respond to your comments and questions{'\n'}
            • Monitor and analyze trends and usage
          </Text>

          <Text style={styles.sectionTitle}>
            3. Information Sharing
          </Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:{'\n'}
            • To comply with legal obligations{'\n'}
            • To protect our rights and safety{'\n'}
            • With service providers who assist us in operating our platform{'\n'}
            • In connection with a business transfer or acquisition
          </Text>

          <Text style={styles.sectionTitle}>
            4. Data Security
          </Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </Text>

          <Text style={styles.sectionTitle}>
            5. Your Rights
          </Text>
          <Text style={styles.paragraph}>
            You have the right to:{'\n'}
            • Access and update your personal information{'\n'}
            • Delete your account and associated data{'\n'}
            • Opt out of certain communications{'\n'}
            • Request a copy of your data
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
            If you have any questions about this Privacy Policy, please contact us:{'\n'}
            Email: {contactInfo?.email || 'support@7ark.com'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 