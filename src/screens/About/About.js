import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/themeColors';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { useContext } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import ConfigurationContext from '../../context/Configuration';
import { useAppBranding } from '../../utils/translationHelper';


export default function About() {
  const navigation = useNavigation();
  const themeContext = useContext(ThemeContext);
  const config = useContext(ConfigurationContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const appBranding = useAppBranding();

  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.themeBackground,
    },
    header: {
      backgroundColor: config?.appColors?.primary || appBranding.headerColor,
      paddingTop: 20,
      paddingBottom: 15,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      flex: 1,
      textAlign: 'center',
    },
    backButton: {
      padding: 5,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.borderColor,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 20,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.fontMainColor,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: currentTheme.fontSecondColor,
      textAlign: 'center',
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
    sectionText: {
      fontSize: 16,
      color: currentTheme.fontSecondColor,
      lineHeight: 24,
    },
    missionSection: {
      padding: 20,
    },
    missionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: appBranding.primaryColor,
      marginBottom: 15,
    },
    missionText: {
      fontSize: 16,
      color: currentTheme.fontSecondColor,
      lineHeight: 24,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FeatherIcon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About {appBranding.appName}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
         
            <Image
              source={appBranding.logo}
              style={styles.logo}
            />
          
          
          <Text style={styles.title}>{appBranding.appName}</Text>
          <Text style={styles.subtitle}>
            Your trusted partner in grocery delivery
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.sectionText}>
            Founded in 2024, we've been committed to revolutionizing the grocery delivery experience. Our platform connects customers with their favorite restaurants, making it easier than ever to enjoy delicious meals from the comfort of your home.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            To provide a seamless, reliable, and enjoyable grocery delivery experience while supporting 
            local restaurants and creating opportunities for delivery partners.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <Text style={styles.sectionText}>
            • Quality: We ensure the highest standards in grocery delivery{'\n'}
            • Reliability: We're committed to timely and accurate deliveries{'\n'}
            • Innovation: We continuously improve our platform and services{'\n'}
            • Community: We support local businesses and create jobs
          </Text>
        </View>

        <View style={styles.missionSection}>
          <Text style={styles.missionTitle}>Contact Us</Text>
          <Text style={styles.missionText}>
            Have questions or feedback? We'd love to hear from you!{'\n\n'}
            Email: bnsn.info@gmail.com{'\n'}
            Phone: +91 9591727966{'\n'}
            Address: Tirupattur, Tamil Nadu, India
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}