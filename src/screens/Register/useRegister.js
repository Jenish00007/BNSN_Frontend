import { useState, useContext } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { emailRegex, passRegex, nameRegex } from '../../utils/regex'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../../config/api'

const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/previews/024/183/535/original/male-avatar-portrait-of-a-young-man-with-glasses-illustration-of-male-character-in-modern-color-style-vector.jpg'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const useRegister = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const route = useRoute()

  const [name, setName] = useState('')
  const [email, setEmail] = useState(route.params?.email || '')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [visible, setVisible] = useState(false)

  const [nameError, setNameError] = useState(null)
  const [emailError, setEmailError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [phoneError, setPhoneError] = useState(null)

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  const validateCredentials = () => {
    let result = true
    setEmailError(null)
    setPasswordError(null)
    setNameError(null)
    setPhoneError(null)

    if (!email) {
      setEmailError(t('emailErr1'))
      result = false
    } else if (!emailRegex.test(email.trim())) {
      setEmailError(t('emailErr2'))
      result = false
    }

    if (!password) {
      setPasswordError(t('passErr1'))
      result = false
    } else if (passRegex.test(password) !== true) {
      setPasswordError(t('passErr2'))
      result = false
    }

    if (!name) {
      setNameError(t('nameErr1'))
      result = false
    } else if (!nameRegex.test(name)) {
      setNameError(t('nameErr2'))
      result = false
    }

    if (!phoneNumber) {
      setPhoneError(t('phoneErr1'))
      result = false
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneError(t('phoneErr2'))
      result = false
    }

    return result
  }

  const registerAction = async () => {
    if (validateCredentials()) {
      try {
        console.log('Starting registration with:', {
          name,
          email: email.toLowerCase().trim(),
          phoneNumber
        });

        const config = { 
          headers: { 
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          } 
        }

        const newForm = new FormData()
        
        // Add the default avatar
        newForm.append("file", {
          uri: DEFAULT_AVATAR,
          type: 'image/jpeg',
          name: 'avatar.jpg'
        })
        newForm.append("name", name)
        newForm.append("email", email.toLowerCase().trim())
        newForm.append("password", password)
        newForm.append("phoneNumber", phoneNumber)

        console.log('Sending registration request with form data:', {
          name,
          email: email.toLowerCase().trim(),
          phoneNumber,
          hasFile: true
        });

        const apiResponse = await api.post(
          '/user/create-user',
          newForm,
          config
        )

        console.log('Registration response:', apiResponse.data);

        if (apiResponse.data && apiResponse.data.success) {
          // Store the token if it's in the response
          if (apiResponse.data.token) {
            await AsyncStorage.setItem('token', apiResponse.data.token)
            console.log('Token stored successfully');
          }

          FlashMessage({
            message: t('registrationSuccess'),
          })

          // Reset form
          setName('')
          setEmail('')
          setPassword('')
          setPhoneNumber('')
          
          // Navigate to login with email
          navigation.replace('Login', {
            email: email.toLowerCase().trim()
          })
        } else {
          throw new Error(apiResponse.data?.message || t('registrationFailed'))
        }
      } catch (error) {
        console.log('Registration error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        FlashMessage({
          message: error.response?.data?.message || 
                 error.response?.data?.error || 
                 error.message ||
                 t('registrationFailed'),
        })
      }
    }
  }

  return {
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
    registerAction,
    themeContext,
    currentTheme
  }
}

export default useRegister
