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
  const [activeRoleFilter, setActiveRoleFilter] = useState('seller')

  const navigation = useNavigation()
  const { token } = useContext(AuthContext)
  const { formetedProfileData: profile, isLoggedIn } = useContext(UserContext)
  const branding = useAppBranding()

  // Fetch conversations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (token && profile) {
        fetchConversations()
      } else {
        setLoading(false)
      }
    }, [token, profile])
  )

  const fetchConversations = async () => {
    try {
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
      console.log('Conversations fetched:', data)
      if (data.success) {
        const normalized = (data.conversations || []).map((conv) => {
          const otherUser = conv.otherUser || {}
          const looksLikeShop =
            otherUser.address !== undefined && otherUser.address !== null
          const conversationRole = looksLikeShop ? 'seller' : 'buyer'
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

    navigation.navigate('Chat', {
      conversationId: conversation._id,
      groupTitle: conversation.groupTitle,
      otherUser: conversation.otherUser || null,
      displayName:
        (conversation.otherUser &&
          (conversation.otherUser.displayName ||
            conversation.otherUser.name)) ||
        conversation.groupTitle ||
        'Conversation',
      isChatDisabled: conversation.isChatDisabled,
      chatDisabledReason: conversation.chatDisabledReason,
      productStatus: conversation.productStatus
    })
  }

  const renderChatItem = ({ item }) => {
    const otherUser = item.otherUser
    const displayName = otherUser?.name || item.groupTitle || 'Conversation'
    const avatar = otherUser?.avatar
    const roleLabel =
      item.conversationRole === 'seller'
        ? 'Seller'
        : item.conversationRole === 'buyer'
          ? 'Buyer'
          : null

    const statusText = item.statusLabel

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
                    item.conversationRole === 'seller'
                      ? (branding.primaryColor || '#007AFF') + '20'
                      : (branding.accentColor || '#38A169') + '20',
                  borderColor:
                    item.conversationRole === 'seller'
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
                      item.conversationRole === 'seller'
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
    if (!activeRoleFilter) return conversations
    return conversations.filter(
      (conversation) => conversation.conversationRole === activeRoleFilter
    )
  }, [conversations, activeRoleFilter])

  const renderRoleFilters = () => {
    const filters = [
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
              : activeRoleFilter === 'seller'
                ? "You're not buying from anyone yet"
                : 'No buyers have contacted you yet'}
          </TextDefault>
          {conversations.length === 0 ? (
          <TextDefault style={styles.emptySubtext}>
            Start chatting with sellers
          </TextDefault>
          ) : null}
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
