import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import LottieView from 'lottie-react-native';
import { theme } from '../../utils/themeColors'; // Import the theme object
import { useAppBranding } from '../../utils/translationHelper';

const OrderConfirmationScreen = ({ navigation }) => {
  // Get the current color scheme (system preference)
  const colorScheme = useColorScheme();
  const branding = useAppBranding();
  
  // Use the Dark theme if system preference is dark, otherwise use Pink theme
  const currentTheme = colorScheme === 'dark' ? theme.Dark : theme.Pink;

  // Animation values removed to prevent callback leaks
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const scaleAnim = useRef(new Animated.Value(0)).current;
  // const slideAnim = useRef(new Animated.Value(100)).current;
  // const checkmarkAnimation = useRef(null);
  // const animationRef = useRef(null);

  // Animation effect removed to prevent callback leaks

  const handleGoHome = () => {
    navigation.navigate('Menu');
  };

  return (
    <View style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
      {/* Floating Confetti Animation */}
      <LottieView
        source={require('../../assets/animations/confetti.json')}
        autoPlay
        loop={false}
        style={styles.confettiAnimation}
        speed={0.7}
      />
      
      {/* Main Content */}
      <View style={styles.confirmationContainer}>
        {/* Success Icon/Animation */}
        <View
          style={[
            styles.checkIconContainer,
            { 
              backgroundColor: branding.secondaryColor,
            }
          ]}
        >
          {/* Lottie Animation */}
          <LottieView
            source={require('../../assets/animations/checkmark.json')}
            style={styles.checkmarkLottie}
            loop={false}
          />
        </View>
        
        {/* Text content with slide-up animation */}
        <View
          style={{
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Text style={[styles.title, { color: branding.textColor }]}>
            Order Placed Successfully!
          </Text>
          
          <Text style={[styles.message, { color: branding.textColor }]}>
            Your order has been placed successfully. We have started our delivery 
            process, and you will receive your item soon.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: branding.buttonColor }]}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: branding.textColor }]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 2,
  },
  checkIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    backgroundColor: '#4CAF50',
  },
  checkmarkLottie: {
    width: 185,
    height: 185,
  },
  confettiAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrderConfirmationScreen;