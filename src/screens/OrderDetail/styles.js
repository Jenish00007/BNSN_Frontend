import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'
import { scale, verticalScale } from '../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    container: {
      ...alignment.PLmedium,
      ...alignment.PRmedium,
      ...alignment.PTlarge,
      ...alignment.PBlarge
    },
    marginBottom20: {
      ...alignment.MBlarge
    },
    marginBottom10: {
      ...alignment.MBsmall
    },

    orderReceipt: theme => ({
      elevation: 1,
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: -verticalScale(2)
      },
      shadowOpacity: 0.5,
      shadowRadius: verticalScale(2),
      borderRadius: 20,
      backgroundColor: theme.white
    }),

    horizontalLine: {
      borderBottomColor: props !== null ? props.horizontalLine : 'pink',
      borderBottomWidth: StyleSheet.hairlineWidth
    },
    review: {
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    floatView: {
      flexDirection: 'row',
      padding: 7,
      width: '60%',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: 'black',
      margin: 15
    },
    bottomContainer: (theme) => ({
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      // height: scale(80),
      backgroundColor: theme.themeBackground,
      justifyContent: 'center',
      ...alignment.Pmedium,
      borderColor: theme.borderLight,
      borderTopWidth: StyleSheet.hairlineWidth
    }),
    cancelButtonContainer: theme => ({
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.red600,
      borderWidth: 1,
      borderRadius: scale(25)
    }),
    dismissButtonContainer: theme => ({
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.red600,
      borderWidth: 1,
      borderRadius: scale(25)
    }),
    orderInfoContainer: {
      padding: scale(15),
      backgroundColor: '#fff',
      borderRadius: scale(8),
      marginVertical: scale(10),
      marginHorizontal: scale(15),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    orderInfoTitle: {
      fontSize: scale(18),
      fontWeight: 'bold',
      marginBottom: scale(10),
      color: '#333',
    },
    orderInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: scale(8),
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    orderInfoLabel: {
      fontSize: scale(14),
      color: '#666',
    },
    orderInfoValue: {
      fontSize: scale(14),
      fontWeight: '500',
      color: '#333',
    },
    otpText: {
      color: '#e94560',
      fontWeight: 'bold',
      fontSize: scale(16),
    },
  })
export default styles
