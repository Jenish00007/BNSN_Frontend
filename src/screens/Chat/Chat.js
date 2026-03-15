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
  Modal,
  Keyboard,
  Linking,
  ScrollView,
  Dimensions,
  PixelRatio
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useRoute, useFocusEffect } from '@react-navigation/native'
import io from 'socket.io-client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'
import { useSubscription } from '../../context/Subscription'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useAppBranding } from '../../utils/translationHelper'
import { API_URL } from '../../config/api'

// ─── Responsive helpers ───────────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

// Clamp a value between min and max
const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

// Scale font size relative to a 375-pt base width
const scaleFontSize = (size) => {
  const scale = SCREEN_W / 375
  return clamp(
    Math.round(PixelRatio.roundToNearestPixel(size * scale)),
    size * 0.85,
    size * 1.2
  )
}

// Scale a spacing/layout value relative to a 375-pt base width
const scaleSize = (size) => {
  const scale = SCREEN_W / 375
  return clamp(
    Math.round(PixelRatio.roundToNearestPixel(size * scale)),
    size * 0.8,
    size * 1.3
  )
}

const isSmallScreen = SCREEN_W < 360
const isLargeScreen = SCREEN_W >= 428
const isTablet = SCREEN_W >= 768

// ─── Responsive StyleSheet ────────────────────────────────────────────────────
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSize(12)
  },
  loadingText: {
    fontSize: scaleFontSize(14),
    color: '#64748b',
    marginTop: scaleSize(8)
  },

  // ── Connection / banner ──
  connectionStatus: {
    backgroundColor: '#FEF3C7',
    paddingVertical: scaleSize(6),
    paddingHorizontal: scaleSize(16),
    alignItems: 'center'
  },
  connectionText: {
    color: '#92400E',
    fontSize: scaleFontSize(12),
    fontWeight: '500'
  },
  chatDisabledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(14),
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA'
  },
  chatDisabledText: {
    color: '#B91C1C',
    fontSize: scaleFontSize(13),
    flex: 1,
    lineHeight: scaleFontSize(18)
  },

  // ── Product header strip ──
  productHeaderStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(12),
    borderBottomWidth: 1,
    minHeight: scaleSize(72)
  },
  productHeaderImage: {
    width: scaleSize(isTablet ? 72 : 56),
    height: scaleSize(isTablet ? 72 : 56),
    borderRadius: scaleSize(8),
    backgroundColor: '#f1f5f9',
    resizeMode: 'cover',
    flexShrink: 0
  },
  productHeaderTextWrap: {
    flex: 1,
    marginLeft: scaleSize(10),
    justifyContent: 'center',
    minWidth: 0 // allow text truncation
  },
  productHeaderCategory: {
    fontSize: scaleFontSize(11),
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: scaleSize(2)
  },
  productHeaderTitle: {
    fontSize: scaleFontSize(isTablet ? 16 : 14),
    color: '#1e293b',
    fontWeight: '600',
    lineHeight: scaleFontSize(20),
    flexShrink: 1
  },
  productHeaderPrice: {
    fontSize: scaleFontSize(isTablet ? 16 : 14),
    fontWeight: '700',
    marginTop: scaleSize(2)
  },

  // ── CTA banner ──
  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(12),
    minHeight: scaleSize(40)
  },
  ctaBannerText: {
    fontSize: scaleFontSize(13),
    color: '#92400E',
    fontWeight: '500',
    flexShrink: 1
  },
  ctaBannerButton: {
    fontSize: scaleFontSize(13),
    fontWeight: '700',
    marginLeft: scaleSize(8),
    flexShrink: 0
  },

  // ── Messages list ──
  messagesList: {
    paddingHorizontal: scaleSize(isTablet ? 24 : 12),
    paddingTop: scaleSize(8)
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scaleSize(48)
  },
  emptyText: {
    fontSize: scaleFontSize(16),
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: scaleSize(12)
  },
  emptySubText: {
    fontSize: scaleFontSize(13),
    color: '#cbd5e1',
    marginTop: scaleSize(4)
  },

  // ── Message bubbles ──
  messageContainer: {
    marginVertical: scaleSize(1),
    maxWidth: isTablet ? '60%' : '80%'
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end'
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start'
  },
  firstInGroup: {
    marginTop: scaleSize(6)
  },
  lastInGroup: {
    marginBottom: scaleSize(4)
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSize(4),
    marginLeft: scaleSize(4)
  },
  avatarContainer: {
    marginRight: scaleSize(6)
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  userAvatar: {
    width: scaleSize(isTablet ? 36 : 28),
    height: scaleSize(isTablet ? 36 : 28),
    borderRadius: scaleSize(isTablet ? 18 : 14)
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: '#fff',
    fontSize: scaleFontSize(isTablet ? 16 : 12),
    fontWeight: '700'
  },
  userName: {
    fontSize: scaleFontSize(12),
    color: '#64748b',
    fontWeight: '500'
  },
  userRoleBadge: {
    fontSize: scaleFontSize(10),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: scaleSize(1)
  },
  messageBubble: {
    paddingHorizontal: scaleSize(isTablet ? 16 : 12),
    paddingVertical: scaleSize(isTablet ? 10 : 8),
    borderRadius: scaleSize(20),
    borderTopLeftRadius: scaleSize(4),
    borderTopRightRadius: scaleSize(4),
    maxWidth: '100%'
  },
  messageText: {
    fontSize: scaleFontSize(isTablet ? 16 : 15),
    lineHeight: scaleFontSize(isTablet ? 22 : 21)
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: scaleSize(4),
    gap: scaleSize(3)
  },
  messageTime: {
    fontSize: scaleFontSize(11)
  },
  readIndicator: {
    marginLeft: scaleSize(2)
  },

  // ── Date header ──
  dateHeader: {
    alignItems: 'center',
    marginVertical: scaleSize(12)
  },
  dateText: {
    fontSize: scaleFontSize(11),
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(3),
    borderRadius: scaleSize(10),
    overflow: 'hidden',
    fontWeight: '500'
  },

  // ── Typing indicator ──
  typingIndicator: {
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(6),
    alignSelf: 'flex-start'
  },
  typingText: {
    fontSize: scaleFontSize(13),
    color: '#94a3b8',
    fontStyle: 'italic'
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    backgroundColor: '#fff'
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(6),
    paddingVertical: scaleSize(10),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabText: {
    fontSize: scaleFontSize(12),
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 0.5
  },

  // ── Input area ──
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(isSmallScreen ? 6 : 8),
    paddingBottom: scaleSize(isSmallScreen ? 8 : 10)
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: scaleSize(8)
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: scaleSize(22),
    paddingHorizontal: scaleSize(16),
    paddingTop: scaleSize(10),
    paddingBottom: scaleSize(10),
    fontSize: scaleFontSize(15),
    color: '#1e293b',
    maxHeight: scaleSize(isTablet ? 140 : 110),
    minHeight: scaleSize(isTablet ? 48 : 42),
    lineHeight: scaleFontSize(20)
  },
  sendButton: {
    width: scaleSize(isTablet ? 48 : 42),
    height: scaleSize(isTablet ? 48 : 42),
    borderRadius: scaleSize(isTablet ? 24 : 21),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },
  sendButtonDisabled: {
    opacity: 0.4
  },

  // ── Make offer ──
  makeOfferContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    paddingHorizontal: scaleSize(16),
    paddingTop: scaleSize(14),
    paddingBottom: scaleSize(isSmallScreen ? 12 : 16)
  },
  makeOfferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleSize(14),
    borderRadius: scaleSize(12),
    marginBottom: scaleSize(12)
  },
  makeOfferButtonText: {
    color: '#fff',
    fontSize: scaleFontSize(15),
    fontWeight: '700',
    letterSpacing: 0.5
  },
  suggestedPricesScroll: {
    marginBottom: scaleSize(10)
  },
  priceChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: scaleSize(20),
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    marginRight: scaleSize(8),
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  priceChipText: {
    fontSize: scaleFontSize(13),
    color: '#334155',
    fontWeight: '600'
  },
  currentOfferLabel: {
    fontSize: scaleFontSize(22),
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginVertical: scaleSize(8)
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: scaleSize(8),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(8),
    gap: scaleSize(8),
    marginBottom: scaleSize(10)
  },
  feedbackBannerText: {
    fontSize: scaleFontSize(13),
    color: '#166534',
    flex: 1,
    lineHeight: scaleFontSize(18)
  },
  sendOfferButton: {
    paddingVertical: scaleSize(14),
    borderRadius: scaleSize(12),
    alignItems: 'center'
  },
  sendOfferButtonText: {
    color: '#fff',
    fontSize: scaleFontSize(15),
    fontWeight: '700'
  },

  // ── Elite modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end'
  },
  eliteModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: scaleSize(24),
    borderTopRightRadius: scaleSize(24),
    paddingHorizontal: scaleSize(isTablet ? 40 : 20),
    paddingTop: scaleSize(20),
    paddingBottom: scaleSize(isSmallScreen ? 24 : 32),
    // Cap width on tablets to avoid content stretching too wide
    ...(isTablet && {
      maxWidth: 520,
      alignSelf: 'center',
      width: '100%',
      borderRadius: scaleSize(24)
    })
  },
  eliteModalClose: {
    alignSelf: 'flex-end',
    padding: scaleSize(4)
  },
  eliteLogoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(10),
    backgroundColor: '#1e293b',
    borderRadius: scaleSize(14),
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(12),
    alignSelf: 'flex-start',
    marginBottom: scaleSize(16)
  },
  eliteLogoText: {
    color: '#fff',
    fontSize: scaleFontSize(16),
    fontWeight: '800',
    letterSpacing: 1
  },
  eliteModalTitle: {
    fontSize: scaleFontSize(isTablet ? 22 : 20),
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: scaleSize(6),
    lineHeight: scaleFontSize(28)
  },
  eliteModalSubtitle: {
    fontSize: scaleFontSize(14),
    color: '#64748b',
    marginBottom: scaleSize(18),
    lineHeight: scaleFontSize(20)
  },
  elitePackageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(10),
    marginBottom: scaleSize(6)
  },
  elitePackageLabel: {
    fontSize: scaleFontSize(15),
    fontWeight: '700',
    color: '#1e293b'
  },
  eliteSavingsBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: scaleSize(20),
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(3)
  },
  eliteSavingsText: {
    fontSize: scaleFontSize(11),
    color: '#166534',
    fontWeight: '700'
  },
  elitePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: scaleSize(8),
    marginBottom: scaleSize(8)
  },
  elitePriceOld: {
    fontSize: scaleFontSize(16),
    color: '#94a3b8',
    textDecorationLine: 'line-through'
  },
  elitePriceNew: {
    fontSize: scaleFontSize(28),
    fontWeight: '800'
  },
  elitePricePer: {
    fontSize: scaleFontSize(13),
    color: '#64748b'
  },
  elitePackageNote: {
    fontSize: scaleFontSize(12),
    color: '#94a3b8',
    marginBottom: scaleSize(18),
    lineHeight: scaleFontSize(17)
  },
  elitePayButton: {
    paddingVertical: scaleSize(15),
    borderRadius: scaleSize(14),
    alignItems: 'center',
    marginBottom: scaleSize(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },
  elitePayButtonText: {
    color: '#fff',
    fontSize: scaleFontSize(16),
    fontWeight: '700'
  },
  eliteBuyCreditsButton: {
    paddingVertical: scaleSize(13),
    borderRadius: scaleSize(14),
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: scaleSize(14)
  },
  eliteBuyCreditsButtonText: {
    fontSize: scaleFontSize(14),
    fontWeight: '700'
  },
  eliteExploreLink: {
    fontSize: scaleFontSize(13),
    textAlign: 'center',
    fontWeight: '600',
    paddingVertical: scaleSize(4)
  }
})

