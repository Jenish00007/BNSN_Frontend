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
          
          
          
        

          <Text style={styles.title}>Terms and Conditions</Text>
          <Text style={styles.lastUpdated}>Last updated: December 2024</Text>

          <Text style={styles.sectionTitle}>
            1. Acceptance of Terms
          </Text>
          <Text style={styles.paragraph}>
            By accessing and using {appName || 'BNSN'}, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>

          <Text style={styles.sectionTitle}>
            2. Use License
          </Text>
          <Text style={styles.paragraph}>
            Permission is granted to temporarily download one copy of {appName || 'BNSN'} for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:{'\n'}
            • Modify or copy the materials{'\n'}
            • Use the materials for any commercial purpose or for any public display{'\n'}
            • Attempt to reverse engineer any software contained on the platform{'\n'}
            • Remove any copyright or other proprietary notations from the materials
          </Text>

          <Text style={styles.sectionTitle}>
            3. User Responsibilities
          </Text>
          <Text style={styles.paragraph}>
            As a user of {appName || 'BNSN'}, you agree to:{'\n'}
            • Provide accurate and truthful information{'\n'}
            • Not post illegal, harmful, or inappropriate content{'\n'}
            • Respect other users and their property{'\n'}
            • Comply with all applicable laws and regulations{'\n'}
            • Not engage in fraudulent or deceptive practices
          </Text>

          <Text style={styles.sectionTitle}>
            4. Prohibited Activities
          </Text>
          <Text style={styles.paragraph}>
            You may not use our service to:{'\n'}
            • Post false, misleading, or deceptive listings{'\n'}
            • Spam or send unsolicited communications{'\n'}
            • Violate any laws or regulations{'\n'}
            • Infringe on intellectual property rights{'\n'}
            • Harass, abuse, or harm other users{'\n'}
            • Attempt to gain unauthorized access to our systems
          </Text>

          <Text style={styles.sectionTitle}>
            5. Transaction Safety
          </Text>
          <Text style={styles.paragraph}>
            {appName || 'BNSN'} provides a platform for users to connect, but we do not:{'\n'}
            • Guarantee the quality or authenticity of items{'\n'}
            • Handle payments or transactions directly{'\n'}
            • Provide insurance for transactions{'\n'}
            • Mediate disputes between users{'\n\n'}
            Users are responsible for their own safety and should meet in public places for transactions.
          </Text>

          <Text style={styles.sectionTitle}>
            6. Limitation of Liability
          </Text>
          <Text style={styles.paragraph}>
            In no event shall {appName || 'BNSN'} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on {appName || 'BNSN'}, even if {appName || 'BNSN'} or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </Text>

          <Text style={styles.sectionTitle}>
            7. Termination
          </Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </Text>

          <Text style={styles.sectionTitle}>
            8. Changes to Terms
          </Text>
          <Text style={styles.paragraph}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
          </Text>

          <Text style={styles.sectionTitle}>
            9. Contact Information
          </Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, please contact us:{'\n'}
            Email: {contactInfo?.email || 'bnsn.info@gmail.com'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 