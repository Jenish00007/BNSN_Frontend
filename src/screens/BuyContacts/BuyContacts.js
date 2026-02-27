import React, { useState, useContext, useRef, useEffect } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
  StyleSheet
} from 'react-native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useSubscription } from '../../context/Subscription'
import { useAppBranding } from '../../utils/translationHelper'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'

const { width } = Dimensions.get('window')

const contactPackages = [
  {
    credits: 7,
    price: 49,
    pricePerCredit: '₹7',
    tag: 'Starter',
    description: 'Try it out',
    popular: false,
    icon: 'bolt'
  },
  {
    credits: 15,
    price: 99,
    pricePerCredit: '₹6.6',
    tag: 'Popular',
    description: 'Best value',
    popular: true,
    icon: 'star'
  },
  {
    credits: 30,
    price: 199,
    pricePerCredit: '₹6.6',
    tag: 'Pro',
    description: 'Power users',
    popular: false,
    icon: 'rocket-launch'
  }
]

const GOLD = '#C9A84C'
const GOLD_LIGHT = '#E8CC7A'
const DARK_BG = '#0F0F0F'
const CARD_BG = '#1A1A1A'
const CARD_BORDER = '#2A2A2A'
const TEXT_PRIMARY = '#F5F0E8'
const TEXT_SECONDARY = '#8A8070'

