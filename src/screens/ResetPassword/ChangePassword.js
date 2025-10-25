import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import navigationService from '../../routes/navigationService';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { theme } from '../../utils/themeColors';
import { useAppBranding } from '../../utils/translationHelper';
import axios from 'axios';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext?.ThemeValue] || theme.light;
  const appBranding = useAppBranding();

  
  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await axios.put(
        `${API_URL}/user/update-user-password`,
        {
          oldPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', response.data.message);
        navigationService.goBack();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update password');
      }
    } catch (error) {
      console.log('Password update error:', error.response || error.message || error);
      let errorMsg = 'Failed to update password';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: appBranding.backgroundColor },
      ]}
    >
      <View style={styles.centeredView}>
        <View style={[styles.card, { backgroundColor: appBranding.backgroundColor }]}> 
          <Text
            style={[
              styles.title,
              { color: appBranding.buttonColor },
            ]}
          >
            Change Password
          </Text>

          <TextInput
            mode="outlined"
            label="Old Password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOldPassword}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showOldPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowOldPassword(!showOldPassword)}
              />
            }
            theme={{
              colors: {
                primary: appBranding.primaryColor,
                background: appBranding.backgroundColor,
              },
            }}
          />

          <TextInput
            mode="outlined"
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showNewPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowNewPassword(!showNewPassword)}
              />
            }
            theme={{
              colors: {
                primary: appBranding.primaryColor,
                background: appBranding.backgroundColor,
              },
            }}
          />

          <TextInput
            mode="outlined"
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            theme={{
              colors: {
                primary: appBranding.primaryColor,
                background: appBranding.backgroundColor,
              },
            }}
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: appBranding.buttonColor },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Updating...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 1,
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default ChangePassword; 