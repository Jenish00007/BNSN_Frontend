import React, { useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Platform
} from 'react-native'
import { useAppBranding } from '../../utils/translationHelper'

const ForceUpdateModal = ({
  visible,
  title,
  message,
  ctaLabel,
  onUpdatePress
}) => {
  const branding = useAppBranding()

  useEffect(() => {
    const onBackPress = () => {
      if (visible) {
        return true
      }
      return false
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    )

    return () => subscription.remove()
  }, [visible])

  return (
    <Modal
      animationType='fade'
      transparent={false}
      visible={visible}
      presentationStyle='fullScreen'
      onRequestClose={() => {
        // Prevent closing the modal on Android back button
      }}
    >
      <View
        style={[styles.container, { backgroundColor: branding.backgroundColor }]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: branding.cardBackground || '#ffffff',
              borderColor: branding.borderColor || 'rgba(15, 23, 42, 0.12)'
            }
          ]}
        >
          <Text
            style={[styles.title, { color: branding.textColor || '#0f172a' }]}
          >
            {title || 'Update Required'}
          </Text>
          <Text
            style={[styles.message, { color: branding.textColor || '#334155' }]}
          >
            {message ||
              'A newer version of the app is available. Please update to continue using the app.'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.primaryButton,
              {
                backgroundColor: branding.primaryColor || '#2563EB',
                shadowColor: branding.primaryColor || '#2563EB'
              }
            ]}
            onPress={onUpdatePress}
          >
            <Text style={styles.primaryButtonText}>{ctaLabel || 'Update Now'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40
  },
  card: {
    width: '100%',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  }
})

export default ForceUpdateModal