/* ── Animated Package Card ── */
const PackageCard = ({ pkg, index, onPurchase, processingPayment }) => {
  const scaleAnim = useRef(new Animated.Value(0.92)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const pressAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 420,
        delay: index * 120,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 420,
        delay: index * 120,
        useNativeDriver: true
      })
    ]).start()
  }, [])

  const handlePressIn = () => {
    Animated.spring(pressAnim, { toValue: 0.97, useNativeDriver: true }).start()
  }
  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start()
  }

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: opacityAnim,
          transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }]
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPurchase(pkg.credits, pkg.price)}
        disabled={processingPayment}
        style={[
          styles.card,
          pkg.popular && styles.cardPopular
        ]}
      >
        {/* Top row */}
        <View style={styles.cardTopRow}>
          <View style={[styles.tagPill, pkg.popular && styles.tagPillPopular]}>
            <MaterialIcons
              name={pkg.icon}
              size={12}
              color={pkg.popular ? DARK_BG : GOLD}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.tagText, pkg.popular && styles.tagTextPopular]}>
              {pkg.tag}
            </Text>
          </View>
          {pkg.popular && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Best pick</Text>
            </View>
          )}
        </View>

        {/* Credits display */}
        <View style={styles.creditsRow}>
          <Text style={[styles.creditsNumber, pkg.popular && styles.creditsNumberPopular]}>
            {pkg.credits}
          </Text>
          <View style={styles.creditsLabelGroup}>
            <Text style={styles.creditsWord}>contact</Text>
            <Text style={styles.creditsWord}>credits</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, pkg.popular && styles.dividerPopular]} />

        {/* Price row */}
        <View style={styles.priceRow}>
          <Text style={[styles.priceText, pkg.popular && styles.priceTextPopular]}>
            ₹{pkg.price}
          </Text>
          <Text style={styles.perCredit}>
            {pkg.pricePerCredit} / credit
          </Text>
        </View>

        {/* CTA */}
        <View style={[styles.ctaButton, pkg.popular && styles.ctaButtonPopular]}>
          {processingPayment ? (
            <ActivityIndicator size="small" color={pkg.popular ? DARK_BG : GOLD} />
          ) : (
            <>
              <Text style={[styles.ctaText, pkg.popular && styles.ctaTextPopular]}>
                Purchase
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={16}
                color={pkg.popular ? DARK_BG : GOLD}
              />
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

/* ── Main Screen ── */
const BuyContacts = () => {
  const navigation = useNavigation()
  const { addContactCredits, subscriptionLoading } = useSubscription()
  const { primaryColor } = useAppBranding()
  const themeContext = useContext(ThemeContext)
  const [processingPayment, setProcessingPayment] = useState(false)

  const headerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start()
  }, [])

  const handlePurchase = async (credits, price) => {
    setProcessingPayment(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const success = await addContactCredits(credits)
      if (success) {
        Alert.alert(
          '✓ Payment Successful',
          `${credits} contact credits added to your account.`,
          [{ text: 'Continue', onPress: () => navigation.goBack() }]
        )
      } else {
        Alert.alert('Payment Failed', 'Please try again or contact support.')
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  if (subscriptionLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Loading packages…</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }]
          }
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Credits</Text>
        <View style={{ width: 36 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }
          ]}
        >
          <View style={styles.heroIconRing}>
            <MaterialIcons name="contacts" size={32} color={GOLD} />
          </View>
          <Text style={styles.heroTitle}>Unlock Seller Contacts</Text>
          <Text style={styles.heroSubtitle}>
            One credit reveals one seller's full contact details — view it again, anytime, for free.
          </Text>
        </Animated.View>

        {/* Cards */}
        <View style={styles.cardsContainer}>
          {contactPackages.map((pkg, i) => (
            <PackageCard
              key={i}
              pkg={pkg}
              index={i}
              onPurchase={handlePurchase}
              processingPayment={processingPayment}
            />
          ))}
        </View>

        {/* Trust strip */}
        <View style={styles.trustStrip}>
          {[
            { icon: 'shield', label: 'Secure Payment' },
            { icon: 'flash-on', label: 'Instant Credits' },
            { icon: 'loop', label: 'Never Expire' }
          ].map((item, i) => (
            <View key={i} style={styles.trustItem}>
              <MaterialIcons name={item.icon} size={18} color={GOLD} />
              <Text style={styles.trustLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Fine print */}
        <Text style={styles.finePrint}>
          By purchasing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontFamily: 'System',
    fontSize: 14
  },

  /* Header */
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

  /* Hero */
  scrollContent: {
    paddingBottom: 48
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 28
  },
  heroIconRing: {
    width: 72,
    height: 72,
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
    fontSize: 26,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 10
  },
  heroSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.1
  },

  /* Cards */
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 12
  },
  cardWrapper: {
    borderRadius: 20
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER
  },
  cardPopular: {
    backgroundColor: GOLD,
    borderColor: GOLD_LIGHT
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GOLD + '50',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: GOLD + '10'
  },
  tagPillPopular: {
    backgroundColor: DARK_BG + '25',
    borderColor: DARK_BG + '30'
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  tagTextPopular: {
    color: DARK_BG
  },
  savingsBadge: {
    backgroundColor: DARK_BG + '20',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  savingsText: {
    fontSize: 11,
    color: DARK_BG,
    fontWeight: '600',
    letterSpacing: 0.3
  },

  /* Credits */
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 16
  },
  creditsNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: GOLD,
    lineHeight: 60,
    letterSpacing: -2
  },
  creditsNumberPopular: {
    color: DARK_BG
  },
  creditsLabelGroup: {
    paddingBottom: 6
  },
  creditsWord: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: 0.2
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: CARD_BORDER,
    marginBottom: 16
  },
  dividerPopular: {
    backgroundColor: DARK_BG + '25'
  },

  /* Price */
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16
  },
  priceText: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5
  },
  priceTextPopular: {
    color: DARK_BG
  },
  perCredit: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500'
  },

  /* CTA */
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: GOLD + '60',
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: GOLD + '12'
  },
  ctaButtonPopular: {
    backgroundColor: DARK_BG + '20',
    borderColor: DARK_BG + '30'
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 0.3
  },
  ctaTextPopular: {
    color: DARK_BG
  },

  /* Trust strip */
  trustStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 28,
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

  /* Fine print */
  finePrint: {
    fontSize: 11,
    color: TEXT_SECONDARY + 'AA',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 32,
    lineHeight: 17,
    letterSpacing: 0.1
  }
})

export default BuyContacts