import { fontStyles } from '../../../utils/fontStyles'
import { scale, verticalScale } from '../../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../../utils/alignment'
import { theme } from '../../../utils/themeColors'

const styles = (props = null, newheaderColor = theme.headerMenuBackground) =>
  StyleSheet.create({
    bodyStyleOne: {
      fontFamily: fontStyles.MuseoSans500,
      fontSize: scale(15),
      color: props != null ? props.fontMainColor : 'black',
      paddingVertical: 0,
      flex: 1
    },
    mainContainerHolder: {
      zIndex: 333,
      width: '100%',
      alignItems: 'center',     
      backgroundColor: newheaderColor,
      paddingVertical: scale(12),
      shadowColor: props != null ? props.shadowColor : 'black',
      shadowOffset: {
        width: 0,
        height: verticalScale(2)
      },
      shadowOpacity: 0.1,
      shadowRadius: verticalScale(3),
      elevation: 3
    },
    mainContainer: {
      width: '93%',
      height: scale(40),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: scale(8),
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      shadowColor: props != null ? props.shadowColor : 'black',
      shadowOffset: {
        width: 0,
        height: verticalScale(1)
      },
      shadowOpacity: 0.1,
      shadowRadius: verticalScale(2),
      elevation: 2
    },
    subContainer: {
      width: '95%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingHorizontal: scale(12)
    },
    leftContainer: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'center'
    },
    searchContainer: {
      marginRight: scale(10),
      alignItems: 'center',
      justifyContent: 'center'
    },
    inputContainer: {
      flex: 1,
      justifyContent: 'center'
    },
    filterContainer: {
      width: scale(30),
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    }
  })

export default styles