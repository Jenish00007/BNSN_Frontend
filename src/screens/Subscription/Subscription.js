import React, { useContext, useRef, useEffect } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Dimensions,
  Platform,
  Animated
} from 'react-native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useSubscription } from '../../context/Subscription'
import { useAppBranding } from '../../utils/translationHelper'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'

const { width } = Dimensions.get('window')

const GOLD = '#C9A84C'
const GOLD_LIGHT = '#E8CC7A'
const DARK_BG = '#0F0F0F'
const CARD_BG = '#1A1A1A'
const CARD_BORDER = '#2A2A2A'
const TEXT_PRIMARY = '#F5F0E8'
const TEXT_SECONDARY = '#8A8070'
const GREEN = '#23C55E'

const features = [
  {
    icon: 'phone-in-talk',
    title: 'Direct Call Access',
    description: 'Call sellers instantly from chat with one tap',
    tag: 'Popular',
    tagVariant: 'gold'
  },
  {
    icon: 'all-inclusive',
    title: '7 Contact Credits',
    description: 'Get 7 seller contact numbers with your subscription',
    tag: null
  }
]

const FeatureRow = ({ feature, index }) => {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(16)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay: 300 + index * 90,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay: 300 + index * 90,
        useNativeDriver: true
      })
    ]).start()
  }, [])

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={s.featureCard}>
        <View style={s.featureIconWrap}>
          <MaterialIcons name={feature.icon} size={22} color={GOLD} />
        </View>

        <View style={s.featureText}>
          <View style={s.featureTitleRow}>
            <Text style={s.featureTitle}>{feature.title}</Text>
            {feature.tag && (
              <View
                style={[s.tag, feature.tagVariant === 'green' && s.tagGreen]}
              >
                <Text
                  style={[
                    s.tagText,
                    feature.tagVariant === 'green' && s.tagTextGreen
                  ]}
                >
                  {feature.tag}
                </Text>
              </View>
            )}
          </View>
          <Text style={s.featureDesc}>{feature.description}</Text>
        </View>

        <View style={s.checkCircle}>
          <MaterialIcons name='check' size={13} color={DARK_BG} />
        </View>
      </View>
    </Animated.View>
  )
}

