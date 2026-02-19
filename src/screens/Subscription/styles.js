import { StyleSheet, Dimensions } from 'react-native'
import { scale } from '../../utils/scaling'

const { width } = Dimensions.get('window')

export default () => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: scale(10),
      fontSize: scale(16),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(20),
      paddingTop: scale(10),
      paddingBottom: scale(20),
    },
    backButton: {
      padding: scale(5),
    },
    headerTitle: {
      fontSize: scale(20),
      fontWeight: '600',
      marginLeft: scale(15),
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: scale(20),
      paddingBottom: scale(40),
    },
    heroSection: {
      alignItems: 'center',
      paddingTop: scale(20),
      paddingBottom: scale(40),
    },
    iconContainer: {
      width: scale(120),
      height: scale(120),
      borderRadius: scale(60),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(20),
    },
    heroTitle: {
      fontSize: scale(24),
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: scale(10),
    },
    heroSubtitle: {
      fontSize: scale(16),
      textAlign: 'center',
      lineHeight: scale(24),
      paddingHorizontal: scale(20),
    },
    pricingCard: {
      backgroundColor: '#fff',
      borderRadius: scale(16),
      padding: scale(25),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: scale(2),
      },
      shadowOpacity: 0.1,
      shadowRadius: scale(4),
      elevation: scale(3),
      marginBottom: scale(30),
    },
    priceHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: scale(5),
    },
    price: {
      fontSize: scale(36),
      fontWeight: '700',
    },
    pricePeriod: {
      fontSize: scale(16),
      marginLeft: scale(5),
    },
    priceDescription: {
      fontSize: scale(14),
      textAlign: 'center',
    },
    featuresSection: {
      marginBottom: scale(30),
    },
    sectionTitle: {
      fontSize: scale(18),
      fontWeight: '600',
      marginBottom: scale(20),
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: scale(20),
    },
    featureIcon: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(15),
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: scale(16),
      fontWeight: '600',
      marginBottom: scale(5),
    },
    featureDescription: {
      fontSize: scale(14),
      lineHeight: scale(20),
    },
    guaranteeSection: {
      alignItems: 'center',
      marginBottom: scale(30),
    },
    guaranteeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(15),
      paddingVertical: scale(10),
      borderRadius: scale(20),
      borderWidth: scale(1),
    },
    guaranteeText: {
      fontSize: scale(14),
      fontWeight: '600',
      marginLeft: scale(8),
    },
    purchaseButton: {
      borderRadius: scale(12),
      paddingVertical: scale(18),
      alignItems: 'center',
      marginBottom: scale(20),
    },
    purchaseButtonText: {
      color: '#fff',
      fontSize: scale(18),
      fontWeight: '600',
    },
    termsText: {
      fontSize: scale(12),
      textAlign: 'center',
      lineHeight: scale(18),
    }
  })
}
