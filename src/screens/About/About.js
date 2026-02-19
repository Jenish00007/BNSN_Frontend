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
  const { contactInfo, ...appBranding } = useAppBranding();

  
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
            Your trusted marketplace for buying and selling locally
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            At {appBranding.appName || 'BNSN'}, we believe that everyone should have access to a simple, safe, and free platform to buy and sell items in their local community. Our mission is to connect neighbors and build local communities through trusted trading.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Do</Text>
          <Text style={styles.sectionText}>
            {appBranding.appName || 'BNSN'} is a classified ads marketplace where you can post free ads for anything you want to sell - from cars and electronics to furniture and clothing. Buyers can browse thousands of listings, contact sellers directly, and complete transactions locally.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          <Text style={styles.sectionText}>
            • 100% Free: Post unlimited ads at no cost. No hidden fees, ever.{'\n'}
            • Local Focus: Connect with buyers and sellers in your neighborhood.{'\n'}
            • Safe & Secure: We provide safety guidelines and tips for secure transactions.{'\n'}
            • Easy to Use: Simple interface that works on any device.{'\n'}
            • Trusted Platform: Join thousands of users buying and selling safely every day.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.sectionText}>
            {appBranding.appName || 'BNSN'} was founded with a simple vision: to make buying and selling as easy as possible for everyone. We recognized that people needed a trusted, local platform where they could safely trade items with neighbors.
          </Text>
          <Text style={styles.sectionText}>
            Today, we're proud to serve thousands of users daily, helping them find great deals and sell items they no longer need. We're committed to building a vibrant local marketplace that benefits everyone in the community.
          </Text>
        </View>

        <View style={styles.missionSection}>
          <Text style={styles.missionTitle}>Contact Us</Text>
          <Text style={styles.missionText}>
            Have questions or feedback? We'd love to hear from you!{'\n\n'}
            Email: {contactInfo?.email || 'support@7ark.com'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}