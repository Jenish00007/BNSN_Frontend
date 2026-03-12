import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FlashMessage } from '../ui/FlashMessage/FlashMessage'

// Background message handler for Firebase Cloud Messaging
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🔔 [BACKGROUND] Message received in background:', remoteMessage)
  
  try {
    // Handle different types of messages
    const { data, notification } = remoteMessage
    
    if (data) {
      console.log('🔔 [BACKGROUND] Message data:', data)
      
      // Handle specific message types
      switch (data.type) {
        case 'NEW_MESSAGE':
          console.log('🔔 [BACKGROUND] New chat message received')
          // You can update local storage, trigger in-app notifications, etc.
          break
          
        case 'PRODUCT_INQUIRY':
          console.log('🔔 [BACKGROUND] Product inquiry received')
          break
          
        default:
          console.log('🔔 [BACKGROUND] Unknown message type:', data.type)
      }
      
      // Store the message for later when app comes to foreground
      const existingMessages = await AsyncStorage.getItem('backgroundMessages')
      const messages = existingMessages ? JSON.parse(existingMessages) : []
      messages.push({
        ...data,
        notification,
        timestamp: new Date().toISOString(),
        id: remoteMessage.messageId
      })
      
      // Keep only last 10 messages to avoid storage bloat
      const recentMessages = messages.slice(-10)
      await AsyncStorage.setItem('backgroundMessages', JSON.stringify(recentMessages))
      
      console.log('🔔 [BACKGROUND] Message stored for later processing')
    }
    
    if (notification) {
      console.log('🔔 [BACKGROUND] Notification payload:', notification)
      // The notification will be displayed automatically by the OS
    }
    
  } catch (error) {
    console.error('🔔 [BACKGROUND] Error handling background message:', error)
  }
  
  // Return a promise to indicate successful processing
  return Promise.resolve()
})

// Foreground message handler
export const setupForegroundMessageHandler = () => {
  messaging().onMessage(async remoteMessage => {
    console.log('🔔 [FOREGROUND] Message received while app is open:', remoteMessage)
    
    try {
      const { data, notification } = remoteMessage
      
      if (data) {
        console.log('🔔 [FOREGROUND] Message data:', data)
        
        // Show in-app notification or update UI
        let message = 'You received a new notification'
        
        if (data.type === 'NEW_MESSAGE') {
          message = `New message from ${data.senderName || 'Someone'}`
        } else if (data.type === 'PRODUCT_INQUIRY') {
          message = `New inquiry about your product`
        }
        
        // Show flash message for foreground notifications
        FlashMessage({
          message: message,
          description: notification?.body || data.message || 'Check your notifications',
          type: 'success',
          duration: 3000
        })
        
        // Process the message
        await processMessage(data)
      }
      
      if (notification) {
        console.log('🔔 [FOREGROUND] Notification payload:', notification)
      }
      
    } catch (error) {
      console.error('🔔 [FOREGROUND] Error handling foreground message:', error)
    }
  })
}

// Process message function
const processMessage = async (data) => {
  try {
    console.log('🔔 [PROCESS] Processing message:', data)
    
    // Store message for chat list updates
    if (data.type === 'NEW_MESSAGE' && data.conversationId) {
      const conversationUpdates = await AsyncStorage.getItem('conversationUpdates')
      const updates = conversationUpdates ? JSON.parse(conversationUpdates) : {}
      
      updates[data.conversationId] = {
        lastMessage: data.message,
        lastMessageTime: new Date().toISOString(),
        unread: true,
        senderName: data.senderName
      }
      
      await AsyncStorage.setItem('conversationUpdates', JSON.stringify(updates))
      console.log('🔔 [PROCESS] Conversation update stored')
    }
    
  } catch (error) {
    console.error('🔔 [PROCESS] Error processing message:', error)
  }
}

// Get stored background messages
export const getStoredMessages = async () => {
  try {
    const messages = await AsyncStorage.getItem('backgroundMessages')
    return messages ? JSON.parse(messages) : []
  } catch (error) {
    console.error('🔔 [STORAGE] Error getting stored messages:', error)
    return []
  }
}

// Clear stored messages
export const clearStoredMessages = async () => {
  try {
    await AsyncStorage.removeItem('backgroundMessages')
    console.log('🔔 [STORAGE] Stored messages cleared')
  } catch (error) {
    console.error('🔔 [STORAGE] Error clearing stored messages:', error)
  }
}

// Check and process background messages when app comes to foreground
export const processBackgroundMessages = async () => {
  try {
    const messages = await getStoredMessages()
    
    if (messages.length > 0) {
      console.log(`🔔 [FOREGROUND] Processing ${messages.length} background messages`)
      
      for (const message of messages) {
        await processMessage(message.data || message)
      }
      
      // Clear processed messages
      await clearStoredMessages()
    }
  } catch (error) {
    console.error('🔔 [FOREGROUND] Error processing background messages:', error)
  }
}

// Initialize messaging handlers
export const initializeMessaging = () => {
  console.log('🔔 [INIT] Initializing Firebase messaging handlers')
  
  // Setup foreground handler
  setupForegroundMessageHandler()
  
  // Process any background messages from when app was closed
  processBackgroundMessages()
  
  console.log('🔔 [INIT] Firebase messaging handlers initialized')
}

export default {
  initializeMessaging,
  setupForegroundMessageHandler,
  getStoredMessages,
  clearStoredMessages,
  processBackgroundMessages
}
