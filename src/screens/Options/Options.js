import React, { useContext } from 'react';
import { useEffect, useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  StatusBar,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import Modal from 'react-native-modal';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserContext from '../../context/User';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { theme } from '../../utils/themeColors';

import OptionsStyles from './OptionsStyles';
import RadioButton from '../../ui/FdRadioBtn/RadioBtn';
import i18next from '../../../i18next';
import { useTranslation } from 'react-i18next';
import { useAppBranding } from '../../utils/translationHelper';

// Define languageTypes before using it in state
const languageTypes = [
  { value: 'English (UK)', code: 'en', index: 0, nativeText: 'English', flag: 'https://flagcdn.com/w80/gb.png' },
  { value: 'Egypt (عربي)', code: 'ar', index: 1, nativeText: 'عربي', flag: 'https://flagcdn.com/w80/eg.png' },
  { value: 'India', code: 'hi', index: 2, nativeText: 'हिंदी', flag: 'https://flagcdn.com/w80/in.png' },
  { value: 'Pakistan', code: 'ur', index: 3, nativeText: 'اردو', flag: 'https://flagcdn.com/w80/pk.png' },
  { value: 'Bangladesh', code: 'bn', index: 4, nativeText: 'বাংলাদেশ', flag: 'https://flagcdn.com/w80/bd.png' },
  { value: 'Philippines', code: 'tl', index: 5, nativeText: 'tagalog', flag: 'https://flagcdn.com/w80/ph.png' },
  { value: 'Iran', code: 'fa', index: 6, nativeText: 'فارسی', flag: 'https://flagcdn.com/w80/ir.png' },
  { value: 'Nepal', code: 'ne', index: 7, nativeText: 'नेपाली', flag: 'https://flagcdn.com/w80/np.png' },
  { value: 'Srilanka (sinhala)', code: 'si', index: 8, nativeText: 'සිංහල', flag: 'https://flagcdn.com/w80/lk.png' },
  { value: 'United states (tamil)', code: 'ta', index: 9, nativeText: 'தமிழ்', flag: 'https://flagcdn.com/w80/us.png' }
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { formetedProfileData, logout } = useContext(UserContext);
  const branding = useAppBranding();
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];
  
  
  const { t } = useTranslation();
  

  // Get styles with theme colors
  const styles = OptionsStyles(currentTheme);
  

  const fullName = formetedProfileData ? 
    `${formetedProfileData.name || ''}`.trim() : 
    'Welcome';

  // Language selection state
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [activeRadio, activeRadioSetter] = useState(languageTypes[0].index);
  const [loadinglang, setLoadingLang] = useState(false);

  useEffect(() => {
    selectLanguage();
  }, []);

  async function selectLanguage() {
    const lang = await AsyncStorage.getItem('enatega-language')
    if (lang) {
      const defLang = languageTypes.findIndex((el) => el.code === lang)
      const langName = languageTypes[defLang].value
      activeRadioSetter(defLang)
      setSelectedLanguage(langName)
    }
  }

  async function onSelectedLanguage(selectedIndex) {
    try {
      setLoadingLang(true)
      await AsyncStorage.setItem(
        'enatega-language',
        languageTypes[selectedIndex].code
      )

      const lang = languageTypes[selectedIndex].code
      const langName = languageTypes[selectedIndex].value
      
      setSelectedLanguage(langName)
      activeRadioSetter(selectedIndex)
      await i18next.changeLanguage(lang)
      setLanguageModalVisible(false)
    } catch (error) {
      console.error('Error during language selection:', error)
    } finally {
      setLoadingLang(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
      
        <StatusBar 
          backgroundColor={branding.headerColor} 
          barStyle="dark-content"
        />
        
        {/* Header Section */}
        
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Profile Section */}
        <View style={[styles.profile, { backgroundColor: branding.secondaryColor }]}>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.8}>
            <View style={styles.profileAvatarWrapper}>
              {formetedProfileData?.avatar ? (
                <Image
                  source={{ uri: formetedProfileData.avatar }}
                  style={[styles.profileAvatar, { borderColor: branding.primaryColor }]}
                />
              ) : (
                <View style={[styles.profileAvatar, styles.profileAvatarPlaceholder, { borderColor: branding.primaryColor, backgroundColor: branding.primaryColor + '20' }]}>
                  <Text style={[styles.profileAvatarText, { color: branding.primaryColor }]}>
                    {fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={[styles.profileAction, { backgroundColor: branding.primaryColor, borderColor: branding.secondaryColor }]}>
                <FeatherIcon color="#fff" name="edit-3" size={16} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: branding.textColor }]}>{fullName}</Text>
            <Text style={[styles.profileRole, { color: branding.textColor }]}>Customer</Text>
          </View>
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: branding.textColor }]}>General</Text>

          <View style={[styles.row, { backgroundColor: branding.secondaryColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="mail" size={20} />
            </View>

            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: branding.textColor }]}>Email</Text>
              <Text style={[styles.rowValue, { color: branding.textColor }]}>
                {formetedProfileData?.email || 'Add email'}
              </Text>
            </View>
          </View>

          <View style={[styles.row, { backgroundColor: branding.secondaryColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="phone" size={20} />
            </View>

            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: branding.textColor }]}>Phone Number</Text>
              <Text style={[styles.rowValue, { color: branding.textColor }]}>
                {formetedProfileData?.phoneNumber || ''}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("ChangePassword")}
            style={[styles.row, { backgroundColor: branding.secondaryColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="lock" size={20} />
            </View>

            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: branding.textColor }]}>Change Password</Text>
              <Text style={[styles.rowValue, { color: branding.textColor }]}>
                Change your password
              </Text>
            </View>

            <FeatherIcon
              color={branding.textColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={() => navigation.navigate("ResetPassword")}
            style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: currentTheme.primary }]}>
              <FeatherIcon color="#fff" name="lock" size={20} />
            </View>

            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>
                Reset Password
              </Text>
              <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                Reset your password
              </Text>
            </View>

            <FeatherIcon
              color={currentTheme.fontSecondColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity> */}

          {/* <TouchableOpacity
            onPress={() => navigation.navigate("Addresses")}
            style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: currentTheme.primary }]}>
              <FeatherIcon color="#fff" name="map-pin" size={20} />
            </View>

            <View style={styles.detailContainer} > 
              <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Address</Text>
              <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                {formetedProfileData?.address || 'Add address'}
              </Text>
            </View>

            <FeatherIcon
              color={currentTheme.fontSecondColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity> */}
        </View>

        {/* Preferences Section */}
        {/* <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.fontSecondColor }]}>Preferences</Text>

          <TouchableOpacity
            onPress={() => setLanguageModalVisible(true)}
            style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: currentTheme.primary }]}>
              <FeatherIcon color="#fff" name="globe" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Language</Text>

            <View style={styles.rowSpacer} />
            
            <Text style={[styles.rowValueInline, { color: currentTheme.fontSecondColor }]}>{selectedLanguage}</Text>

            <FeatherIcon
              color={currentTheme.fontSecondColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity>

          <View style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: currentTheme.primary }]}>
              <FeatherIcon color="#fff" name="moon" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Dark Mode</Text>

            <View style={styles.rowSpacer} />

            <Switch
              trackColor={{ false: "#e0e0e0", true: currentTheme.primary }}
              thumbColor={"#fff"}
              onValueChange={darkMode => setForm({ ...form, darkMode })}
              value={form.darkMode} />
          </View>

          <View style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: currentTheme.primary }]}>
              <FeatherIcon color="#fff" name="at-sign" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Email Notifications</Text>

            <View style={styles.rowSpacer} />

            <Switch
              trackColor={{ false: "#e0e0e0", true: currentTheme.primary }}
              thumbColor={"#fff"}
              onValueChange={emailNotifications =>
                setForm({ ...form, emailNotifications })
              }
              value={form.emailNotifications} />
          </View>

          <View style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: currentTheme.primary }]}>
              <FeatherIcon color="#fff" name="bell" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Push Notifications</Text>

            <View style={styles.rowSpacer} />

            <Switch
              trackColor={{ false: "#e0e0e0", true: currentTheme.primary }}
              thumbColor={"#fff"}
              onValueChange={pushNotifications =>
                setForm({ ...form, pushNotifications })
              }
              value={form.pushNotifications} />
          </View>
        </View> */}

        
        {/* Help & Support Section with updated content */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: branding.textColor }]}>Help & Support</Text>

         

          {/* Terms & Conditions with content */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('TermsAndConditions')}
            style={[styles.row, { backgroundColor: branding.secondaryColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="file-text" size={20} />
            </View>
            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: branding.textColor }]}>Terms & Conditions</Text>
              <Text style={[styles.rowValue, { color: branding.textColor }]}>
                View our terms of service
              </Text>
            </View>
            <FeatherIcon color={branding.textColor} name="chevron-right" size={20} />
          </TouchableOpacity>

          {/* Privacy Policy with content */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('PrivacyPolicy')}
            style={[styles.row, { backgroundColor: branding.secondaryColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="shield" size={20} />
            </View>
            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: branding.textColor }]}>Privacy Policy</Text>
              <Text style={[styles.rowValue, { color: branding.textColor }]}>
                Learn how we protect your data
              </Text>
            </View>
            <FeatherIcon color={branding.textColor} name="chevron-right" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.row, { backgroundColor: branding.secondaryColor }]}
            onPress={() => navigation.navigate('Help')}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="help-circle" size={20} />
            </View>
            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: branding.textColor }]}>Help & Support</Text>
              <Text style={[styles.rowValue, { color: branding.textColor }]}>
                Get help with your orders and questions
              </Text>
            </View>
            <FeatherIcon color={branding.textColor} name="chevron-right" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.row, { backgroundColor: branding.secondaryColor }]}
            onPress={() => navigation.navigate('About')}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="info" size={20} />
            </View>
            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: branding.textColor }]}>About Us</Text>
              <Text style={[styles.rowValue, { color: branding.textColor }]}>
                Learn about our mission and values
              </Text>
            </View>
            <FeatherIcon color={branding.textColor} name="chevron-right" size={20} />
          </TouchableOpacity>
          
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={[
            styles.accountActionButton, 
            styles.logoutButton,
            { backgroundColor: branding.primaryColor === 'dark' ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.1)' }
          ]} 
          onPress={handleLogout}
        >
          <FeatherIcon name="log-out" size={20} color="#FF3B30" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        isVisible={languageModalVisible}
        onBackdropPress={() => setLanguageModalVisible(false)}
        onBackButtonPress={() => setLanguageModalVisible(false)}
        backdropOpacity={0.5}
        style={styles.modal}
      >
        <View style={[styles.modalContainer, { backgroundColor: branding.secondaryColor }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setLanguageModalVisible(false)}
              style={styles.backButton}
            >
              <FeatherIcon name="chevron-left" size={24} color={branding.textColor} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: branding.textColor }]}>
              Language
            </Text>
            <View style={styles.headerRight} />
          </View>

          <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
            {languageTypes.map((item, index) => (
              <TouchableOpacity
                activeOpacity={0.7}
                key={index}
                onPress={() => onSelectedLanguage(item.index)}
                style={[styles.languageItem, activeRadio === item.index && styles.selectedLanguageItem]}
              >
                <View style={styles.languageItemLeft}>
                  <Image 
                    source={{ uri: item.flag }} 
                    style={styles.flagIcon} 
                    resizeMode="cover"
                  />
                  <View style={styles.languageTexts}>
                    
                    <Text style={[styles.languageText, { color: branding.textColor }]}>
                      {item.value}
                    </Text>
                    
                    <Text style={[styles.nativeText, { color: branding.textColor }]}>
                      {item.nativeText}
                    </Text>
                  </View>
                </View>
                {activeRadio === item.index && (
                  <View style={styles.checkmarkContainer}>
                    <FeatherIcon name="check" size={24} color="#007AFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {loadinglang && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color={branding.primaryColor} />
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

