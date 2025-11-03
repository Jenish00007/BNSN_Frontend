import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/themeColors';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { useContext } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useAppBranding } from '../../utils/translationHelper';

export default function Help() {
  const navigation = useNavigation();
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const { appName, contactInfo, ...appBranding } = useAppBranding();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: appBranding.backgroundColor,
    },
    header: {
      backgroundColor: appBranding.headerColor,
      paddingTop: 20,
      paddingBottom: 15,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
      flex: 1,
      textAlign: 'center',
    },
    backButton: {
      padding: 5,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.borderColor,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: appBranding.primaryColor,
      marginBottom: 15,
    },
    faqItem: {
      marginBottom: 15,
      backgroundColor: currentTheme.itemCardColor,
      borderRadius: 8,
      padding: 15,
      borderLeftWidth: 4,
      borderLeftColor: appBranding.primaryColor,
    },
    faqQuestion: {
      fontSize: 16,
      fontWeight: '500',
      color: appBranding.textColor,
      marginBottom: 8,
    },
    faqAnswer: {
      fontSize: 14,
      color: currentTheme.fontSecondColor,
      lineHeight: 20,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.itemCardColor,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
    },
    contactIcon: {
      marginRight: 15,
    },
    contactText: {
      fontSize: 16,
      color: appBranding.textColor,
    },
  });

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${contactInfo?.email || 'bnsn.info@gmail.com'}`);
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+919591727966');
  };

  return (
    <SafeAreaView style={styles.container}>
     

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I post an ad?</Text>
            <Text style={styles.faqAnswer}>
              To post an ad, simply click the "Post Ad" button on the home screen, fill in the details of your item, add photos, set your price, and publish. Your ad will be live immediately and visible to buyers in your area.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is posting ads free?</Text>
            <Text style={styles.faqAnswer}>
              Yes! Posting ads on {appBranding.appName || 'BNSN'} is completely free. There are no hidden fees, no subscription costs, and no charges for posting as many ads as you want.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I contact a seller?</Text>
            <Text style={styles.faqAnswer}>
              When you find an item you're interested in, click on it to view details. You'll see the seller's contact information or a "Contact Seller" button to send them a message directly through the app.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I edit or delete my ad?</Text>
            <Text style={styles.faqAnswer}>
              Go to "My Ads" in your profile section. From there, you can edit, update, or delete any of your posted ads at any time.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I report a suspicious ad or user?</Text>
            <Text style={styles.faqAnswer}>
              If you come across a suspicious ad or user, click the "Report" button on the ad or user profile. Our team will review the report and take appropriate action to ensure the safety of our platform.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What items can I sell?</Text>
            <Text style={styles.faqAnswer}>
              You can sell almost anything on {appBranding.appName || 'BNSN'} - from cars and electronics to furniture, clothing, and more. However, illegal items, weapons, drugs, and other prohibited items are not allowed. Please refer to our Terms and Conditions for the complete list.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I stay safe when buying/selling?</Text>
            <Text style={styles.faqAnswer}>
              Always meet in a public place, inspect items before purchasing, use cash for transactions, and trust your instincts. Never share personal financial information or send money before seeing the item. For more safety tips, check our Safety Guidelines.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
            <FeatherIcon 
              name="mail" 
              size={24} 
              color={appBranding.primaryColor}
              style={styles.contactIcon}
            />
            <Text style={styles.contactText}>Email: {contactInfo?.email || 'bnsn.info@gmail.com'}</Text>
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <FeatherIcon 
              name="clock" 
              size={24} 
              color={appBranding.primaryColor}
              style={styles.contactIcon}
            />
            <Text style={styles.contactText}>Support Hours: 24/7</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
