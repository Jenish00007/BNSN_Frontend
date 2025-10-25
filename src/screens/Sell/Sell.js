import React, { useContext } from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import { useAppBranding } from '../../utils/translationHelper';
import AuthContext from '../../context/Auth';
import UserContext from '../../context/User';
import styles from './styles';

const Sell = () => {
  const navigation = useNavigation();
  const branding = useAppBranding();
  const { token } = useContext(AuthContext);
  const { isLoggedIn } = useContext(UserContext);

  if (!isLoggedIn || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={branding.headerColor} 
        />
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name="sell" 
            size={80} 
            color={branding.iconColor || '#ccc'} 
          />
          <TextDefault H4 bold style={styles.emptyText}>
            Please login to start selling
          </TextDefault>
          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: branding.primaryColor }
            ]}
            onPress={() => navigation.navigate('Login')}
          >
            <TextDefault bold style={{ color: '#fff' }}>
              Login
            </TextDefault>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCreateAd = () => {
    Alert.alert(
      'Coming Soon',
      'Create Ad form will be implemented here. You can add product name, description, price, images, etc.'
    );
  };

  return (
    <SafeAreaView 
      style={styles.container}
      edges={['bottom', 'left', 'right']}
    >
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={branding.headerColor} 
      />
      
      <View style={styles.content}>
        <MaterialIcons 
          name="add-photo-alternate" 
          size={100} 
          color={branding.primaryColor} 
        />
        <TextDefault H3 bold style={styles.title}>
          Create New Ad
        </TextDefault>
        <TextDefault style={styles.subtitle}>
          Sell your products easily
        </TextDefault>

        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: branding.primaryColor }
          ]}
          onPress={handleCreateAd}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <TextDefault bold style={{ color: '#fff', marginLeft: 8 }}>
            Start Creating
          </TextDefault>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Sell;