// ─── Role helpers ─────────────────────────────────────────────────────────────
const normalizeRoleValue = (value) => {
  if (!value) return null
  const normalized = value.toString().trim().toLowerCase()
  if (
    ['seller', 'vendor', 'shop', 'store', 'merchant'].some((k) =>
      normalized.includes(k)
    )
  )
    return 'seller'
  if (
    ['buyer', 'user', 'customer', 'client'].some((k) => normalized.includes(k))
  )
    return 'buyer'
  return null
}

const deriveUserRole = (entity) => {
  if (!entity) return null

  // Check if it's a Shop (seller) by looking for shop-specific fields
  if (
    entity.businessHours !== undefined ||
    entity.availableBalance !== undefined ||
    entity.featured !== undefined
  ) {
    return 'seller'
  }

  // Check if it's a User (buyer) by looking for user-specific fields
  if (
    entity.contactViews !== undefined ||
    entity.contactCredits !== undefined ||
    entity.viewedContacts !== undefined
  ) {
    return 'buyer'
  }

  // Check explicit role fields
  if (typeof entity.isSeller === 'boolean')
    return entity.isSeller ? 'seller' : 'buyer'
  if (typeof entity.isBuyer === 'boolean')
    return entity.isBuyer ? 'buyer' : 'seller'

  // Check ID-based relationships
  if (
    entity.shopId ||
    entity.shop_id ||
    entity.storeId ||
    entity.store_id ||
    entity.sellerId ||
    entity.seller_id
  )
    return 'seller'
  if (entity.customerId || entity.customer_id) return 'buyer'

  // Check role string values
  const candidates = [
    entity.role,
    entity.userType,
    entity.accountType,
    entity.type,
    entity.accountRole,
    entity.profileType
  ]
  for (const f of candidates) {
    const n = normalizeRoleValue(f)
    if (n) return n
  }

  // Check address patterns (less reliable but fallback)
  if (entity.address && !Array.isArray(entity.addresses)) return 'seller'
  if (Array.isArray(entity.addresses)) return 'buyer'

  return null
}

