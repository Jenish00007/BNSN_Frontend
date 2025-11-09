import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo
} from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Alert,
  Animated,
  Easing,
  Image,
  Modal
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useRoute, useFocusEffect } from '@react-navigation/native'
import io from 'socket.io-client'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useAppBranding } from '../../utils/translationHelper'
import { API_URL } from '../../config/api'
// Import StyleSheet if not using external styles
import styles from './styles' // Comment this out if using inline styles below

// Or add this at the end of the file for inline styles:

const normalizeRoleValue = (value) => {
  if (!value) return null
  const normalized = value.toString().trim().toLowerCase()

  if (
    ['seller', 'vendor', 'shop', 'store', 'merchant'].some((keyword) =>
      normalized.includes(keyword)
    )
  ) {
    return 'seller'
  }

  if (
    ['buyer', 'user', 'customer', 'client'].some((keyword) =>
      normalized.includes(keyword)
    )
  ) {
    return 'buyer'
  }

  return null
}

const deriveUserRole = (entity) => {
  if (!entity) return null

  if (typeof entity.isSeller === 'boolean') {
    return entity.isSeller ? 'seller' : 'buyer'
  }

  if (typeof entity.isBuyer === 'boolean') {
    return entity.isBuyer ? 'buyer' : 'seller'
  }

  if (
    entity.shopId ||
    entity.shop_id ||
    entity.storeId ||
    entity.store_id ||
    entity.sellerId ||
    entity.seller_id
  ) {
    return 'seller'
  }

  if (entity.customerId || entity.customer_id) {
    return 'buyer'
  }

  const candidateFields = [
    entity.role,
    entity.userType,
    entity.accountType,
    entity.type,
    entity.accountRole,
    entity.profileType
  ]

  for (const field of candidateFields) {
    const normalized = normalizeRoleValue(field)
    if (normalized) {
      return normalized
    }
  }

  if (entity.address && !Array.isArray(entity.addresses)) {
    return 'seller'
  }

  if (Array.isArray(entity.addresses)) {
    return 'buyer'
  }

  return null
}

