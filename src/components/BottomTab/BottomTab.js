import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UserContext from '../../context/User';
import { useAppBranding } from '../../utils/translationHelper';
import { verticalScale, scale } from '../../utils/scaling';
import { fontStyles } from '../../utils/fontStyles';

const { height, width } = Dimensions.get('window');

function BottomTab({ screen }) {
  const navigation = useNavigation();
  const { isLoggedIn } = useContext(UserContext);
  const branding = useAppBranding();
  const insets = useSafeAreaInsets();

  const getIconColor = (currentScreen) =>
    screen === currentScreen ? branding.primaryColor : '#888888';

  const getTextStyle = (currentScreen) =>
    screen === currentScreen
      ? [styles.activeText, { color: branding.primaryColor }]
      : [styles.inactiveText, { color: '#888888' }];

  const navigate = (route) => {
    navigation.navigate(isLoggedIn ? route : 'Login');
  };

  return (
    <View style={[
      styles.footerContainer, 
      { 
        backgroundColor: branding.backgroundColor || '#FFFFFF',
        height: verticalScale(60) + insets.bottom,
        paddingBottom: insets.bottom
      }
    ]}>

      {/* Home */}
      <TouchableOpacity onPress={() => navigate('Menu')} style={styles.tabItem}>
        <MaterialCommunityIcons
          name={screen === 'HOME' ? 'home' : 'home-outline'}
          size={scale(22)}
          color={getIconColor('HOME')}
        />
        <Text style={getTextStyle('HOME')}>Home</Text>
      </TouchableOpacity>

      {/* Chats */}
      <TouchableOpacity onPress={() => navigate('Chats')} style={styles.tabItem}>
        <MaterialCommunityIcons
          name="chat-outline"
          size={scale(22)}
          color={getIconColor('CHATS')}
        />
        <Text style={getTextStyle('CHATS')}>Chats</Text>
      </TouchableOpacity>

      {/* Sell — floating circle with primary color ring */}
      <TouchableOpacity onPress={() => navigate('Sell')} style={styles.sellTabItem}>
        <View style={[styles.sellRing, { backgroundColor: branding.primaryColor || '#002F5F' }]}>
          <View style={styles.sellInnerCircle}>
            <MaterialCommunityIcons
              name="plus"
              size={scale(26)}
              color={branding.primaryColor || '#002F5F'}
            />
          </View>
        </View>
        <Text style={[styles.inactiveText, { color: '#888888' }]}>Sell</Text>
      </TouchableOpacity>

      {/* My Ads */}
      <TouchableOpacity onPress={() => navigate('MyAds')} style={styles.tabItem}>
        <MaterialCommunityIcons
          name="file-document-outline"
          size={scale(22)}
          color={getIconColor('MYADS')}
        />
        <Text style={getTextStyle('MYADS')}>My Ads</Text>
      </TouchableOpacity>

      {/* Account */}
      <TouchableOpacity onPress={() => navigate('Profile')} style={styles.tabItem}>
        <MaterialCommunityIcons
          name="account-outline"
          size={scale(22)}
          color={getIconColor('ACCOUNT')}
        />
        <Text style={getTextStyle('ACCOUNT')}>Account</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    width,
    flexDirection: 'row',
    alignItems: 'flex-start',       // Items align to top of bar
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Standard tab items
  tabItem: {
    width: '20%',
    height: verticalScale(60),       // Fixed height for top part of tab bar
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sell tab: text at bottom, ring floats above
  sellTabItem: {
    width: '20%',
    height: verticalScale(60),
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: verticalScale(8),
  },

  // Outer ring — floats above the bar
  sellRing: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: '#F5C518',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -scale(28),                 // Float half above bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },

  // Inner white circle
  sellInnerCircle: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default BottomTab;