const getOppositeRole = (role) => {
  if (role === 'seller') return 'buyer'
  if (role === 'buyer') return 'seller'
  return null
}

// ─── Chat component ───────────────────────────────────────────────────────────
const Chat = ({ navigation }) => {
  const route = useRoute()
  const {
    conversationId: initialConversationId,
    groupTitle,
    otherUser,
    shopId,
    shopName,
    productId,
    product: initialProduct,
    displayName: initialDisplayName,
    isChatDisabled: initialChatDisabled = false,
    chatDisabledReason: initialChatDisabledReason = null,
    forceNavigate = false,
    currentUserRole: initialCurrentUserRole,
    otherUserRole: initialOtherUserRole
  } = route.params || {}

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState(initialConversationId)

  // Create conversation if none exists
  const createConversationIfNeeded = async () => {
    if (!conversationId && productId && otherUser) {
      console.log('🔔 [CHAT] No conversation exists, creating new one...')
      console.log('🔔 [CHAT] Product ID:', productId)
      console.log(
        '🔔 [CHAT] Product name:',
        productDetails?.name || initialProduct?.name
      )
      console.log('🔔 [CHAT] Other user:', otherUser.name)
      console.log('🔔 [CHAT] Current user:', profile.name)

      try {
        const token = await AsyncStorage.getItem('token')
        if (!token) {
          console.error('🔔 [CHAT] No auth token found')
          return null
        }

        const conversationData = {
          groupTitle: displayName || otherUser.name || 'Conversation',
          userId: profile._id,
          sellerId: otherUser._id,
          productId: productId
        }

        console.log(
          '🔔 [CHAT] Creating conversation with data:',
          conversationData
        )

        const response = await fetch(
          `${API_URL}/conversation/create-new-conversation`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(conversationData)
          }
        )

        const data = await response.json()
        console.log('🔔 [CHAT] Conversation creation response:', data)

        if (data.success && data.conversation) {
          console.log(
            '🔔 [CHAT] New conversation created:',
            data.conversation._id
          )
          setConversationId(data.conversation._id)

          // Update route params to reflect the new conversation
          navigation.setParams({
            conversationId: data.conversation._id
          })

          // Emit event to refresh ChatList
          if (navigation.emit) {
            navigation.emit('conversationCreated', {
              conversationId: data.conversation._id,
              productId: productId,
              otherUser: otherUser
            })
          }

          // Alternative: Force ChatList refresh by navigating back and forth
          // This ensures the ChatList will refetch conversations
          try {
            navigation.getParent()?.setParams({
              refreshChatList: Date.now()
            })
          } catch (error) {
            console.log('🔔 [CHAT] Could not refresh ChatList:', error.message)
          }

          return data.conversation._id
        } else {
          console.error('🔔 [CHAT] Failed to create conversation:', data)
          console.error(
            '🔔 [CHAT] Error details:',
            data.message || 'Unknown error'
          )
          return null
        }
      } catch (error) {
        console.error('🔔 [CHAT] Error creating conversation:', error)
        console.error('🔔 [CHAT] Error stack:', error.stack)
        return null
      }
    }
    return conversationId
  }

  // Log conversation ID for debugging
  useEffect(() => {
    console.log('🔔 [CHAT] Conversation ID from params:', initialConversationId)
    console.log('🔔 [CHAT] Current conversation ID state:', conversationId)
    console.log('🔔 [CHAT] Route params:', route.params)

    // Validate conversation ID format
    if (initialConversationId) {
      console.log(
        '🔔 [CHAT] Conversation ID length:',
        initialConversationId.length
      )
      console.log(
        '🔔 [CHAT] Conversation ID format check:',
        /^[0-9a-f]{24}$/.test(initialConversationId) ? 'Valid' : 'Invalid'
      )
    } else {
      console.log(
        '🔔 [CHAT] No initial conversation ID - will create if needed'
      )
    }
  }, [initialConversationId, conversationId, route.params])
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [chatDisabled, setChatDisabled] = useState(Boolean(initialChatDisabled))
  const [typingTimeout, setTypingTimeout] = useState(null)
  const [chatDisabledReason, setChatDisabledReason] = useState(
    initialChatDisabledReason || ''
  )
  const [productDetails, setProductDetails] = useState(initialProduct || null)
  const [eliteModalVisible, setEliteModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [offerAmount, setOfferAmount] = useState(null)
  const [fetchingSellerPhone, setFetchingSellerPhone] = useState(false)

  const flatListRef = useRef(null)
  const sendButtonScale = useRef(new Animated.Value(1)).current
  const typingOpacity = useRef(new Animated.Value(0)).current
  const socketInitializedRef = useRef(false)
  const handlingShopIdRef = useRef(false)
  const lastMarkedReadRef = useRef({ conversationId: null, timestamp: 0 })

  const { token } = useContext(AuthContext)
  const { formetedProfileData: profile } = useContext(UserContext)
  const {
    canViewContact,
    addViewedContact,
    hasViewedContact,
    hasUnlimitedContacts
  } = useSubscription()
  const branding = useAppBranding()

  const displayName =
    initialDisplayName ||
    otherUser?.displayName ||
    otherUser?.name ||
    groupTitle ||
    shopName ||
    'Chat'

  const detectedSelfRole = useMemo(() => {
    // First prioritize role passed from ChatList
    if (initialCurrentUserRole) {
      return initialCurrentUserRole
    }

    // Check if current user is the shop owner
    if (shopId && profile?._id === shopId) {
      return 'seller'
    }

    // Check if current user is a buyer (not shop owner)
    if (shopId && profile?._id !== shopId) {
      return 'buyer'
    }

    // Fallback to role detection from profile
    const directRole = deriveUserRole(profile)
    if (directRole) return directRole

    return null
  }, [profile, shopId, initialCurrentUserRole])

  const detectedOtherRole = useMemo(() => {
    // First prioritize role passed from ChatList
    if (initialOtherUserRole) {
      return initialOtherUserRole
    }

    // If we have shopId, the other person is the shop owner (seller)
    if (shopId) {
      return 'seller'
    }

    // Check direct role from other user data
    const directRole = deriveUserRole(otherUser)
    if (directRole) return directRole

    // If we know self role, infer opposite
    if (detectedSelfRole) {
      const opp = getOppositeRole(detectedSelfRole)
      if (opp) return opp
    }

    return null
  }, [otherUser, shopId, detectedSelfRole, initialOtherUserRole])

  const resolvedSelfRole = useMemo(() => {
    // Use detected role if available
    if (detectedSelfRole) return detectedSelfRole

    // If other person is seller, we must be buyer
    if (detectedOtherRole === 'seller') return 'buyer'

    // If other person is buyer, we must be seller
    if (detectedOtherRole === 'buyer') return 'seller'

    // Default fallback: if shopId exists and we're not the owner, we're buyer
    if (shopId && profile?._id !== shopId) return 'buyer'

    // Last resort
    return 'buyer'
  }, [detectedSelfRole, detectedOtherRole, shopId, profile])

  const resolvedOtherRole = useMemo(() => {
    // Use detected role if available
    if (detectedOtherRole) return detectedOtherRole

    // If shopId exists, other person is seller
    if (shopId) return 'seller'

    // If we know self role, infer opposite
    if (resolvedSelfRole) {
      const opp = getOppositeRole(resolvedSelfRole)
      if (opp) return opp
    }

    return null
  }, [detectedOtherRole, shopId, resolvedSelfRole])

  const productForHeader = productDetails || initialProduct
  const hasProductHeader = Boolean(
    productForHeader && (productForHeader.name || productForHeader._id)
  )

  // ── Fetch product details ──
  useEffect(() => {
    const hasFullProduct =
      productDetails?.price != null ||
      productDetails?.discountPrice != null ||
      productDetails?.image
    if (productId && !hasFullProduct) {
      let cancelled = false
      const fetchProduct = async () => {
        try {
          const res = await fetch(`${API_URL}/event/get-product/${productId}`, {
            headers: { 'Content-Type': 'application/json' }
          })
          const data = await res.json()
          if (!cancelled && data.success && data.product) {
            setProductDetails((prev) => ({ ...prev, ...data.product }))
          }
        } catch (err) {
          if (!cancelled) console.error('Error fetching product for chat:', err)
        }
      }
      fetchProduct()
      return () => {
        cancelled = true
      }
    }
  }, [productId])

  // Replace with your PC's IP address on the same Wi‑Fi network
  const SOCKET_URL = 'https://7ark.in' // ── Socket init ──
  useEffect(() => {
    if (!socketInitializedRef.current) {
      initializeChat()
      socketInitializedRef.current = true
    }
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout)
      if (socket) {
        if (profile?._id && (conversationId || route.params?.conversationId)) {
          socket.emit('leave-chat-room', {
            userId: profile._id,
            conversationId: conversationId || route.params?.conversationId
          })
        }
        socket.disconnect()
      }
    }
  }, [])

  // ── Conversation switch ──
  useEffect(() => {
    if (
      socket &&
      isConnected &&
      initialConversationId &&
      initialConversationId !== conversationId
    ) {
      setMessages([])
      setLoading(true)
      if (conversationId)
        socket.emit('leave-chat-room', { userId: profile._id, conversationId })
      socket.emit('join-chat-room', {
        userId: profile._id,
        conversationId: initialConversationId
      })
      fetchMessages(initialConversationId)
      setConversationId(initialConversationId)
    }
  }, [initialConversationId, socket, isConnected, conversationId])

  // ── Handle shopId ──
  useEffect(() => {
    const handleShopId = async () => {
      if (handlingShopIdRef.current) return
      if (socket && isConnected && shopId && !conversationId) {
        handlingShopIdRef.current = true
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
          if (response.ok && data.success && data.conversation) {
            const newId = data.conversation._id
            setMessages([])
            setLoading(true)
            socket.emit('join-chat-room', {
              userId: profile._id,
              conversationId: newId
            })
            fetchMessages(newId)
            setConversationId(newId)
            navigation.setParams({
              conversationId: newId,
              groupTitle: shopName || 'Chat',
              displayName: shopName || 'Chat'
            })
          } else {
            const msg =
              data?.message ||
              'Unable to start a chat for this listing at the moment.'
            Alert.alert('Chat unavailable', msg)
            setChatDisabled(true)
            setChatDisabledReason(msg)
          }
        } catch (error) {
          console.error('Error creating conversation:', error)
          Alert.alert(
            'Chat unavailable',
            'Unable to start a conversation for this listing.'
          )
        } finally {
          handlingShopIdRef.current = false
        }
      }
    }
    handleShopId()
  }, [shopId, socket, isConnected, conversationId])

  // ── Focus effect: refresh & mark read ──
  useFocusEffect(
    useCallback(() => {
      if (socket && profile?._id && isConnected && conversationId) {
        fetchMessages(conversationId)
        markMessagesAsRead(conversationId)
      }
    }, [socket, profile?._id, isConnected, conversationId])
  )

  // ── Scroll on new messages ──
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => scrollToBottom(), 100)
    }
  }, [messages, loading, scrollToBottom])

  // ── Keyboard handling (Android) ──
  useEffect(() => {
    if (Platform.OS === 'android') {
      const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
        setKeyboardHeight(e.endCoordinates.height)
        setTimeout(() => scrollToBottom(), 100)
      })
      const hideSub = Keyboard.addListener('keyboardDidHide', () =>
        setKeyboardHeight(0)
      )
      return () => {
        showSub.remove()
        hideSub.remove()
      }
    }
  }, [scrollToBottom])

  // ── Header options ──
  useEffect(() => {
    const getRoleContextText = () => {
      if (resolvedSelfRole === 'seller') {
        return 'Selling'
      } else if (resolvedSelfRole === 'buyer') {
        return 'Buying'
      }
      return null
    }

    const roleContext = getRoleContextText()
    const headerTitle = roleContext
      ? `${displayName} (${roleContext})`
      : displayName || 'Chat'

    navigation.setOptions({
      title: headerTitle,
      headerStyle: {
        backgroundColor: branding.primaryColor || '#007AFF',
        shadowColor: branding.primaryColor || '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
      },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700', fontSize: scaleFontSize(16) },
      headerRight: () => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: scaleSize(8)
          }}
        >
          {resolvedSelfRole === 'buyer' && shopId && (
            <TouchableOpacity
              onPress={handleCallPress}
              disabled={
                fetchingSellerPhone ||
                (!canViewContact() && !hasUnlimitedContacts)
              }
              style={{ padding: scaleSize(8), marginRight: scaleSize(4) }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              {fetchingSellerPhone ? (
                <ActivityIndicator size='small' color='#fff' />
              ) : (
                <View style={{ position: 'relative' }}>
                  <MaterialIcons
                    name='phone'
                    size={scaleSize(24)}
                    color={
                      !canViewContact() && !hasUnlimitedContacts
                        ? '#ccc'
                        : '#fff'
                    }
                  />
                  {!hasUnlimitedContacts && !canViewContact() && (
                    <View
                      style={{
                        position: 'absolute',
                        right: -4,
                        top: -4,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: 8,
                        width: 16,
                        height: 16,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: branding.primaryColor,
                          fontWeight: '700'
                        }}
                      >
                        ?
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          )}
          {resolvedSelfRole === 'seller' && (
            <TouchableOpacity
              style={{ padding: scaleSize(8), marginRight: scaleSize(4) }}
              onPress={() => {
                Alert.alert(
                  'Seller Tools',
                  'As a seller, you can:\n\n• View buyer inquiries\n• Respond to messages\n• Manage your listings',
                  [{ text: 'OK', style: 'default' }]
                )
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name='store' size={scaleSize(24)} color='#fff' />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ padding: scaleSize(8) }}
            onPress={() => {}}
          >
            <MaterialIcons name='more-vert' size={scaleSize(24)} color='#fff' />
          </TouchableOpacity>
        </View>
      )
    })
  }, [
    navigation,
    displayName,
    branding,
    resolvedSelfRole,
    shopId,
    handleCallPress,
    hasUnlimitedContacts,
    canViewContact,
    fetchingSellerPhone
  ])

  // ── Animations ──
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

  const markMessagesAsRead = (convId) => {
    const now = Date.now()
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
      const socketInstance = io(SOCKET_URL, {
        auth: { token },
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      })
      setSocket(socketInstance)

      socketInstance.on('connect', () => {
        console.log('🔔 [CHAT] Socket connected, ID:', socketInstance.id)
        setIsConnected(true)

        // Try to create conversation if needed, then join
        const joinOrCreateConversation = async () => {
          const convId = await createConversationIfNeeded()

          if (convId) {
            console.log('🔔 [CHAT] Joining conversation room:', convId)
            console.log('🔔 [CHAT] User ID:', profile._id)

            socketInstance.emit('join-chat-room', {
              userId: profile._id,
              conversationId: convId
            })

            fetchMessages(convId)
            markMessagesAsRead(convId)
          } else {
            console.error(
              '🔔 [CHAT] No conversation ID available for joining room'
            )
            Alert.alert('Error', 'Unable to create or join conversation')
            navigation.goBack()
          }
        }

        joinOrCreateConversation()
      })
      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
        setLoading(false)
        Alert.alert('Connection Error', 'Failed to connect to chat server.')
      })
      socketInstance.on('disconnect', (reason) => {
        setIsConnected(false)
        if (reason === 'io server disconnect') socketInstance.connect()
      })
      socketInstance.on('reconnect', () => {
        setIsConnected(true)
        if (conversationId) {
          socketInstance.emit('join-chat-room', {
            userId: profile._id,
            conversationId
          })
          fetchMessages(conversationId)
        }
      })
      socketInstance.on('receive-message', (message) => {
        console.log('🔔 [CHAT] Received message:', message)
        if (message && message.text && message._id) {
          console.log('🔔 [CHAT] Adding message to chat:', {
            id: message._id,
            text: message.text.substring(0, 50) + '...',
            sender: message.sender,
            isFromCurrentUser: message.sender === profile._id
          })

          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) {
              console.log('🔔 [CHAT] Message already exists, skipping')
              return prev
            }
            const newMessages = [...prev, message]
            console.log(
              '🔔 [CHAT] Message added. Total messages:',
              newMessages.length
            )
            return newMessages
          })

          // Auto-scroll to new message
          setTimeout(() => scrollToBottom(), 100)

          // Mark as read if it's not from current user
          if (message.sender !== profile._id) {
            console.log('🔔 [CHAT] Marking message as read (from other user)')
            markMessagesAsRead(conversationId)
          } else {
            console.log(
              '🔔 [CHAT] Message from current user, not marking as read'
            )
          }
        } else {
          console.warn('🔔 [CHAT] Invalid message received:', message)
        }
      })
      socketInstance.on('messages-marked-read', () => {
        setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
      })
      socketInstance.on('user-typing', (data) => {
        if (data.userId !== profile._id) showTypingIndicator()
      })
      socketInstance.on('user-stopped-typing', (data) => {
        if (data.userId !== profile._id) hideTypingIndicator()
      })
      socketInstance.on('chat-disabled', (payload) => {
        if (
          payload?.conversationId &&
          conversationId &&
          payload.conversationId !== conversationId
        )
          return
        setChatDisabled(true)
        setChatDisabledReason(
          payload?.reason || 'This conversation is no longer active.'
        )
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

  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout)
    }
  }, [typingTimeout])

  const handleTyping = (text) => {
    setInputText(text)
    if (socket && isConnected && conversationId && text.trim()) {
      if (typingTimeout) clearTimeout(typingTimeout)
      socket.emit('typing', { conversationId, userId: profile._id })
      const newTimeout = setTimeout(() => {
        if (socket && isConnected && conversationId) {
          socket.emit('stop-typing', { conversationId, userId: profile._id })
        }
      }, 1000)
      setTypingTimeout(newTimeout)
    } else if (socket && isConnected && conversationId && !text.trim()) {
      socket.emit('stop-typing', { conversationId, userId: profile._id })
    }
  }

  const fetchMessages = async (convId = null) => {
    try {
      const convIdToUse = convId || conversationId
      if (!convIdToUse) {
        console.log('🔔 [CHAT] No conversation ID provided for fetchMessages')
        setLoading(false)
        return
      }

      console.log('🔔 [CHAT] Fetching messages for conversation:', convIdToUse)
      const response = await fetch(
        `${API_URL}/message/get-all-messages/${convIdToUse}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      const data = await response.json()

      if (data.success) {
        console.log('🔔 [CHAT] Messages fetched successfully:', {
          totalMessages: data.messages?.length || 0,
          conversationId: convIdToUse
        })

        // Log first few messages for debugging
        if (data.messages && data.messages.length > 0) {
          console.log(
            '🔔 [CHAT] Sample messages:',
            data.messages.slice(0, 3).map((m) => ({
              id: m._id,
              text: m.text?.substring(0, 30) + '...',
              sender: m.sender,
              createdAt: m.createdAt
            }))
          )
        }

        setMessages(data.messages || [])
        setLoading(false)
        setTimeout(() => scrollToBottom(), 300)
      } else {
        console.error('🔔 [CHAT] Failed to fetch messages:', data)
        setLoading(false)
      }
    } catch (error) {
      console.error('🔔 [CHAT] Error fetching messages:', error)
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (chatDisabled) {
      Alert.alert(
        'Chat disabled',
        chatDisabledReason || 'This conversation is no longer available.'
      )
      return
    }
    if (!inputText.trim() || sending || !isConnected) return
    const messageText = inputText.trim()
    setInputText('')
    setSending(true)
    animateSendButton()
    if (socket && isConnected && conversationId) {
      socket.emit('stop-typing', { conversationId, userId: profile._id })
    }
    try {
      if (socket) {
        socket.emit('send-message', {
          conversationId,
          sender: profile._id,
          text: messageText
        })
      } else {
        const formData = new FormData()
        formData.append('conversationId', conversationId)
        formData.append('sender', profile._id)
        formData.append('text', messageText)
        const response = await fetch(`${API_URL}/message/create-new-message`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })
        const data = await response.json()
        if (!response.ok)
          throw new Error(
            data?.message || 'Unable to send message for this conversation.'
          )
        if (data.success) {
          await updateLastMessage(messageText, data.message._id)
          await fetchMessages()
        }
      }
      setSending(false)
    } catch (error) {
      console.error('Error sending message:', error)
      setSending(false)
      const message =
        error?.message ||
        'Failed to send message. This chat may no longer be active.'
      if (
        message.toLowerCase().includes('no longer active') ||
        message.toLowerCase().includes('sold')
      ) {
        setChatDisabled(true)
        setChatDisabledReason(message)
      }
      Alert.alert('Error', message)
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
          body: JSON.stringify({ lastMessage: text, lastMessageId: messageId })
        }
      )
    } catch (error) {
      console.error('Error updating last message:', error)
    }
  }

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      try {
        // Use a longer timeout to ensure the FlatList is fully rendered
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true })
          }
        }, 200)
      } catch (error) {
        console.warn('Error scrolling to bottom:', error)
      }
    }
  }, [messages.length])

  const getSellerPhone = useCallback(async () => {
    const phone = otherUser?.phoneNumber || otherUser?.phone
    if (phone) return phone
    if (!shopId) return null
    try {
      const res = await fetch(`${API_URL}/shop/get-shop/${shopId}`, {
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.success && data.shop)
        return data.shop.phoneNumber || data.shop.phone || null
    } catch (err) {
      console.error('Error fetching seller phone:', err)
    }
    return null
  }, [otherUser, shopId])

  const handleCallPress = useCallback(async () => {
    if (chatDisabled) return
    const contactId = shopId || otherUser?._id
    if (!hasUnlimitedContacts && !canViewContact()) {
      setEliteModalVisible(true)
      return
    }
    setFetchingSellerPhone(true)
    try {
      const phone = await getSellerPhone()
      if (phone) {
        // Only reduce contact credit if this seller's contact hasn't been viewed yet
        if (
          !hasUnlimitedContacts &&
          contactId &&
          !hasViewedContact(contactId)
        ) {
          await addViewedContact(contactId)
        }
        await Linking.openURL(`tel:${phone}`)
      } else {
        Alert.alert(
          'Phone unavailable',
          'Seller phone number is not available right now.'
        )
      }
    } catch (err) {
      console.error('Call error:', err)
      Alert.alert('Error', 'Unable to start the call. Please try again.')
    } finally {
      setFetchingSellerPhone(false)
    }
  }, [
    hasUnlimitedContacts,
    canViewContact,
    hasViewedContact,
    chatDisabled,
    getSellerPhone,
    addViewedContact,
    shopId,
    otherUser
  ])

  const handleSendOffer = useCallback(() => {
    if (chatDisabled || !offerAmount || sending || !isConnected) return
    const text = `I'd like to offer ₹${offerAmount}`
    setInputText('')
    setOfferAmount(null)
    setActiveTab('chat')
    if (socket)
      socket.emit('send-message', { conversationId, sender: profile._id, text })
  }, [
    chatDisabled,
    offerAmount,
    sending,
    isConnected,
    socket,
    conversationId,
    profile._id
  ])

  const formatMessageTime = (timestamp) => {
    const d = new Date(timestamp)
    const diffH = (Date.now() - d) / (1000 * 60 * 60)
    return diffH < 24
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const formatDate = (timestamp) => {
    const d = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    })
  }

  const renderDateHeader = ({ item, index }) => {
    if (index === 0)
      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      )
    const prev = messages[index - 1]
    if (
      new Date(item.createdAt).toDateString() !==
      new Date(prev.createdAt).toDateString()
    ) {
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
    return colors[name ? name.charCodeAt(0) % colors.length : 0]
  }

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.sender === profile._id
    const isFirstInGroup =
      index === 0 || messages[index - 1].sender !== item.sender
    const isLastInGroup =
      index === messages.length - 1 ||
      messages[index + 1].sender !== item.sender
    const messageRole = isMyMessage
      ? resolvedSelfRole
      : resolvedOtherRole || getOppositeRole(resolvedSelfRole) || 'seller'
    const otherParticipantLabel = displayName || otherUser?.name || 'User'
    const sellerColor = branding.primaryColor || '#007AFF'
    const buyerColor = branding.accentColor || '#E2E8F0'
    const bubbleBg = messageRole === 'seller' ? sellerColor : buyerColor
    const msgColor =
      messageRole === 'seller' ? '#fff' : branding.textColor || '#1e293b'
    const metaColor =
      messageRole === 'seller' ? '#fff' : branding.textColor || '#1e293b'
    const metaOpacity = messageRole === 'seller' ? 0.8 : 0.6
    const bubbleShapeStyles = isMyMessage
      ? {
          backgroundColor: bubbleBg,
          borderBottomRightRadius: isLastInGroup ? 20 : 4,
          borderBottomLeftRadius: 20
        }
      : {
          backgroundColor: bubbleBg,
          borderBottomLeftRadius: isLastInGroup ? 20 : 4,
          borderBottomRightRadius: 20
        }
    const readIconColor =
      messageRole === 'seller'
        ? 'rgba(255,255,255,0.9)'
        : branding.primaryColor || '#1e293b'

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
                      {(displayName || otherUser?.name || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userInfoContainer}>
                <Text style={styles.userName}>{otherParticipantLabel}</Text>
                {messageRole && (
                  <Text
                    style={[
                      styles.userRoleBadge,
                      {
                        color:
                          messageRole === 'seller' ? sellerColor : buyerColor
                      }
                    ]}
                  >
                    {messageRole === 'seller' ? 'Seller' : 'Buyer'}
                  </Text>
                )}
              </View>
            </View>
          )}
          <View style={[styles.messageBubble, bubbleShapeStyles]}>
            <TextDefault style={[styles.messageText, { color: msgColor }]}>
              {item.text}
            </TextDefault>
            <View
              style={[
                styles.messageFooter,
                !isMyMessage && { justifyContent: 'flex-start' }
              ]}
            >
              <TextDefault
                style={[
                  styles.messageTime,
                  { color: metaColor, opacity: metaOpacity }
                ]}
              >
                {formatMessageTime(item.createdAt)}
              </TextDefault>
              {isMyMessage && (
                <MaterialIcons
                  name={item.read ? 'done-all' : 'done'}
                  size={scaleSize(14)}
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
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar
        barStyle='light-content'
        backgroundColor={branding.primaryColor}
      />

      {!isConnected && (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>Connecting...</Text>
        </View>
      )}

      {chatDisabled && (
        <View style={styles.chatDisabledBanner}>
          <MaterialIcons
            name='info'
            size={scaleSize(18)}
            color='#B91C1C'
            style={{ marginRight: scaleSize(8) }}
          />
          <Text style={styles.chatDisabledText}>
            {chatDisabledReason || 'This conversation is no longer active.'}
          </Text>
        </View>
      )}

      {/* Product header strip */}
      {hasProductHeader && productForHeader && (
        <View
          style={[
            styles.productHeaderStrip,
            { borderBottomColor: branding.borderColor || '#e2e8f0' }
          ]}
        >
          <Image
            source={{
              uri:
                productForHeader.image ||
                (productForHeader.images && productForHeader.images[0]) ||
                (productForHeader.images && productForHeader.images[0]?.url) ||
                ''
            }}
            style={styles.productHeaderImage}
            defaultSource={require('../../assets/images/placeholder.png')}
          />
          <View style={styles.productHeaderTextWrap}>
            <Text style={styles.productHeaderCategory} numberOfLines={1}>
              {productForHeader.category?.name ||
                productForHeader.category ||
                'Listing'}
            </Text>
            <TextDefault style={styles.productHeaderTitle} numberOfLines={2}>
              {productForHeader.name || 'Product'}
            </TextDefault>
            <Text
              style={[
                styles.productHeaderPrice,
                { color: branding.primaryColor }
              ]}
            >
              ₹
              {productForHeader.price ??
                productForHeader.discountPrice ??
                productForHeader.askingPrice ??
                '—'}
            </Text>
          </View>
        </View>
      )}

      {/* CTA Banner */}
      {resolvedSelfRole === 'buyer' && shopId && !chatDisabled && (
        <View style={[styles.ctaBanner, { backgroundColor: '#FEF3C7' }]}>
          <MaterialIcons
            name='flash-on'
            size={scaleSize(18)}
            color='#B45309'
            style={{ marginRight: scaleSize(6) }}
          />
          <TouchableOpacity
            style={{ flex: 1, justifyContent: 'center' }}
            onPress={() =>
              !hasUnlimitedContacts && !canViewContact()
                ? setEliteModalVisible(true)
                : null
            }
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.ctaBannerText}>
              Call owners directly to buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Subscription')}
            style={{
              justifyContent: 'center',
              paddingHorizontal: scaleSize(4)
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[styles.ctaBannerButton, { color: branding.primaryColor }]}
            >
              Gold Membership
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1 }}>
          {/* Debug Panel - Console logging only */}
          {__DEV__ &&
            (() => {
              console.log('🔔 [CHAT DEBUG] Chat Debug Info:')
              console.log(
                '🔔 [CHAT DEBUG] Connected:',
                isConnected ? '✅' : '❌'
              )
              console.log('🔔 [CHAT DEBUG] Messages:', messages.length)
              console.log('🔔 [CHAT DEBUG] Room:', conversationId || 'None')
              console.log('🔔 [CHAT DEBUG] User:', profile?._id || 'None')
              console.log(
                '🔔 [CHAT DEBUG] Last Message:',
                messages.length > 0
                  ? messages[messages.length - 1]?.text?.substring(0, 30) +
                      '...'
                  : 'None'
              )
              return null
            })()}

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item._id || index.toString()}
            contentContainerStyle={[
              styles.messagesList,
              {
                flexGrow: 1,
                justifyContent: messages.length === 0 ? 'center' : 'flex-end',
                paddingBottom: scaleSize(16)
              }
            ]}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                setTimeout(() => scrollToBottom(), 100)
              }
            }}
            onLayout={() => {
              if (messages.length > 0) {
                setTimeout(() => scrollToBottom(), 100)
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
                  size={scaleSize(64)}
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

          {isTyping && (
            <Animated.View
              style={[styles.typingIndicator, { opacity: typingOpacity }]}
            >
              <TextDefault style={styles.typingText}>
                {otherUser?.name || 'User'} is typing...
              </TextDefault>
            </Animated.View>
          )}

          {/* Tabs */}
          {hasProductHeader && resolvedSelfRole === 'buyer' && (
            <View
              style={[
                styles.tabRow,
                { borderTopColor: branding.borderColor || '#e2e8f0' }
              ]}
            >
              {[
                { key: 'chat', label: 'CHAT', icon: 'chat-bubble-outline' },
                { key: 'make_offer', label: 'MAKE OFFER', icon: 'handshake' }
              ].map(({ key, label, icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.tab,
                    activeTab === key && {
                      borderBottomColor: branding.primaryColor
                    }
                  ]}
                  onPress={() => setActiveTab(key)}
                >
                  <MaterialIcons
                    name={icon}
                    size={scaleSize(18)}
                    color={
                      activeTab === key ? branding.primaryColor : '#64748b'
                    }
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === key && {
                        color: branding.primaryColor,
                        fontWeight: '700'
                      }
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Input / Offer area */}
          {activeTab !== 'make_offer' ? (
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
                  onChangeText={handleTyping}
                  multiline
                  maxLength={1000}
                  editable={!sending && isConnected && !chatDisabled}
                  textAlignVertical='top'
                  onFocus={() =>
                    setTimeout(() => {
                      if (flatListRef.current) {
                        scrollToBottom()
                      }
                    }, 300)
                  }
                />
                <Animated.View
                  style={{ transform: [{ scale: sendButtonScale }] }}
                >
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      { backgroundColor: branding.primaryColor },
                      (!inputText.trim() ||
                        sending ||
                        !isConnected ||
                        chatDisabled) &&
                        styles.sendButtonDisabled
                    ]}
                    onPress={sendMessage}
                    disabled={
                      !inputText.trim() ||
                      sending ||
                      !isConnected ||
                      chatDisabled
                    }
                  >
                    {sending ? (
                      <ActivityIndicator size='small' color='#fff' />
                    ) : (
                      <MaterialIcons
                        name='send'
                        size={scaleSize(20)}
                        color='#fff'
                      />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.makeOfferContainer,
                { borderTopColor: branding.borderColor || '#e2e8f0' }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.makeOfferButton,
                  { backgroundColor: branding.primaryColor }
                ]}
                onPress={handleSendOffer}
                disabled={
                  !offerAmount || sending || !isConnected || chatDisabled
                }
              >
                <MaterialIcons
                  name='handshake'
                  size={scaleSize(22)}
                  color='#fff'
                  style={{ marginRight: scaleSize(8) }}
                />
                <Text style={styles.makeOfferButtonText}>MAKE OFFER</Text>
              </TouchableOpacity>
              {productForHeader && (
                <>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.suggestedPricesScroll}
                  >
                    {(() => {
                      const base = Number(
                        productForHeader.price ??
                          productForHeader.discountPrice ??
                          productForHeader.askingPrice ??
                          0
                      )
                      if (!base) return []
                      return [1, 0.95, 0.9, 0.85, 0.8].map((r) => base * r)
                    })().map((p, i) => {
                      const amount = Math.round(Number(p))
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.priceChip,
                            offerAmount === amount && {
                              backgroundColor: branding.primaryColor
                            }
                          ]}
                          onPress={() => setOfferAmount(amount)}
                        >
                          <Text
                            style={[
                              styles.priceChipText,
                              offerAmount === amount && { color: '#fff' }
                            ]}
                          >
                            ₹{amount}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
                  <Text style={styles.currentOfferLabel}>
                    {offerAmount != null
                      ? `₹${offerAmount}`
                      : 'Select an amount'}
                  </Text>
                  {offerAmount != null && (
                    <View style={styles.feedbackBanner}>
                      <MaterialIcons
                        name='thumb-up'
                        size={scaleSize(18)}
                        color={branding.primaryColor}
                      />
                      <Text style={styles.feedbackBannerText}>
                        Very good offer! High chances of seller's response.
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.sendOfferButton,
                      { backgroundColor: branding.primaryColor }
                    ]}
                    onPress={handleSendOffer}
                    disabled={
                      !offerAmount || sending || !isConnected || chatDisabled
                    }
                  >
                    <Text style={styles.sendOfferButtonText}>Send</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Elite modal */}
      <Modal
        visible={eliteModalVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setEliteModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setEliteModalVisible(false)}
        >
          <View style={styles.eliteModalContent}>
            <TouchableOpacity
              style={styles.eliteModalClose}
              onPress={() => setEliteModalVisible(false)}
            >
              <MaterialIcons
                name='close'
                size={scaleSize(28)}
                color='#1e293b'
              />
            </TouchableOpacity>
            <View style={styles.eliteLogoWrap}>
              <MaterialIcons
                name='workspace-premium'
                size={scaleSize(48)}
                color='#fff'
              />
              <Text style={styles.eliteLogoText}>ELITE BUYER</Text>
            </View>
            <Text style={styles.eliteModalTitle}>
              Want to unlock contact instantly?
            </Text>
            <Text style={styles.eliteModalSubtitle}>
              Become an Elite Buyer to call owners directly.
            </Text>
            <View style={styles.elitePackageRow}>
              <Text style={styles.elitePackageLabel}>10 Contacts</Text>
              <View style={styles.eliteSavingsBadge}>
                <Text style={styles.eliteSavingsText}>50% Savings</Text>
              </View>
            </View>
            <View style={styles.elitePriceRow}>
              <Text style={styles.elitePriceOld}>₹198</Text>
              <Text
                style={[styles.elitePriceNew, { color: branding.primaryColor }]}
              >
                ₹99
              </Text>
              <Text style={styles.elitePricePer}>₹10/Contact</Text>
            </View>
            <Text style={styles.elitePackageNote}>
              Package applicable for Mobiles category in Chennai for 7 days.
            </Text>
            <TouchableOpacity
              style={[
                styles.elitePayButton,
                { backgroundColor: branding.primaryColor }
              ]}
              onPress={() => {
                setEliteModalVisible(false)
                navigation.navigate('Subscription')
              }}
            >
              <Text style={styles.elitePayButtonText}>Go Elite Unlimited</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.eliteBuyCreditsButton,
                { borderColor: branding.primaryColor }
              ]}
              onPress={() => {
                setEliteModalVisible(false)
                navigation.navigate('BuyContacts')
              }}
            >
              <Text
                style={[
                  styles.eliteBuyCreditsButtonText,
                  { color: branding.primaryColor }
                ]}
              >
                Buy 7 Contacts - ₹49
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text
                style={[
                  styles.eliteExploreLink,
                  { color: branding.primaryColor }
                ]}
              >
                Explore business packages &gt;
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

export default Chat
