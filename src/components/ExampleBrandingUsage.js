import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useAppBranding } from '../utils/translationHelper'

const ExampleBrandingUsage = () => {
  const branding = useAppBranding()

  return (
    <View style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
      {/* App Logo */}
      <Image source={branding.logo} style={styles.logo} />
      
      {/* App Information */}
      <Text style={[styles.appName, { color: branding.textColor }]}>
        {branding.appName}
      </Text>
      <Text style={[styles.version, { color: branding.textColor }]}>
        Version: {branding.appVersion}
      </Text>
      <Text style={[styles.packageId, { color: branding.textColor }]}>
        Package: {branding.packageId}
      </Text>
      
      {/* Platform-specific info */}
      <Text style={[styles.platformInfo, { color: branding.textColor }]}>
        Android Version Code: {branding.platform.android.versionCode}
      </Text>
      <Text style={[styles.platformInfo, { color: branding.textColor }]}>
        iOS Bundle ID: {branding.platform.ios.bundleIdentifier}
      </Text>
      
      {/* Contact Information */}
      <View style={styles.contactSection}>
        <Text style={[styles.sectionTitle, { color: branding.primaryColor }]}>
          Contact Information
        </Text>
        <Text style={[styles.contactText, { color: branding.textColor }]}>
          Email: {branding.contactInfo.email || 'Not available'}
        </Text>
        <Text style={[styles.contactText, { color: branding.textColor }]}>
          Phone: {branding.contactInfo.phone || 'Not available'}
        </Text>
      </View>
      
      {/* Homepage Content */}
      <View style={styles.homepageSection}>
        <Text style={[styles.sectionTitle, { color: branding.primaryColor }]}>
          {branding.homepageContent.title}
        </Text>
        <Text style={[styles.description, { color: branding.textColor }]}>
          {branding.homepageContent.description}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  version: {
    fontSize: 16,
    marginBottom: 5,
  },
  packageId: {
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.7,
  },
  platformInfo: {
    fontSize: 12,
    marginBottom: 5,
    opacity: 0.6,
  },
  contactSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    marginBottom: 5,
  },
  homepageSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
})

export default ExampleBrandingUsage 