import React, { useContext, useState, useEffect, useLayoutEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";  
import { useNavigation } from '@react-navigation/native';
import UserContext from "../../context/User";
import AuthContext from "../../context/Auth";
import { API_URL } from '../../config/api';
import { useAppBranding } from '../../utils/translationHelper';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
  const navigation = useNavigation();
  const { formetedProfileData, refreshProfile, isLoggedIn } = useContext(UserContext);
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [userData, setUserDataLocal] = useState({});
  const { t } = useTranslation();
  const branding = useAppBranding();

  // Set up navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Edit Profile',
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
      },
      headerStyle: {
        backgroundColor: branding.headerColor,
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 16 }}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginRight: 16 }}>
          {/* Favorite Icon */}
          <TouchableOpacity
            onPress={() =>
              isLoggedIn 
                ? navigation.navigate('Favourite')
                : navigation.navigate('CreateAccount')
            }
            style={{ padding: 4 }}
          >
            <MaterialIcons name="favorite-border" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          {/* Notification Icon */}
          <TouchableOpacity
            onPress={() =>
              isLoggedIn 
                ? navigation.navigate('Notification')
                : navigation.navigate('CreateAccount')
            }
            style={{ padding: 4 }}
          >
            <MaterialIcons name="notifications-none" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, branding.headerColor, isLoggedIn]);

  // Initialize user data when profile data is available
  useEffect(() => {
    if (formetedProfileData) {
      setUserDataLocal({
        name: formetedProfileData.name || '',
        email: formetedProfileData.email || '',
        phone: formetedProfileData.phoneNumber || formetedProfileData.phone || '',
      });
    }
  }, [formetedProfileData]);

  // Show loading if profile data is not available yet
  if (!formetedProfileData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: branding.backgroundColor }]}>
        <ActivityIndicator size="large" color={branding.primaryColor} />
        <Text style={[styles.loadingText, { color: branding.textColor }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  const handleChange = (field, value) => {
    setUserDataLocal((prev) => ({ ...prev, [field]: value }));
  };

  const updateProfile = async () => {
    if (!token) {
      Alert.alert("Error", "Authentication token is missing. Please log in.");
      return;
    }

    // Validate required fields
    if (!userData.name || !userData.name.trim()) {
      Alert.alert("Error", "Name is required.");
      return;
    }

    if (!userData.email || !userData.email.trim()) {
      Alert.alert("Error", "Email is required.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    // Check if any changes were made
    const hasChanges = 
      userData.name.trim() !== (formetedProfileData.name || '') ||
      userData.email.trim().toLowerCase() !== (formetedProfileData.email || '') ||
      (userData.phone || '') !== (formetedProfileData.phoneNumber || formetedProfileData.phone || '');

    if (!hasChanges) {
      Alert.alert("Info", "No changes detected.");
      return;
    }
  
    setLoading(true);
    try {
      const requestBody = {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        phoneNumber: userData.phone || '',
      };
      
      console.log('Profile Update Request:', {
        url: `${API_URL}/user/update-user-info`,
        method: 'PUT',
        body: requestBody
      });
      
      const response = await fetch(`${API_URL}/user/update-user-info`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      
      const result = await response.json();
      console.log("API Response:", result);
  
      if (response.ok && result.success) {
        // Refresh the profile data from server
        await refreshProfile();
        
        Alert.alert(
          "Success", 
          "Profile updated successfully!"
        );
      } else {
        const errorMessage = result.message || `Profile update failed. Status: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.log("Update Error:", error);
      
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: branding.backgroundColor }]}
    >
      <StatusBar
        backgroundColor={branding.headerColor}
        barStyle="light-content"
        translucent={false}
        animated={true}
      />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <View style={[styles.profileCard, { backgroundColor: branding.secondaryColor }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: branding.textColor }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: branding.backgroundColor, 
                  color: branding.textColor,
                  borderColor: branding.primaryColor 
                }]}
                value={userData.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder="Enter your full name"
                placeholderTextColor={branding.textColor + '80'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: branding.textColor }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: branding.backgroundColor, 
                  color: branding.textColor,
                  borderColor: branding.primaryColor 
                }]}
                value={userData.email}
                onChangeText={(text) => handleChange("email", text)}
                placeholder="Enter your email address"
                placeholderTextColor={branding.textColor + '80'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: branding.textColor }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: branding.backgroundColor, 
                  color: branding.textColor,
                  borderColor: branding.primaryColor 
                }]}
                value={userData.phone}
                onChangeText={(text) => handleChange("phone", text)}
                placeholder="Enter your phone number"
                placeholderTextColor={branding.textColor + '80'}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: branding.primaryColor }]}>Security</Text>
              <View style={[styles.divider, { backgroundColor: branding.primaryColor + '40' }]} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: branding.textColor }]}>Password</Text>
              <View style={[styles.passwordField, { 
                backgroundColor: branding.backgroundColor, 
                borderColor: branding.primaryColor 
              }]}>
                <Text style={[styles.passwordDots, { color: branding.textColor }]}>••••••••</Text>
                <TouchableOpacity>
                  <Feather name="eye" size={20} color={branding.primaryColor} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={[
          styles.saveButton, 
          { 
            backgroundColor: loading ? branding.primaryColor + '60' : branding.buttonColor 
          }
        ]} 
        onPress={updateProfile} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={branding.backgroundColor} />
        ) : (
          <Text style={[styles.saveButtonText, { color: branding.backgroundColor }]}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  passwordDots: {
    fontSize: 16,
  },
  saveButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ProfilePage;