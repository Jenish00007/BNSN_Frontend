import { StyleSheet, Dimensions } from 'react-native'
import { scale } from '../../../utils/scaling'
import { alignment } from '../../../utils/alignment'
import { textStyles } from '../../../utils/textStyles'

const { height } = Dimensions.get('window')

const styles = (props = null, branding = {}) => {
  return StyleSheet.create({
    flex: {
      flex: 1
    },
    mainContainer: {
      backgroundColor: props != null ? branding.backgroundColor : 'white',
      ...alignment.PLmedium,
      ...alignment.PRmedium,
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0
      // height: height * 0.3,
    },

    touchArea: {
      backgroundColor: props != null ? branding.backgroundColor : 'white',
      justifyContent: 'center',
      alignItems: 'center',
      width: scale(20)
    },
    favouriteOverlay: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: scale(38),
      height: scale(28),
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
      borderRadius: scale(16),
      backgroundColor: props != null ? branding.secondaryColor : 'white',
      borderWidth: 1,
      borderColor: props != null ? branding.textColor : '#F3F4F6'
    },
    fixedViewNavigation: {
      // height: scale(40),
      // backgroundColor: 'red',
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // ...alignment.PTsmall,
      height: height * 0.07,
      zIndex: 1
    },

    fixedIcons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12
    },
    restaurantDetails: {
      marginTop: scale(8)
    },

    restaurantImg: {
      width: scale(80),
      height: scale(80),
      borderRadius: 12
    },
    restaurantAbout: {
      fontSize: scale(14),
      fontWeight: '500'
    },
    fixedText: {
      padding: 10,
      borderRadius: 10,
      borderColor: 'white',
      borderWidth: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.74)',
      width: '50%',
      alignItems: 'center',
      alignSelf: 'center'
    },
    deliveryBox: {
      color: props != null ? branding.textColor : 'white',
      borderRadius: scale(5),
      ...alignment.PxSmall
    },
    ratingBox: {
      flexDirection: 'row',
      gap: scale(3),
      alignItems: 'center',
    },

    flatListStyle: {
      height: '100%',
      width: '100%',
      backgroundColor: props != null ? branding.backgroundColor : 'white',
      // borderBottomLeftRadius: 25,
      // borderBottomRightRadius: 25,
      zIndex: 10,
      elevation: 10
    },
    headerContainer: {
      height: '100%',
      width: '100%',
      display: 'flex',

      alignItems: 'center',
      justifyContent: 'center',
      ...alignment.PLlarge,
      ...alignment.PRlarge
    },
    activeHeader: {
      borderBottomWidth: scale(3),
      borderColor: branding.primaryColor
    },
    heading: {
      fontWeight: 'bold'
    },
    overlayContainer: {
      position: 'absolute',
      top: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
      ...alignment.PRsmall,
      ...alignment.PLsmall
    },
    headerTitle: {
      ...textStyles.H5,
      ...textStyles.Bolder,
      color: props != null ? branding.textColor : 'black',
      flex: 1,
      textAlign: 'center'
    },
    center: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
}
export default styles
