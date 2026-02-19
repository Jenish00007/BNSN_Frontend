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
      paddingBottom: scale(30),
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
    packagesSection: {
      marginBottom: scale(30),
    },
    sectionTitle: {
      fontSize: scale(18),
      fontWeight: '600',
      marginBottom: scale(20),
    },
    packageCard: {
      backgroundColor: '#fff',
      borderRadius: scale(16),
      padding: scale(20),
      marginBottom: scale(15),
      borderWidth: scale(2),
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: scale(2),
      },
      shadowOpacity: 0.1,
      shadowRadius: scale(4),
      elevation: scale(3),
    },
    popularCard: {
      borderWidth: scale(3),
    },
    popularBadge: {
      position: 'absolute',
      top: -scale(10),
      right: scale(20),
      paddingHorizontal: scale(15),
      paddingVertical: scale(5),
      borderRadius: scale(12),
    },
    popularBadgeText: {
      color: '#fff',
      fontSize: scale(12),
      fontWeight: '600',
    },
    packageHeader: {
      alignItems: 'center',
      marginBottom: scale(15),
    },
    credits: {
      fontSize: scale(36),
      fontWeight: '700',
    },
    creditsLabel: {
      fontSize: scale(14),
      marginTop: scale(5),
    },
    priceContainer: {
      alignItems: 'center',
      marginBottom: scale(15),
    },
    price: {
      fontSize: scale(28),
      fontWeight: '700',
    },
    description: {
      fontSize: scale(14),
      textAlign: 'center',
      marginBottom: scale(20),
      lineHeight: scale(20),
    },
    purchaseButton: {
      borderRadius: scale(12),
      paddingVertical: scale(15),
      alignItems: 'center',
    },
    purchaseButtonText: {
      color: '#fff',
      fontSize: scale(16),
      fontWeight: '600',
    },
    infoSection: {
      marginBottom: scale(30),
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: scale(15),
    },
    infoText: {
      fontSize: scale(14),
      lineHeight: scale(20),
      marginLeft: scale(10),
      flex: 1,
    },
    termsText: {
      fontSize: scale(12),
      textAlign: 'center',
      lineHeight: scale(18),
    }
  })
}
