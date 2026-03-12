import React, { createContext, useState, useEffect, useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'
import { API_URL } from '../config/api'
import AuthContext from './Auth'
import UserContext from './User'

const SubscriptionContext = createContext({})

export const SubscriptionProvider = ({ children }) => {
  const [contactViewsCount, setContactViewsCount] = useState(0)
  const [viewedContacts, setViewedContacts] = useState([]) // Track unique contact IDs
  const [hasUnlimitedContacts, setHasUnlimitedContacts] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [contactCredits, setContactCredits] = useState(7) // Default to 7 free credits

  // Access contexts safely - provider hierarchy ensures they're available
  const authContext = useContext(AuthContext)
  const userContext = useContext(UserContext)
  
  const token = authContext?.token
  const dataProfile = userContext?.dataProfile

  const FREE_CONTACT_LIMIT = 7

  // Load subscription data from AsyncStorage
  useEffect(() => {
    loadSubscriptionData()
  }, [])

  // Reload subscription data when user profile changes
  useEffect(() => {
    if (dataProfile && dataProfile._id) {
      setUserId(dataProfile._id)
      loadSubscriptionData()
    }
  }, [dataProfile])

  // Fetch user ID from UserContext or API
  const getUserId = async () => {
    try {
      // First try to get user from UserContext
      if (dataProfile && dataProfile._id) {
        setUserId(dataProfile._id)
        return dataProfile._id
      }
      
      // If not in UserContext, try to fetch from API using token
      if (token) {
        const response = await fetch(`${API_URL}/user/getuser`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user && data.user._id) {
            setUserId(data.user._id)
            return data.user._id
          }
        }
      }
      
      // Fallback to AsyncStorage (for backward compatibility)
      const userData = await AsyncStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        setUserId(user._id)
        return user._id
      }
    } catch (error) {
      console.error('Error getting user ID:', error)
    }
    return null
  }

  // Fetch contact views from backend
  const fetchContactViewsFromBackend = async (userId) => {
    if (!userId) return { contactViews: 0, viewedContacts: [] }

    try {
      const response = await fetch(`${API_URL}/contact-views/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return {
          contactViews: data.contactViews || 0,
          viewedContacts: data.viewedContacts || [],
          hasUnlimitedContacts: data.hasUnlimitedContacts || false,
          subscriptionExpiry: data.subscriptionExpiry,
          contactCredits: data.contactCredits || 7
        }
      }
    } catch (error) {
      console.error('Error fetching contact views from backend:', error)
    }
    return {
      contactViews: 0,
      viewedContacts: [],
      hasUnlimitedContacts: false,
      subscriptionExpiry: null,
      contactCredits: 7
    }
  }

  // Update contact views in backend (DB is the single source of truth)
  const updateContactViewsInBackend = async (
    userId,
    contactViews,
    viewedContacts
  ) => {
    if (!userId) return null

    try {
      const response = await fetch(`${API_URL}/contact-views/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contactViews, viewedContacts })
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      // Sync all relevant fields from the backend
      setContactViewsCount(data.contactViews || 0)
      setViewedContacts(data.viewedContacts || [])
      if (typeof data.contactCredits === 'number') {
        setContactCredits(data.contactCredits)
      }
      if (typeof data.hasUnlimitedContacts === 'boolean') {
        setHasUnlimitedContacts(data.hasUnlimitedContacts)
      }

      return data
    } catch (error) {
      console.error('Error updating contact views in backend:', error)
      return null
    }
  }

  // Add contact credits to user (handled in backend/database)
  const addContactCredits = async (credits = 7, duration = 30) => {
    try {
      if (!userId) return false

      const response = await fetch(`${API_URL}/contact-credits/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          credits,
          duration, // Duration in days
          amount: 49, // ₹49 for 7 contacts
          currency: 'INR',
          plan: 'contact_credits'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setContactViewsCount(data.contactViews || 0)
        setContactCredits(data.contactCredits || credits)
        // Reload subscription data to get the latest state
        await loadSubscriptionData()
        return true
      }
    } catch (error) {
      console.error('Error adding contact credits:', error)
    }
    return false
  }

  const loadSubscriptionData = async () => {
    try {
      setSubscriptionLoading(true)

      // Get user ID first
      const currentUserId = await getUserId()

      // If user is logged in, fetch full subscription/contact data from backend.
      // All limits, credits and viewed contacts are now driven by the database.
      let backendData = {
        contactViews: 0,
        viewedContacts: [],
        hasUnlimitedContacts: false,
        subscriptionExpiry: null,
        contactCredits: FREE_CONTACT_LIMIT
      }
      if (currentUserId) {
        backendData = await fetchContactViewsFromBackend(currentUserId)
      }

      setContactViewsCount(backendData.contactViews || 0)
      setViewedContacts(backendData.viewedContacts || [])
      setHasUnlimitedContacts(backendData.hasUnlimitedContacts || false)
      setContactCredits(backendData.contactCredits || FREE_CONTACT_LIMIT)
    } catch (error) {
      console.error('Error loading subscription data:', error)
    } finally {
      setSubscriptionLoading(false)
    }
  }

  // Check if contact has been viewed before
  const hasViewedContact = (contactId) => {
    return viewedContacts.includes(contactId)
  }

  // Add contact to viewed contacts
  const addViewedContact = async (contactId) => {
    // If user already has unlimited, or this contact was already counted, nothing to do.
    if (hasUnlimitedContacts || hasViewedContact(contactId)) return true

    // Lazy-load userId if it wasn't available when the provider mounted
    let effectiveUserId = userId
    if (!effectiveUserId) {
      effectiveUserId = await getUserId()
      if (!effectiveUserId) {
        return false
      }
    }

    try {
      const newViewedContacts = [...viewedContacts, contactId]
      const newCount = newViewedContacts.length

      // Let backend calculate & persist views + credits, then sync state from response
      const result = await updateContactViewsInBackend(
        effectiveUserId,
        newCount,
        newViewedContacts
      )

      return !!result
    } catch (error) {
      console.error('Error adding viewed contact:', error)
      return false
    }
  }

  // Increment contact views count (deprecated - use addViewedContact instead)
  const incrementContactViews = async () => {
    console.warn(
      'incrementContactViews is deprecated, use addViewedContact instead'
    )
    return true
  }

  // Check if user can view more contacts
  const canViewContact = () => {
    return hasUnlimitedContacts || contactCredits > 0
  }

  // Get remaining free contacts
  const getRemainingFreeContacts = () => {
    if (hasUnlimitedContacts) return 'Unlimited'
    return Math.max(0, contactCredits)
  }

  // Activate unlimited contacts subscription
  const activateUnlimitedContacts = async () => {
    try {
      // Update backend first
      if (userId) {
        const response = await fetch(`${API_URL}/subscription/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            plan: 'unlimited_contacts',
            duration: 'monthly'
          })
        })

        if (response.ok) {
          setHasUnlimitedContacts(true)
          return true
        }
      }
    } catch (error) {
      console.error('Error activating unlimited contacts:', error)
      return false
    }
  }

  // Show contact view limit reached alert
  const showContactLimitAlert = (onUpgrade, onBuyCredits) => {
    Alert.alert(
      'Contact Limit Reached',
      `You've used all your contact views. Get more contacts to continue viewing seller details!`,
      [
        {
          text: 'Maybe Later',
          style: 'cancel'
        },
        {
          text: 'Buy 7 Contacts - ₹49',
          onPress: onBuyCredits
        },
        {
          text: 'Upgrade to Premium',
          onPress: onUpgrade
        }
      ]
    )
  }

  // Format phone number for display (hide last digits if needed)
  const formatPhoneNumber = (phoneNumber, shouldHide = false) => {
    if (!phoneNumber || !shouldHide) return phoneNumber

    // Hide last 4 digits, show format like: +1 555-XXX-1234
    const phoneStr = phoneNumber.toString()
    if (phoneStr.length <= 4) return phoneNumber

    const visiblePart = phoneStr.slice(0, -4)
    const hiddenPart = 'XXXX'
    return visiblePart + hiddenPart
  }

  const value = {
    contactViewsCount,
    viewedContacts,
    hasUnlimitedContacts,
    subscriptionLoading,
    contactCredits,
    FREE_CONTACT_LIMIT,
    canViewContact,
    getRemainingFreeContacts,
    hasViewedContact,
    addViewedContact,
    incrementContactViews,
    addContactCredits,
    activateUnlimitedContacts,
    showContactLimitAlert,
    formatPhoneNumber
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider')
  }
  return context
}

export default SubscriptionContext
