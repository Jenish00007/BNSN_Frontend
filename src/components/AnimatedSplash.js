import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { useAppBranding } from '../utils/translationHelper';
// Removed animations to fix memory leaks;
import { Text } from 'react-native';
import { theme } from '../utils/themeColors';
import { StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const AnimatedSplash = ({ onAnimationComplete }) => {
  const branding = useAppBranding();

  useEffect(() => {
    // Complete after 2.5 seconds without animation
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: branding.primaryColor }]}>
      <StatusBar
        backgroundColor={branding.primaryColor}
        barStyle="dark-content"
        translucent
      />
      <View style={[styles.logoContainer]}>
        <Image 
          source={branding.splashLogo}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={[styles.messageContainer]}>
        <Text style={[styles.welcomeText, { color: branding.whiteColorText }]}>
          Welcome to {branding.appName}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: width * 0.5,
    height: width * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 5,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
});

export default AnimatedSplash; 