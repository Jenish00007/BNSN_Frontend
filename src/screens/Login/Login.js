// Login.js
import React, { useLayoutEffect, useContext } from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  TextInput,
  StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles'
import Spinner from '../../components/Spinner/Spinner'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import { FontAwesome, SimpleLineIcons } from '@expo/vector-icons'
import { useLogin } from './useLogin'
import screenOptions from './screenOptions'
import { useTranslation } from 'react-i18next'
import ConfigurationContext from '../../context/Configuration'
import { useAppBranding } from '../../utils/translationHelper'

function Login(props) {
  const {
    input,
    setInput,
    password,
    setPassword,
    inputError,
    passwordError,
    loading,
    loginAction,
    currentTheme,
    showPassword,
    setShowPassword,
    themeContext
  } = useLogin()
  const { t } = useTranslation()
  const branding = useAppBranding();

  const handleEmailInput = (text) => {
    setInput(text)
  }

  useLayoutEffect(() => {
    props.navigation.setOptions(
      screenOptions({
        backColor: branding.backgroundColor,
        fontColor: branding.textColor,
        iconColor: branding.primaryColor,
        navigation: props.navigation
      })
    )
  }, [props.navigation])

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles(currentTheme).safeAreaViewStyles, { backgroundColor: branding.backgroundColor }]}>
      <StatusBar
        backgroundColor={branding.headerColor}
        barStyle="light-content"
        translucent={false}
        animated={true}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles().flex}>
        <ScrollView
          style={styles().flex}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}>
          <View style={[styles(currentTheme).mainContainer, { backgroundColor: branding.backgroundColor }]}>
            <View style={styles().headerContainer}>
              <Image
                source={branding.logo}
                style={styles().logo}
              />
              <TextDefault style={[styles().title, { color: branding.textColor }]}>Welcome to {branding.appName}!</TextDefault>
              <TextDefault style={[styles().subtitle, { color: branding.textColor }]}>
                Sign in to continue
              </TextDefault>
            </View>

            <View style={styles().formContainer}>
              <View style={styles().inputContainer}>
                <TextInput
                  style={[styles().textField, { 
                    backgroundColor: branding.secondaryColor,
                    color: branding.textColor,
                    borderColor: branding.textColor
                  }]}
                  placeholder="Enter Email or Phone Number"
                  placeholderTextColor={branding.textColor}
                  value={input}
                  onChangeText={handleEmailInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles().inputContainer}>
                <TextInput
                  style={[styles().textField, { 
                    backgroundColor: branding.secondaryColor,
                    color: branding.textColor,
                    borderColor: branding.textColor
                  }]}
                  placeholder="Enter Password"
                  placeholderTextColor={branding.textColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity
                style={[styles().loginBtn, { backgroundColor: branding.buttonColor }]}
                onPress={loginAction}
                disabled={loading}>
                {loading ? (
                  <Spinner size="small" />
                ) : (
                  <TextDefault style={[styles().loginBtnText, { color: branding.textColor }]}>
                    Login
                  </TextDefault>
                )}
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={styles().phoneLoginBtn}
                onPress={() => props.navigation.navigate('PhoneLogin')}>
                <TextDefault style={styles().phoneLoginBtnText}>
                  Continue with Phone
                </TextDefault>
              </TouchableOpacity> */}

              <TouchableOpacity
                style={styles().forgotPasswordBtn}
                onPress={() => props.navigation.navigate('ForgotPassword')}>
                <TextDefault style={[styles().forgotPasswordText, { color: branding.textColor }]}>
                  Forgot Password?
                </TextDefault>
              </TouchableOpacity>

              <View style={styles().signupContainer}>
                <TextDefault style={[styles().signupText, { color: branding.textColor }]}>
                  Don't have an account?{' '}
                </TextDefault>
                <TouchableOpacity onPress={() => props.navigation.navigate('Register')}>
                  <TextDefault style={[styles().signupLink, { color: branding.primaryColor }]}>Sign Up</TextDefault>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Login