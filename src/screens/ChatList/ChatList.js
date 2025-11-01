import React, { useState, useContext } from 'react'
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image
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
        setConversations(data.conversations)
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
    navigation.navigate('Chat', {
      conversationId: conversation._id,
      groupTitle: conversation.groupTitle,
      otherUser: conversation.otherUser || null
    })
  }

  const renderChatItem = ({ item }) => {
    const otherUser = item.otherUser
    const displayName = otherUser?.name || item.groupTitle || 'Conversation'
    const avatar = otherUser?.avatar

    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          { borderBottomColor: branding.borderColor || '#f0f0f0' }
        ]}
        onPress={() => handleChatPress(item)}
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
          <TextDefault numberOfLines={1} style={styles.lastMessage}>
            {item.lastMessage || 'No messages yet'}
          </TextDefault>
        </View>
        <MaterialIcons 
          name='chevron-right'
          size={24} 
          color={branding.iconColor || '#999'} 
        />
      </TouchableOpacity>
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
      
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name='chat-bubble-outline'
            size={80} 
            color={branding.iconColor || '#ccc'} 
          />
          <TextDefault H4 bold style={styles.emptyText}>
            No conversations yet
          </TextDefault>
          <TextDefault style={styles.emptySubtext}>
            Start chatting with sellers
          </TextDefault>
        </View>
      ) : (
        <FlatList
          data={conversations}
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
