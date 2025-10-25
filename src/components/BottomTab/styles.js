import { Dimensions, StyleSheet } from 'react-native';
import { verticalScale, scale } from '../../utils/scaling';
import { fontStyles } from '../../utils/fontStyles';
const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  footerContainer: {
    width,
    height: height * 0.08,
    flexDirection: 'row',
  },
  footerBtnContainer: {
    width: '20%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  imgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
    marginTop: verticalScale(4),
    fontSize: 10,
    fontFamily: fontStyles.PoppinsBold,
    fontWeight: 'bold',
  },
  inactiveText: {
    marginTop: verticalScale(4),
    fontSize: 10,
    fontFamily: fontStyles.PoppinsRegular,
    fontWeight: 'bold',
  },
  profileContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileBadge: {
    width: verticalScale(8),
    height: verticalScale(8),
    position: 'absolute',
    right: '25%',
    top: 0,
    borderRadius: verticalScale(4),
  },
  badgeContainer: {
    position: 'absolute',
    top: -scale(5),
    right: -scale(10),
    borderRadius: scale(10),
    height: scale(16),
    width: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: scale(10),
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25, 
   
  },
  sellButtonContainer: {
    width: '20%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sellButton: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  sellText: {
    marginTop: verticalScale(4),
    fontSize: 10,
    fontFamily: fontStyles.PoppinsRegular,
    fontWeight: 'bold',
  },
});

export default styles;
