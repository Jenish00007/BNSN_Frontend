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
  const appBranding = useAppBranding();

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
    Linking.openURL('mailto:bnsn.info@gmail.com');
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
            <Text style={styles.faqQuestion}>How do I track my order?</Text>
            <Text style={styles.faqAnswer}>
              You can track your order in real-time through the "My Orders" section of the app. 
              Once your order is placed, you'll receive updates about its status.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
            <Text style={styles.faqAnswer}>
              We accept all major credit cards, debit cards, and digital payment methods. 
              Some restaurants may also accept cash on delivery.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I change my delivery address?</Text>
            <Text style={styles.faqAnswer}>
              You can update your delivery address in the "Profile" section of the app. 
              Make sure to save the new address before placing your next order.
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
            <Text style={styles.contactText}>Email: quads.info@gmail.com</Text>
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