const Subscription = () => {
  const navigation = useNavigation()
  const {
    activateUnlimitedContacts,
    subscriptionLoading,
    hasUnlimitedContacts
  } = useSubscription()
  const { primaryColor } = useAppBranding()
  const themeContext = useContext(ThemeContext)

  const headerAnim = useRef(new Animated.Value(0)).current
  const heroAnim = useRef(new Animated.Value(0)).current
  const ctaScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true
      })
    ]).start()
  }, [])

  const handlePurchase = () => {
    navigation.navigate('SubscriptionPayment', {
      amount: 49,
      title: 'Gold Membership',
      credits: 7,
      duration: 30
    })
  }

  const onCtaPressIn = () =>
    Animated.spring(ctaScale, { toValue: 0.97, useNativeDriver: true }).start()
  const onCtaPressOut = () =>
    Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true }).start()

  if (subscriptionLoading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loadingWrap}>
          <ActivityIndicator size='large' color={GOLD} />
          <Text style={s.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle='light-content' backgroundColor={DARK_BG} />

      {/* Header */}
      <Animated.View
        style={[
          s.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0]
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name='chevron-back' size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Gold Membership</Text>
        <View style={{ width: 36 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Hero */}
        <Animated.View
          style={[
            s.hero,
            {
              opacity: heroAnim,
              transform: [
                {
                  translateY: heroAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0]
                  })
                }
              ]
            }
          ]}
        >
          <View style={s.crownRing}>
            <MaterialIcons name='workspace-premium' size={36} color={GOLD} />
          </View>

          <Text style={s.heroTitle}>Gold Membership</Text>
          <Text style={s.heroSub}>
            Unlock direct seller calls, 7 contact credits &amp; close deals
            faster.
          </Text>

          <View style={s.priceChip}>
            <Text style={s.priceAmount}>₹49</Text>
            <Text style={s.pricePer}> / 7 days</Text>
          </View>
        </Animated.View>

        {/* Value pills — only 1 pill now */}
        <View style={s.valueRow}>
          <View style={s.valuePill}>
            <Text style={s.valuePillText}>7 Contact Credits</Text>
          </View>
        </View>

        {/* Features */}
        <Text style={s.sectionLabel}>What's included</Text>

        <View style={s.featuresContainer}>
          {features.map((f, i) => (
            <FeatureRow key={i} feature={f} index={i} />
          ))}
        </View>

        {/* Trust strip */}
        <View style={s.trustStrip}>
          {[
            { icon: 'lock', label: 'Secure Payment' },
            { icon: 'flash-on', label: 'Instant Activation' },
            { icon: 'support-agent', label: '24/7 Support' }
          ].map((item, i) => (
            <View key={i} style={s.trustItem}>
              <MaterialIcons name={item.icon} size={18} color={GOLD} />
              <Text style={s.trustLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <Animated.View
          style={[s.ctaWrapper, { transform: [{ scale: ctaScale }] }]}
        >
          <TouchableOpacity
            style={[s.ctaButton, hasUnlimitedContacts && s.ctaButtonActive]}
            onPress={handlePurchase}
            onPressIn={onCtaPressIn}
            onPressOut={onCtaPressOut}
            disabled={hasUnlimitedContacts}
            activeOpacity={1}
          >
            <Text style={s.ctaText}>
              {hasUnlimitedContacts
                ? '✓  You are a Gold Member'
                : 'Unlock Gold Membership  –  ₹49'}
            </Text>
            {!hasUnlimitedContacts && (
              <MaterialIcons
                name='arrow-forward'
                size={18}
                color={DARK_BG}
                style={{ marginLeft: 8 }}
              />
            )}
          </TouchableOpacity>
        </Animated.View>

        <Text style={s.termsText}>
          By subscribing, you agree to our{' '}
          <Text style={s.termsLink}>Terms of Service</Text> and{' '}
          <Text style={s.termsLink}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: 14
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: 0.4
  },
  scroll: { paddingBottom: 48 },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 28
  },
  crownRing: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: GOLD + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 10
  },
  heroSub: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.1,
    marginBottom: 24
  },
  priceChip: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: GOLD + '50',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 100,
    shadowColor: GOLD,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4
  },
  priceAmount: {
    color: GOLD,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.5
  },
  pricePer: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 3
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: CARD_BORDER
  },
  valuePill: {
    backgroundColor: GOLD + '15',
    borderWidth: 1,
    borderColor: GOLD + '40',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  valuePillText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 12
  },
  featuresContainer: {
    paddingHorizontal: 16,
    gap: 8
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER
  },
  featureIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: GOLD + '15',
    borderWidth: 1,
    borderColor: GOLD + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  featureText: { flex: 1 },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: 0.1
  },
  featureDesc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 18
  },
  tag: {
    backgroundColor: GOLD + '18',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: GOLD + '45'
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    color: GOLD,
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  tagGreen: {
    backgroundColor: GREEN + '18',
    borderColor: GREEN + '45'
  },
  tagTextGreen: {
    color: GREEN
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },
  trustStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 18,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER
  },
  trustItem: {
    alignItems: 'center',
    gap: 6
  },
  trustLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    fontWeight: '500',
    letterSpacing: 0.2
  },
  ctaWrapper: {
    marginHorizontal: 16,
    marginTop: 24
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 17,
    shadowColor: GOLD,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  ctaButtonActive: {
    backgroundColor: GREEN,
    shadowColor: GREEN
  },
  ctaText: {
    color: DARK_BG,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  termsText: {
    fontSize: 11,
    color: TEXT_SECONDARY + 'AA',
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 16,
    lineHeight: 17,
    letterSpacing: 0.1
  },
  termsLink: {
    color: GOLD,
    fontWeight: '600'
  }
})

export default Subscription
