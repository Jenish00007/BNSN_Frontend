import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const setTokenAsync = async (token) => {
    try {
      if (token) {
        console.log("tokens",token)
        await AsyncStorage.setItem('token', token)
      } else {
        await AsyncStorage.removeItem('token')
      }
      setToken(token)
    } catch (error) {
      console.error('Error saving token:', error)
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token')
      setToken(null)
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }


  useEffect(() => {
    let isSubscribed = true
    
    const initializeAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token')
        if (isSubscribed) {
          setToken(storedToken)
        }
      } catch (error) {
        console.error('Error reading token:', error)
      } finally {
        if (isSubscribed) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isSubscribed = false
    }
  }, [])

  return (
    <AuthContext.Provider value={{ 
      token, 
      setToken, 
      setTokenAsync, 
      logout,
      isLoading: loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const AuthConsumer = AuthContext.Consumer
export default AuthContext