const toTitleCase = (value) => {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const getOppositeRole = (role) => {
  if (role === 'seller') return 'buyer'
  if (role === 'buyer') return 'seller'
  return null
}

const Chat = ({ navigation }) => {
  const route = useRoute()
  const {
    conversationId: initialConversationId,
    groupTitle,
    otherUser,
    shopId,
    shopName,
    productId,
    displayName: initialDisplayName
  } = route.params || {}

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState(initialConversationId)

  const flatListRef = useRef(null)
  const sendButtonScale = useRef(new Animated.Value(1)).current
  const typingOpacity = useRef(new Animated.Value(0)).current
  const socketInitializedRef = useRef(false)
  const handlingShopIdRef = useRef(false)
  const lastMarkedReadRef = useRef({ conversationId: null, timestamp: 0 })

  const { token } = useContext(AuthContext)
  const { formetedProfileData: profile } = useContext(UserContext)
  const branding = useAppBranding()
  const displayName =
    initialDisplayName ||
    otherUser?.displayName ||
    otherUser?.name ||
    groupTitle ||
    shopName ||
    'Chat'
  const detectedSelfRole = useMemo(() => {
    const directRole = deriveUserRole(profile)
    if (directRole) return directRole

    if (shopId && profile?._id !== shopId) {
      return 'buyer'
    }

    return null
  }, [profile, shopId])

  const detectedOtherRole = useMemo(() => {
    const directRole = deriveUserRole(otherUser)
    if (directRole) return directRole

    if (shopId) return 'seller'

    if (detectedSelfRole) {
      const opposite = getOppositeRole(detectedSelfRole)
      if (opposite) return opposite
    }

    return null
  }, [otherUser, shopId, detectedSelfRole])

  const resolvedSelfRole = useMemo(() => {
    if (detectedSelfRole) return detectedSelfRole

    if (detectedOtherRole) {
      const opposite = getOppositeRole(detectedOtherRole)
      if (opposite) return opposite
    }

    return 'buyer'
  }, [detectedSelfRole, detectedOtherRole])

  const resolvedOtherRole = useMemo(() => {
    if (detectedOtherRole) return detectedOtherRole

    if (detectedSelfRole) {
      const opposite = getOppositeRole(detectedSelfRole)
      if (opposite) return opposite
    }

    return shopId ? 'seller' : null
  }, [detectedOtherRole, detectedSelfRole, shopId])
  // Socket URL - Update this with your actual socket server URL
  const SOCKET_URL = 'https://bnsn.in'

  useEffect(() => {
    // Only initialize once
    if (!socketInitializedRef.current) {
      initializeChat()
      socketInitializedRef.current = true
    }

    return () => {
      if (socket) {
        if (profile?._id && (conversationId || route.params?.conversationId)) {
          socket.emit('leave-chat-room', {
            userId: profile._id,
            conversationId: conversationId || route.params?.conversationId
          })
        }
        socket.disconnect()
        socketInitializedRef.current = false
      }
    }
  }, [])

  // Handle conversation ID changes (when navigating to different chat)
  useEffect(() => {
    if (socket && isConnected) {
      // Check if we have route params that should trigger a switch
      if (initialConversationId && initialConversationId !== conversationId) {
        console.log(
          'Conversation ID changed, switching room:',
          initialConversationId
        )
        // Clear existing messages to avoid showing wrong messages
        setMessages([])
        setLoading(true)

        // Leave old room if conversationId exists
        if (conversationId) {
          socket.emit('leave-chat-room', {
            userId: profile._id,
            conversationId: conversationId
          })
        }

        // Join new room
        socket.emit('join-chat-room', {
          userId: profile._id,
          conversationId: initialConversationId
        })

        // Fetch messages for new conversation
        fetchMessages(initialConversationId)

        // Update conversationId state
        setConversationId(initialConversationId)
      }
    }
  }, [initialConversationId, socket, isConnected, conversationId])

  // Handle when shopId is provided (from ProductDetail) - need to create conversation and join
  useEffect(() => {
    const handleShopId = async () => {
      // Only run once per shopId to prevent multiple API calls
      if (handlingShopIdRef.current) return

      if (socket && isConnected && shopId && !conversationId) {
        handlingShopIdRef.current = true
        console.log(
          'shopId provided without conversationId, creating conversation'
        )
        try {
          const response = await fetch(
            `${API_URL}/conversation/create-new-conversation`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                groupTitle: shopName || 'Chat',
                userId: profile._id,
                sellerId: shopId,
                productId: productId || null
              })
            }
          )

          const data = await response.json()
          if (data.success && data.conversation) {
            const newConversationId = data.conversation._id
            console.log('New conversation created:', newConversationId)

            // Clear existing messages
            setMessages([])
            setLoading(true)

            // Join new room
            socket.emit('join-chat-room', {
              userId: profile._id,
              conversationId: newConversationId
            })

            // Fetch messages for new conversation
            fetchMessages(newConversationId)

            // Update conversationId state
            setConversationId(newConversationId)

            // Update navigation params
            navigation.setParams({
              conversationId: newConversationId,
              groupTitle: shopName || 'Chat',
              displayName: shopName || 'Chat'
            })
          }
        } catch (error) {
          console.error('Error creating conversation:', error)
        } finally {
          handlingShopIdRef.current = false
        }
      }
    }

    handleShopId()
  }, [shopId, socket, isConnected, conversationId])

  // Refresh messages and mark as read when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (socket && profile?._id && isConnected && conversationId) {
        // Refetch messages when screen comes into focus
        fetchMessages(conversationId)
        markMessagesAsRead(conversationId)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, profile?._id, isConnected, conversationId])
  )

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [messages, loading])

  // Enhanced header
  useEffect(() => {
    navigation.setOptions({
      title: displayName || 'Chat',
      headerStyle: {
        backgroundColor: branding.primaryColor || '#007AFF',
        shadowColor: branding.primaryColor || '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 18
      }
    })
  }, [navigation, displayName, branding])

  // Animation for send button
  const animateSendButton = () => {
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true
      })
    ]).start()
  }

  // Helper function to mark messages as read with duplicate prevention
  const markMessagesAsRead = (convId) => {
    const now = Date.now()
    // Only mark as read if:
    // 1. We have a socket connection
    // 2. Conv ID is provided
    // 3. Either different conv or same conv but > 1 second since last mark
    if (
      socket &&
      convId &&
      (lastMarkedReadRef.current.conversationId !== convId ||
        now - lastMarkedReadRef.current.timestamp > 1000)
    ) {
      lastMarkedReadRef.current = { conversationId: convId, timestamp: now }
      socket.emit('mark-as-read', {
        userId: profile._id,
        conversationId: convId
      })
    }
  }

  const initializeChat = async () => {
    try {
      if (!token || !profile?._id) {
        Alert.alert('Error', 'Authentication required')
        navigation.goBack()
        return
      }

      // Initialize socket connection
      const socketInstance = io(SOCKET_URL, {
        auth: {
          token: token
        },
        path: '/api/socket.io/', // ✅ MUST MATCH SERVER + NGINX
        transports: ['websocket'],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      })

      setSocket(socketInstance)

      // Socket event listeners
      socketInstance.on('connect', () => {
        console.log('Connected to socket server')
        setIsConnected(true)

        // If we already have a conversationId, join the room
        if (conversationId) {
          socketInstance.emit('join-chat-room', {
            userId: profile._id,
            conversationId: conversationId
          })

          // Fetch chat history with the correct conversation ID
          fetchMessages(conversationId)

          // Mark messages as read
          markMessagesAsRead(conversationId)
        }
      })

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
        setLoading(false)
        Alert.alert('Connection Error', 'Failed to connect to chat server.')
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason)
        setIsConnected(false)
        if (reason === 'io server disconnect') {
          socketInstance.connect()
        }
      })

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('Reconnected after', attemptNumber, 'attempts')
        setIsConnected(true)
        if (conversationId) {
          socketInstance.emit('join-chat-room', {
            userId: profile._id,
            conversationId: conversationId
          })
          fetchMessages(conversationId)
        }
      })

      socketInstance.on('receive-message', (message) => {
        if (message && message.text && message._id) {
          setMessages((prevMessages) => {
            // Check if message already exists to prevent duplicates
            const messageExists = prevMessages.some(
              (msg) => msg._id === message._id
            )
            if (messageExists) {
              console.log('Duplicate message detected, skipping:', message._id)
              return prevMessages
            }
            return [...prevMessages, message]
          })
          scrollToBottom()

          // Mark message as read if from other user
          if (message.sender !== profile._id) {
            markMessagesAsRead(conversationId)
          }
        }
      })

      socketInstance.on('messages-marked-read', (data) => {
        // Messages marked as read, update UI
        setMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            read: true
          }))
        )
      })

      socketInstance.on('user-typing', (data) => {
        if (data.userId !== profile._id) {
          showTypingIndicator()
        }
      })

      socketInstance.on('user-stopped-typing', (data) => {
        if (data.userId !== profile._id) {
          hideTypingIndicator()
        }
      })
    } catch (error) {
      console.error('Initialization error:', error)
      setLoading(false)
      Alert.alert('Error', 'Failed to initialize chat')
    }
  }

  const showTypingIndicator = () => {
    setIsTyping(true)
    Animated.timing(typingOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }

  const hideTypingIndicator = () => {
    Animated.timing(typingOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => setIsTyping(false))
  }

  const fetchMessages = async (convId = null) => {
    try {
      const convIdToUse = convId || conversationId
      if (!convIdToUse) {
        console.log('No conversation ID available to fetch messages')
        setLoading(false)
        return
      }

      console.log('Fetching messages for conversation:', convIdToUse)
      const response = await fetch(
        `${API_URL}/message/get-all-messages/${convIdToUse}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      if (data.success) {
        console.log('Messages fetched:', data.messages?.length || 0)
        setMessages(data.messages)
        setLoading(false)
        setTimeout(() => {
          scrollToBottom()
        }, 200)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || sending || !isConnected) return

    const messageText = inputText.trim()
    setInputText('')
    setSending(true)
    animateSendButton()

    try {
      if (socket) {
        socket.emit('send-message', {
          conversationId: conversationId,
          sender: profile._id,
          text: messageText
        })
      } else {
        // Fallback to HTTP if socket not available
        const formData = new FormData()
        formData.append('conversationId', conversationId)
        formData.append('sender', profile._id)
        formData.append('text', messageText)

        const response = await fetch(`${API_URL}/message/create-new-message`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        })

        const data = await response.json()
        if (data.success) {
          await updateLastMessage(messageText, data.message._id)
          await fetchMessages()
        }
      }

      setSending(false)
    } catch (error) {
      console.error('Error sending message:', error)
      setSending(false)
      Alert.alert('Error', 'Failed to send message')
      setInputText(messageText)
    }
  }

  const updateLastMessage = async (text, messageId) => {
    try {
      await fetch(
        `${API_URL}/conversation/update-last-message/${conversationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            lastMessage: text,
            lastMessageId: messageId
          })
        }
      )
    } catch (error) {
      console.error('Error updating last message:', error)
    }
  }

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true })
      }, 100)
    }
  }

  const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - messageDate) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return messageDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year:
          messageDate.getFullYear() !== today.getFullYear()
            ? 'numeric'
            : undefined
      })
    }
  }

  const renderDateHeader = ({ item, index }) => {
    if (index === 0) {
      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      )
    }

    const previousMessage = messages[index - 1]
    const currentDate = new Date(item.createdAt).toDateString()
    const previousDate = new Date(previousMessage.createdAt).toDateString()

    if (currentDate !== previousDate) {
      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      )
    }

    return null
  }

  const getAvatarColor = (name) => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9'
    ]
    const index = name ? name.charCodeAt(0) % colors.length : 0
    return colors[index]
  }

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.sender === profile._id

    const isFirstInGroup =
      index === 0 || messages[index - 1].sender !== item.sender

    const isLastInGroup =
      index === messages.length - 1 ||
      messages[index + 1].sender !== item.sender

    const fallbackCounterpartRole =
      getOppositeRole(resolvedSelfRole) || 'seller'
    const messageRole = isMyMessage
      ? resolvedSelfRole
      : resolvedOtherRole || fallbackCounterpartRole
    const formattedRoleLabel = messageRole ? toTitleCase(messageRole) : null
    const otherParticipantLabel =
      resolvedOtherRole && displayName
        ? `${displayName} (${toTitleCase(resolvedOtherRole)})`
        : displayName
    const sellerColor = branding.primaryColor || '#007AFF'
    const buyerColor = branding.accentColor || '#E2E8F0'
    const bubbleBackgroundColor =
      messageRole === 'seller' ? sellerColor : buyerColor
    const messageTextColor =
      messageRole === 'seller' ? '#fff' : branding.textColor || '#1e293b'
    const metaTextColor =
      messageRole === 'seller' ? '#fff' : branding.textColor || '#1e293b'
    const metaTextOpacity = messageRole === 'seller' ? 0.8 : 0.6
    const roleLabel = messageRole ? toTitleCase(messageRole) : null
    const badgeText = isMyMessage
      ? roleLabel
        ? `You (${roleLabel})`
        : 'You'
      : otherParticipantLabel || (roleLabel ? `${roleLabel}` : 'User')
    const badgeStyles =
      messageRole === 'seller'
        ? {
            backgroundColor: sellerColor,
            borderColor: sellerColor,
            borderWidth: 0
          }
        : {
            backgroundColor: '#ffffff',
            borderColor: buyerColor,
            borderWidth: 1
          }
    const badgeAlignmentStyles = isMyMessage
      ? { justifyContent: 'flex-end' }
      : { justifyContent: 'flex-start' }
    const bubbleShapeStyles = isMyMessage
      ? {
          backgroundColor: bubbleBackgroundColor,
          borderBottomRightRadius: isLastInGroup ? 20 : 4,
          borderBottomLeftRadius: 20
        }
      : {
          backgroundColor: bubbleBackgroundColor,
          borderBottomLeftRadius: isLastInGroup ? 20 : 4,
          borderBottomRightRadius: 20
        }
    const readIconColor =
      messageRole === 'seller'
        ? 'rgba(255, 255, 255, 0.9)'
        : branding.primaryColor || branding.textColor || '#1e293b'

    return (
      <>
        {renderDateHeader({ item, index })}
        <Animated.View
          style={[
            styles.messageContainer,
            isMyMessage
              ? styles.myMessageContainer
              : styles.otherMessageContainer,
            isFirstInGroup && styles.firstInGroup,
            isLastInGroup && styles.lastInGroup
          ]}
        >
          {!isMyMessage && isFirstInGroup && (
            <View style={styles.messageHeader}>
              <View style={styles.avatarContainer}>
                {otherUser?.avatar || otherUser?.profilePicture ? (
                  <Image
                    source={{
                      uri: otherUser?.avatar || otherUser?.profilePicture
                    }}
                    style={styles.userAvatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.userAvatar,
                      styles.avatarPlaceholder,
                      {
                        backgroundColor: getAvatarColor(
                          displayName || otherUser?.name
                        )
                      }
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {displayName
                        ? displayName.charAt(0).toUpperCase()
                        : otherUser?.name
                          ? otherUser.name.charAt(0).toUpperCase()
                          : 'U'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.userName}>
                {otherParticipantLabel || otherUser?.name || 'User'}
              </Text>
            </View>
          )}

          <View style={[styles.messageBubble, bubbleShapeStyles]}>
            <View style={[styles.roleBadgeWrapper, badgeAlignmentStyles]}>
              <View style={[styles.roleBadge, badgeStyles]}>
                <TextDefault
                  style={[
                    styles.roleBadgeText,
                    messageRole === 'seller'
                      ? { color: '#fff' }
                      : { color: branding.textColor || '#1e293b' }
                  ]}
                >
                  {badgeText}
                </TextDefault>
              </View>
            </View>

            <TextDefault
              style={[styles.messageText, { color: messageTextColor }]}
            >
              {item.text}
            </TextDefault>

            <View
              style={[
                styles.messageFooter,
                isMyMessage ? {} : { justifyContent: 'flex-start' }
              ]}
            >
              <TextDefault
                style={[
                  styles.messageTime,
                  { color: metaTextColor, opacity: metaTextOpacity }
                ]}
              >
                {formatMessageTime(item.createdAt)}
              </TextDefault>
              {isMyMessage && (
                <MaterialIcons
                  name={item.read ? 'done-all' : 'done'}
                  size={14}
                  color={readIconColor}
                  style={styles.readIndicator}
                />
              )}
            </View>
          </View>
        </Animated.View>
      </>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={branding.primaryColor} />
          <TextDefault style={styles.loadingText}>Loading chat...</TextDefault>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar
        barStyle='light-content'
        backgroundColor={branding.primaryColor}
      />

      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>Connecting...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={[
            styles.messagesList,
            {
              flexGrow: 1,
              justifyContent: messages.length === 0 ? 'center' : 'flex-end'
            }
          ]}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              scrollToBottom()
            }
          }}
          onLayout={() => {
            if (messages.length > 0) {
              scrollToBottom()
            }
          }}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10
          }}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='interactive'
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name='chat-bubble-outline'
                size={64}
                color='#cbd5e0'
              />
              <TextDefault style={styles.emptyText}>
                No messages yet
              </TextDefault>
              <TextDefault style={styles.emptySubText}>
                Start the conversation!
              </TextDefault>
            </View>
          )}
        />

        {/* Typing Indicator */}
        {isTyping && (
          <Animated.View
            style={[styles.typingIndicator, { opacity: typingOpacity }]}
          >
            <TextDefault style={styles.typingText}>
              {otherUser?.name || 'User'} is typing...
            </TextDefault>
          </Animated.View>
        )}

        {/* Message Input */}
        <View
          style={[
            styles.inputContainer,
            { borderTopColor: branding.borderColor || '#f0f0f0' }
          ]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder='Type a message...'
              placeholderTextColor='#999'
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              editable={!sending && isConnected}
              textAlignVertical='top'
              onFocus={() => {
                setTimeout(() => {
                  scrollToBottom()
                }, 300)
              }}
            />
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: branding.primaryColor },
                  (!inputText.trim() || sending || !isConnected) &&
                    styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || sending || !isConnected}
              >
                {sending ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <MaterialIcons name='send' size={20} color='#fff' />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Chat
