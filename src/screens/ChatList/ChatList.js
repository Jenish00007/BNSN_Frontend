import React, { useState, useContext, useMemo } from 'react'
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useAppBranding } from '../../utils/translationHelper'
import { API_URL } from '../../config/api'
import styles from './styles'

const ChatList = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeRoleFilter, setActiveRoleFilter] = useState('all')

  const navigation = useNavigation()
  const { token } = useContext(AuthContext)
  const { formetedProfileData: profile, isLoggedIn } = useContext(UserContext)
  const branding = useAppBranding()

  // Fetch conversations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔔 [CHATLIST] Screen focused, fetching conversations...')
      if (token && profile) {
        fetchConversations()
      } else {
        console.log('🔔 [CHATLIST] No token or profile, setting loading to false')
        setLoading(false)
      }
    }, [token, profile, fetchConversations])
  )

  const fetchConversations = async () => {
    try {
      console.log('🔔 [CHATLIST] Fetching conversations for user:', profile._id)
      setLoading(true)
      const response = await fetch(
        `${API_URL}/conversation/get-all-conversation-user/${profile._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const data = await response.json()
      console.log('🔔 [CHATLIST] Conversations fetched:', data)
      if (data.success) {
        const normalized = (data.conversations || []).map((conv) => {
          console.log('=== Processing conversation:', conv._id, '===')
          console.log('Backend currentUserRole:', conv.currentUserRole)
          console.log('Backend otherUserRole:', conv.otherUserRole)
          console.log('Other user data:', conv.otherUser)
          
          const otherUser = conv.otherUser || {}
          let currentUserRole = conv.currentUserRole || null
          let otherUserRole = conv.otherUserRole || null

          // Frontend fallback: determine roles based on product ownership
          if (!currentUserRole || !otherUserRole) {
            console.log('Roles missing, using frontend detection...')

            // Most reliable: check if current user owns product
            const productOwnerId =
              conv.product?.userId ||
              conv.product?.user?._id ||
              conv.productUserId ||
              null

            if (productOwnerId) {
              const currentUserIsProductOwner =
                productOwnerId === profile._id ||
                productOwnerId?.toString() === profile._id?.toString()

              currentUserRole = currentUserIsProductOwner ? 'seller' : 'buyer'
              otherUserRole = currentUserIsProductOwner ? 'buyer' : 'seller'

              console.log('Product owner detection - productOwnerId:', productOwnerId, 'currentUserId:', profile._id)
              console.log('currentUserIsProductOwner:', currentUserIsProductOwner)
            } else {
              // Last resort fallback: check otherUser.role from backend
              if (otherUser.role) {
                otherUserRole = otherUser.role
                currentUserRole = otherUserRole === 'seller' ? 'buyer' : 'seller'
              } else {
                // Cannot determine — default to buyer (safer assumption)
                currentUserRole = 'buyer'
                otherUserRole = 'seller'
              }
              console.log('No product owner data, using fallback roles')
            }

            console.log('Detected currentUserRole:', currentUserRole)
            console.log('Detected otherUserRole:', otherUserRole)
          }

          console.log('Final roles - currentUserRole:', currentUserRole, 'otherUserRole:', otherUserRole)

          // Use backend-provided role information first, fallback to detection
          let conversationRole = otherUserRole
          
          const productStatus =
            conv.productStatus || conv.product?.status || null
          const isChatDisabled =
            Boolean(conv.isChatDisabled) ||
            (productStatus && productStatus !== 'active')
          let statusLabel = null
          if (productStatus === 'sold') statusLabel = 'Sold'
          if (productStatus === 'inactive') statusLabel = 'Inactive'

          return {
            ...conv,
            conversationRole,
            currentUserRole,
            otherUserRole,
            productStatus,
            statusLabel,
            isChatDisabled,
            chatDisabledReason:
              conv.chatDisabledReason ||
              (productStatus === 'sold'
                ? 'This item has been marked as sold'
                : productStatus === 'inactive'
                  ? 'This listing is inactive'
                  : null)
          }
        })

        setConversations(normalized)
        console.log('🔔 [CHATLIST] Conversations set:', normalized.length, 'conversations')
        console.log('🔔 [CHATLIST] Conversation IDs:', normalized.map(c => c._id))
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchConversations()
  }

  const handleChatPress = (conversation) => {
    if (conversation.isChatDisabled) {
      Alert.alert(
        'Chat disabled',
        conversation.chatDisabledReason ||
          'This conversation is no longer available.',
        [{ text: 'OK', style: 'default' }]
      )
      return
    }

    // Determine the correct shopId and role context for navigation
    const shopId = conversation.otherUserRole === 'seller' 
      ? conversation.otherUser?._id 
      : conversation.sellerId
    
    const isCurrentUserSeller = conversation.currentUserRole === 'seller'

    // Log navigation data for debugging
    console.log('🔔 [CHATLIST] Navigating to Chat with:')
    console.log('🔔 [CHATLIST] Conversation ID:', conversation._id)
    console.log('🔔 [CHATLIST] Product ID:', conversation.productId || conversation.product?._id)
    console.log('🔔 [CHATLIST] Other User:', conversation.otherUser?.name)
    console.log('🔔 [CHATLIST] Current User Role:', conversation.currentUserRole)
    console.log('🔔 [CHATLIST] Other User Role:', conversation.otherUserRole)

    navigation.navigate('Chat', {
      conversationId: conversation._id,
      groupTitle: conversation.groupTitle,
      otherUser: conversation.otherUser || null,
      shopId: shopId || null,
      productId: conversation.productId || conversation.product?._id || null,
      product: conversation.product || null,
      displayName:
        (conversation.otherUser &&
          (conversation.otherUser.displayName ||
            conversation.otherUser.name)) ||
        conversation.groupTitle ||
        'Conversation',
      isChatDisabled: conversation.isChatDisabled,
      chatDisabledReason: conversation.chatDisabledReason,
      productStatus: conversation.productStatus,
      // Pass role context for better UI handling
      currentUserRole: conversation.currentUserRole,
      otherUserRole: conversation.otherUserRole
    })
  }

  const renderChatItem = ({ item }) => {
    const otherUser = item.otherUser
    const displayName = otherUser?.name || item.groupTitle || 'Conversation'
    const avatar = otherUser?.avatar
    const currentUserRole = item.currentUserRole
    const otherUserRole = item.otherUserRole || item.conversationRole
    
    // Determine role label based on who the other person is
    const roleLabel = otherUserRole === 'seller' 
      ? 'Seller' 
      : otherUserRole === 'buyer' 
        ? 'Buyer' 
        : null
    
    // Show context about current user's role in this conversation
    const getContextText = () => {
      if (currentUserRole === 'seller') {
        return 'You are selling'
      } else if (currentUserRole === 'buyer') {
        return 'You are buying'
      }
      return null
    }

    const statusText = item.statusLabel
    const contextText = getContextText()

    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          {
            borderBottomColor: branding.borderColor || '#f0f0f0',
            opacity: item.isChatDisabled ? 0.6 : 1
          }
        ]}
        onPress={() => handleChatPress(item)}
        disabled={item.isChatDisabled}
      >
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View
              style={[
                styles.avatar,
                { backgroundColor: branding.primaryColor }
              ]}
            >
              <TextDefault H4 bold style={{ color: '#fff' }}>
                {displayName?.charAt(0).toUpperCase() || 'C'}
              </TextDefault>
            </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <TextDefault H5 bold numberOfLines={1}>
            {displayName}
          </TextDefault>
          {contextText && (
            <TextDefault small style={styles.contextText}>
              {contextText}
            </TextDefault>
          )}
          {statusText && (
            <View
              style={[
                styles.statusBadge,
                statusText === 'Sold'
                  ? styles.statusBadgeSold
                  : styles.statusBadgeInactive
              ]}
            >
              <TextDefault
                small
                bold
                style={[
                  styles.statusBadgeText,
                  statusText === 'Sold'
                    ? styles.statusBadgeSoldText
                    : styles.statusBadgeInactiveText
                ]}
              >
                {statusText}
              </TextDefault>
            </View>
          )}
          <TextDefault numberOfLines={1} style={styles.lastMessage}>
            {item.lastMessage || 'No messages yet'}
          </TextDefault>
          {item.isChatDisabled && (
            <TextDefault
              numberOfLines={1}
              small
              style={styles.chatDisabledMessage}
            >
              {item.chatDisabledReason || 'Chat disabled'}
            </TextDefault>
          )}
          {roleLabel && (
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    otherUserRole === 'seller'
                      ? (branding.primaryColor || '#007AFF') + '20'
                      : (branding.accentColor || '#38A169') + '20',
                  borderColor:
                    otherUserRole === 'seller'
                      ? branding.primaryColor || '#007AFF'
                      : branding.accentColor || '#38A169'
                }
              ]}
            >
              <TextDefault
                small
                bold
                style={[
                  styles.roleBadgeText,
                  {
                    color:
                      otherUserRole === 'seller'
                        ? branding.primaryColor || '#007AFF'
                        : branding.accentColor || '#38A169'
                  }
                ]}
              >
                {roleLabel}
              </TextDefault>
            </View>
          )}
        </View>
        <MaterialIcons
          name='chevron-right'
          size={24}
          color={branding.iconColor || '#999'}
        />
      </TouchableOpacity>
    )
  }

  const filteredConversations = useMemo(() => {
    console.log('=== Filtering conversations ===')
    console.log('Active filter:', activeRoleFilter)
    console.log('Total conversations:', conversations.length)
    
    if (activeRoleFilter === 'all') {
      console.log('All filter - returning all conversations')
      return conversations
    }
    
    const filtered = conversations.filter(
      (conversation) => {
        // Filter based on current user's role in the conversation
        if (activeRoleFilter === 'seller') {
          const matches = conversation.currentUserRole === 'seller'
          console.log('Seller filter - conversation', conversation._id, 'role:', conversation.currentUserRole, 'matches:', matches)
          return matches
        } else if (activeRoleFilter === 'buyer') {
          const matches = conversation.currentUserRole === 'buyer'
          console.log('Buyer filter - conversation', conversation._id, 'role:', conversation.currentUserRole, 'matches:', matches)
          return matches
        }
        return false
      }
    )
    
    console.log('Filtered conversations count:', filtered.length)
    console.log('Filtered conversation IDs:', filtered.map(c => c._id))
    return filtered
  }, [conversations, activeRoleFilter])

  const renderRoleFilters = () => {
    const filters = [
      { key: 'all', label: 'All' },
      { key: 'seller', label: 'Seller' },
      { key: 'buyer', label: 'Buyer' }
    ]

    return (
      <View style={styles.roleFilterContainer}>
        {filters.map((filter) => {
          const isActive = activeRoleFilter === filter.key
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.roleFilterButton,
                {
                  backgroundColor: isActive
                    ? branding.primaryColor || '#007AFF'
                    : 'transparent',
                  borderColor: branding.primaryColor || '#007AFF'
                }
              ]}
              onPress={() => setActiveRoleFilter(filter.key)}
            >
              <TextDefault
                bold
                style={[
                  styles.roleFilterText,
                  {
                    color: isActive
                      ? '#fff'
                      : branding.primaryColor || '#007AFF'
                  }
                ]}
              >
                {filter.label}
              </TextDefault>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  if (!isLoggedIn || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle='light-content'
          backgroundColor={branding.headerColor}
        />
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name='chat'
            size={80}
            color={branding.iconColor || '#ccc'}
          />
          <TextDefault H4 bold style={styles.emptyText}>
            Please login to view chats
          </TextDefault>
          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: branding.primaryColor }
            ]}
            onPress={() => navigation.navigate('Login')}
          >
            <TextDefault bold style={{ color: '#fff' }}>
              Login
            </TextDefault>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle='light-content'
          backgroundColor={branding.headerColor}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={branding.primaryColor} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar
        barStyle='light-content'
        backgroundColor={branding.headerColor}
      />
      {renderRoleFilters()}
      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name='chat-bubble-outline'
            size={80}
            color={branding.iconColor || '#ccc'}
          />
          <TextDefault H4 bold style={styles.emptyText}>
            {conversations.length === 0
              ? 'No conversations yet'
              : activeRoleFilter === 'all'
                ? 'No conversations found'
                : activeRoleFilter === 'seller'
                  ? 'No selling conversations yet'
                  : 'No buying conversations yet'}
          </TextDefault>
          {conversations.length === 0 ? (
            <TextDefault style={styles.emptySubtext}>
              {profile?.isSeller ? 'Start chatting with buyers' : 'Start chatting with sellers'}
            </TextDefault>
          ) : activeRoleFilter === 'all' ? (
            <TextDefault style={styles.emptySubtext}>
              Try switching to Seller or Buyer filter
            </TextDefault>
          ) : (
            <TextDefault style={styles.emptySubtext}>
              {activeRoleFilter === 'seller' ? 'Buyers haven\'t contacted you yet' : 'You haven\'t started any buying conversations yet'}
            </TextDefault>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderChatItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[branding.primaryColor]}
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

export default ChatList
