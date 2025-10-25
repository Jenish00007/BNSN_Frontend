import React, { useLayoutEffect, useContext } from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Image,
  StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import screenOptions from './screenOptions'
import { FontAwesome } from '@expo/vector-icons'
import useRegister from './useRegister'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import ConfigurationContext from '../../context/Configuration'
import { theme } from '../../utils/themeColors'
import { useAppBranding } from '../../utils/translationHelper'

const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/previews/024/183/535/original/male-avatar-portrait-of-a-young-man-with-glasses-illustration-of-male-character-in-modern-color-style-vector.jpg'

function Register(props) {
  const {
    email,
    setEmail,
    emailError,
    name,
    setName,
    nameError,
    password,
    setPassword,
    passwordError,
    phoneNumber,
    setPhoneNumber,
    phoneError,
    visible,
    setVisible,
    registerAction
  } = useRegister()

  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const config = useContext(ConfigurationContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const branding = useAppBranding()

  useLayoutEffect(() => {
    props.navigation.setOptions(
      screenOptions({
        fontColor: branding.textColor,
        backColor: branding.backgroundColor,
        iconColor: branding.primaryColor,
        navigation: props.navigation
      })
    )
  }, [props.navigation])

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles().container, { backgroundColor: branding.backgroundColor }]}
    >
      <StatusBar
        backgroundColor={branding.headerColor}
        barStyle="light-content"
        translucent={false}
        animated={true}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles().keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles().scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles().mainContainer}>
            <View style={styles().headerContainer}>
              <Image
                source={branding.logo}
                style={styles().logo}
              />
              <TextDefault style={[styles().title, { color: branding.textColor }]}>
                {t('letsGetStarted')}
              </TextDefault>
              <TextDefault style={[styles().subtitle, { color: branding.textColor }]}>
                {t('createAccount')}
              </TextDefault>
            </View>

            <View style={styles().formContainer}>
              <View style={styles().inputContainer}>
                <TextInput
                  placeholder={t('email')}
                  style={[
                    styles().input,
                    { 
                      color: branding.textColor,
                      borderColor: emailError ? '#FF3B30' : branding.textColor,
                      backgroundColor: branding.secondaryColor
                    }
                  ]}
                  placeholderTextColor={branding.textColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailError && (
                  <TextDefault style={[styles().errorText, { color: '#FF3B30' }]}>
                    {emailError}
                  </TextDefault>
                )}
              </View>

              <View style={styles().inputContainer}>
                <TextInput
                  placeholder={t('Name')}
                  style={[
                    styles().input,
                    { 
                      color: branding.textColor,
                      borderColor: nameError ? '#FF3B30' : branding.textColor,
                      backgroundColor: branding.secondaryColor
                    }
                  ]}
                  placeholderTextColor={branding.textColor}
                  value={name}
                  onChangeText={setName}
                />
                {nameError && (
                  <TextDefault style={[styles().errorText, { color: '#FF3B30' }]}>
                    {nameError}
                  </TextDefault>
                )}
              </View>

              <View style={styles().inputContainer}>
                <TextInput
                  placeholder={t('phoneNumber')}
                  style={[
                    styles().input,
                    { 
                      color: branding.textColor,
                      borderColor: phoneError ? '#FF3B30' : branding.textColor,
                      backgroundColor: branding.secondaryColor
                    }
                  ]}
                  placeholderTextColor={branding.textColor}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {phoneError && (
                  <TextDefault style={[styles().errorText, { color: '#FF3B30' }]}>
                    {phoneError}
                  </TextDefault>
                )}
              </View>

              <View style={styles().inputContainer}>
                <View style={[
                  styles().passwordInputWrapper,
                  { 
                    borderColor: passwordError ? '#FF3B30' : branding.textColor,
                    backgroundColor: branding.secondaryColor
                  }
                ]}>
                  <TextInput
                    secureTextEntry={!visible}
                    placeholder={t('password')}
                    style={[
                      styles().passwordInput,
                      { color: branding.textColor }
                    ]}
                    placeholderTextColor={branding.textColor}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setVisible(!visible)}
                    style={styles().eyeButton}
                  >
                    <FontAwesome
                      name={visible ? 'eye' : 'eye-slash'}
                      size={24}
                      color={branding.textColor}
                    />
                  </TouchableOpacity>
                </View>
                {passwordError && (
                  <TextDefault style={[styles().errorText, { color: '#FF3B30' }]}>
                    {passwordError}
                  </TextDefault>
                )}
              </View>

              <TouchableOpacity
                style={[styles().button, { backgroundColor: branding.buttonColor }]}
                onPress={registerAction}
                activeOpacity={0.7}
              >
                <TextDefault style={[styles().buttonText, { color: branding.textColor }]}>
                  {t('createAccount')}
                </TextDefault>
              </TouchableOpacity>

              {/* <View style={styles().dividerContainer}>
                <View style={[styles().divider, { backgroundColor: currentTheme.borderColor }]} />
                <TextDefault style={[styles().dividerText, { color: currentTheme.fontSecondColor }]}>
                  or sign up with
                </TextDefault>
                <View style={[styles().divider, { backgroundColor: currentTheme.borderColor }]} />
              </View>

              <TouchableOpacity
                style={[styles().phoneButton, { borderColor: currentTheme.borderColor }]}
                onPress={() => props.navigation.navigate('PhoneSignup')}
                activeOpacity={0.8}
              >
                <View style={[styles().phoneIconContainer, { backgroundColor: currentTheme.themeBackground }]}>
                  <Ionicons name="phone-portrait-outline" size={24} color={currentTheme.fontMainColor} />
                </View>
                <TextDefault style={[styles().phoneButtonText, { color: currentTheme.fontMainColor }]}>
                  Continue with Phone Number
                </TextDefault>
              </TouchableOpacity> */}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Register
