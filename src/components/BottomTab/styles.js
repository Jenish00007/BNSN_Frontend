import { Dimensions, StyleSheet } from 'react-native';
import { verticalScale, scale } from '../../utils/scaling';
import { fontStyles } from '../../utils/fontStyles';

const { height, width } = Dimensions.get('window');

const TAB_HEIGHT = height * 0.07;

const styles = StyleSheet.create({
  footerContainer: {
    width,
    height: TAB_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  /* Regular tab buttons */
  footerBtnContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(4),
  },

  activeText: {
    marginTop: verticalScale(2),
    fontSize: scale(10),
    fontFamily: fontStyles.PoppinsBold,
    fontWeight: 'bold',
  },
  inactiveText: {
    marginTop: verticalScale(2),
    fontSize: scale(10),
    fontFamily: fontStyles.PoppinsRegular,
  },

  /* Sell button — wrapper sits on the tab bar, button protrudes upward */
  sellButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    // Push the button up so it floats above the tab bar
    marginTop: -verticalScale(24),
    justifyContent: 'flex-start',
  },

  /* Outer ring (yellow/gold border visible in screenshot) */
  sellButtonOuter: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    borderWidth: scale(3),
    borderColor: '#F5C518',   // OLX yellow ring
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
  },

  /* Inner white circle that holds the + icon */
  sellButtonInner: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sellText: {
    marginTop: verticalScale(3),
    fontSize: scale(10),
    fontFamily: fontStyles.PoppinsRegular,
    color: '#666666',
  },
});

export default styles;