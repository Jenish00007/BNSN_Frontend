import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from './styles';
import UserContext from '../../context/User';
import { useAppBranding } from '../../utils/translationHelper';
import { scale } from '../../utils/scaling'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

function BottomTab({ screen }) {
  const navigation = useNavigation();
  const { isLoggedIn, orders } = useContext(UserContext);
  const branding = useAppBranding();

  const getIconColor = (currentScreen) => {
    return screen === currentScreen ? branding.primaryColor : '#666666';
  };

  const getTextStyle = (currentScreen) => {
    return screen === currentScreen ? [styles.activeText, { color: branding.primaryColor }] : [styles.inactiveText, { color: branding.textColor }];
  };

  return (
    <View style={[styles.footerContainer, { backgroundColor: branding.backgroundColor }]}>
      {/* Home Icon */}
      <TouchableOpacity
        onPress={() => {
          if (isLoggedIn) {
            navigation.navigate('Menu');
          } else {
            navigation.navigate('Login');
          }
        }}
        style={styles.footerBtnContainer}
      >
        <MaterialCommunityIcons
          name="home"
          size={scale(20)}
          color={getIconColor('HOME')}
        />
        <Text style={getTextStyle('HOME')}>HOME</Text>
      </TouchableOpacity>

      {/* Chats Icon */}
      <TouchableOpacity
        onPress={() => {
          if (isLoggedIn) {
            navigation.navigate('Chats');
          } else {
            navigation.navigate('Login');
          }
        }}
        style={styles.footerBtnContainer}
      >
        <MaterialCommunityIcons
          name="chat-outline"
          size={scale(20)}
          color={getIconColor('CHATS')}
        />
        <Text style={getTextStyle('CHATS')}>CHATS</Text>
      </TouchableOpacity>

      {/* Sell Button - Special Circular Design */}
      <TouchableOpacity
        onPress={() => {
          if (isLoggedIn) {
            navigation.navigate('Sell');
          } else {
            navigation.navigate('Login');
          }
        }}
        style={styles.sellButtonContainer}
      >
        <View style={styles.sellButton}>
          <MaterialCommunityIcons
            name="plus"
            size={scale(24)}
            color={branding.primaryColor}
          />
        </View>
        <Text style={[getTextStyle('SELL'), styles.sellText]}>SELL</Text>
      </TouchableOpacity>

      {/* My Ads Icon */}
      <TouchableOpacity
        onPress={() => {
          if (isLoggedIn) {
            navigation.navigate('MyAds');
          } else {
            navigation.navigate('Login');
          }
        }}
        style={styles.footerBtnContainer}
      >
        <MaterialCommunityIcons
          name="heart-outline"
          size={scale(20)}
          color={getIconColor('MYADS')}
        />
        <Text style={getTextStyle('MYADS')}>MY ADS</Text>
      </TouchableOpacity>

      {/* Account Icon */}
      <TouchableOpacity
        onPress={() => {
          if (isLoggedIn) {
            navigation.navigate('Profile');
          } else {
            navigation.navigate('Login');
          }
        }}
        style={styles.footerBtnContainer}
      >
        <MaterialCommunityIcons
          name="account-outline"
          size={scale(20)}
          color={getIconColor('ACCOUNT')}
        />
        <Text style={getTextStyle('ACCOUNT')}>ACCOUNT</Text>
      </TouchableOpacity>
    </View>
  );
}

export default BottomTab;
