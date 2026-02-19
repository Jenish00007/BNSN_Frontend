import React, { createContext, useState, useEffect, useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'
import { API_URL } from '../config/api'

const SubscriptionContext = createContext({})

export const SubscriptionProvider = ({ children }) => {
  const [contactViewsCount, setContactViewsCount] = useState(0)
  const [viewedContacts, setViewedContacts] = useState([]) // Track unique contact IDs
  const [hasUnlimitedContacts, setHasUnlimitedContacts] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [contactCredits, setContactCredits] = useState(7) // Default to 7 free credits
  
  const FREE_CONTACT_LIMIT = 7
  const CONTACT_VIEWS_KEY = '@contact_views_count'
  const VIEWED_CONTACTS_KEY = '@viewed_contacts'
  const UNLIMITED_CONTACTS_KEY = '@unlimited_contacts_active'
  const CONTACT_CREDITS_KEY = '@contact_credits'

  // Load subscription data from AsyncStorage
  useEffect(() => {
    loadSubscriptionData()
  }, [])

  // Fetch user ID from AsyncStorage
  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user')
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
    return { contactViews: 0, viewedContacts: [], hasUnlimitedContacts: false, subscriptionExpiry: null, contactCredits: 7 }
  }

  // Update contact views in backend
  const updateContactViewsInBackend = async (userId, contactViews, viewedContacts) => {
    if (!userId) return false
    
    try {
      const response = await fetch(`${API_URL}/contact-views/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contactViews, viewedContacts })
      })
      
      return response.ok
    } catch (error) {
      console.error('Error updating contact views in backend:', error)
      return false
    }
  }

  // Add contact credits to user
  const addContactCredits = async (credits = 7) => {
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
          amount: 49, // ₹49 for 7 contacts
          currency: 'INR'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setContactViewsCount(data.contactViews)
        setContactCredits(data.contactCredits)
        // Also update local storage
        await AsyncStorage.setItem(CONTACT_CREDITS_KEY, data.contactCredits.toString())
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
      
      // Fetch contact views from backend if user is logged in
      let backendData = { contactViews: 0, viewedContacts: [], hasUnlimitedContacts: false, subscriptionExpiry: null, contactCredits: 7 }
      if (currentUserId) {
        backendData = await fetchContactViewsFromBackend(currentUserId)
      }
      
      const [localViewsCount, localViewedContacts, unlimitedStatus, localCredits] = await Promise.all([
        AsyncStorage.getItem(CONTACT_VIEWS_KEY),
        AsyncStorage.getItem(VIEWED_CONTACTS_KEY),
        AsyncStorage.getItem(UNLIMITED_CONTACTS_KEY),
        AsyncStorage.getItem(CONTACT_CREDITS_KEY)
      ])

      // Parse local viewed contacts
      const parsedLocalViewedContacts = localViewedContacts ? JSON.parse(localViewedContacts) : []
      
      // Use the higher of backend or local count and merge viewed contacts
      const finalCount = Math.max(
        backendData.contactViews,
        localViewsCount ? parseInt(localViewsCount, 10) : 0
      )
      
      // Use backend credits or local credits
      const finalCredits = backendData.contactCredits || (localCredits ? parseInt(localCredits, 10) : 7)
      
      // Merge viewed contacts from backend and local
      const allViewedContacts = [...new Set([...backendData.viewedContacts, ...parsedLocalViewedContacts])]
      
      setContactViewsCount(finalCount)
      setViewedContacts(allViewedContacts)
      setHasUnlimitedContacts(backendData.hasUnlimitedContacts || unlimitedStatus === 'true')
      setContactCredits(finalCredits)
      
      // Sync local storage with backend if backend has higher count
      if (backendData.contactViews > (localViewsCount ? parseInt(localViewsCount, 10) : 0)) {
        await AsyncStorage.setItem(CONTACT_VIEWS_KEY, backendData.contactViews.toString())
        await AsyncStorage.setItem(VIEWED_CONTACTS_KEY, JSON.stringify(backendData.viewedContacts))
      }
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
    if (hasUnlimitedContacts || hasViewedContact(contactId)) return true

    try {
      const newViewedContacts = [...viewedContacts, contactId]
      const newCount = newViewedContacts.length
      
      // Update local storage immediately for responsiveness
      await AsyncStorage.setItem(CONTACT_VIEWS_KEY, newCount.toString())
      await AsyncStorage.setItem(VIEWED_CONTACTS_KEY, JSON.stringify(newViewedContacts))
      setContactViewsCount(newCount)
      setViewedContacts(newViewedContacts)
      
      // Update backend in the background
      if (userId) {
        updateContactViewsInBackend(userId, newCount, newViewedContacts)
      }
      
      return true
    } catch (error) {
      console.error('Error adding viewed contact:', error)
      return false
    }
  }

  // Increment contact views count (deprecated - use addViewedContact instead)
  const incrementContactViews = async () => {
    console.warn('incrementContactViews is deprecated, use addViewedContact instead')
    return true
  }

  // Check if user can view more contacts
  const canViewContact = () => {
    return hasUnlimitedContacts || contactViewsCount < contactCredits
  }

  // Get remaining free contacts
  const getRemainingFreeContacts = () => {
    if (hasUnlimitedContacts) return 'Unlimited'
    return Math.max(0, contactCredits - contactViewsCount)
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
          // Update local storage
          await AsyncStorage.setItem(UNLIMITED_CONTACTS_KEY, 'true')
          setHasUnlimitedContacts(true)
          return true
        }
      } else {
        // Fallback to local only if no user ID
        await AsyncStorage.setItem(UNLIMITED_CONTACTS_KEY, 'true')
        setHasUnlimitedContacts(true)
        return true
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
