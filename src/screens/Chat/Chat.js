import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import AuthContext from '../../context/Auth';
import UserContext from '../../context/User';
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import { useAppBranding } from '../../utils/translationHelper';
import { API_URL } from '../../config/api';
import styles from './styles';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const route = useRoute();
  const { conversationId, groupTitle } = route.params || {};
  
  const flatListRef = useRef(null);
  const { token } = useContext(AuthContext);
  const { profile } = useContext(UserContext);
  const branding = useAppBranding();

  useEffect(() => {
    if (conversationId && token) {
      fetchMessages();
      // Set up polling for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [conversationId, token]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${API_URL}/message/get-all-messages/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('sender', profile._id);
      formData.append('text', messageText);

      const response = await fetch(
        `${API_URL}/message/create-new-message`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        // Update last message in conversation
        await updateLastMessage(messageText, data.message._id);
        // Fetch messages to update the list
        await fetchMessages();
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const updateLastMessage = async (text, messageId) => {
    try {
      await fetch(
        `${API_URL}/conversation/update-last-message/${conversationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lastMessage: text,
            lastMessageId: messageId,
          }),
        }
      );
    } catch (error) {
      console.error('Error updating last message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender === profile._id;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage
              ? { backgroundColor: branding.primaryColor }
              : { backgroundColor: '#f0f0f0' },
          ]}
        >
          <TextDefault
            style={[
              styles.messageText,
              isMyMessage ? { color: '#fff' } : { color: '#000' },
            ]}
          >
            {item.text}
          </TextDefault>
          <TextDefault
            style={[
              styles.messageTime,
              isMyMessage ? { color: '#ffffff90' } : { color: '#666' },
            ]}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </TextDefault>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={branding.primaryColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={styles.container}
      edges={['bottom', 'left', 'right']}
    >
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={branding.headerColor} 
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => 
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialIcons 
                name="chat-bubble-outline" 
                size={60} 
                color="#ccc" 
              />
              <TextDefault style={styles.emptyText}>
                No messages yet. Start the conversation!
              </TextDefault>
            </View>
          )}
        />

        <View 
          style={[
            styles.inputContainer,
            { borderTopColor: branding.borderColor || '#f0f0f0' }
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: branding.primaryColor },
              (!inputText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="send" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;