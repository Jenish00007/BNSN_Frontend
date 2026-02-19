import React, { useContext } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useSubscription } from '../../context/Subscription'
import { useAppBranding } from '../../utils/translationHelper'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'

const ContactViewsIndicator = () => {
  const { 
    contactViewsCount, 
    hasUnlimitedContacts, 
    FREE_CONTACT_LIMIT, 
    getRemainingFreeContacts,
    contactCredits
  } = useSubscription()
  
  const { primaryColor, textColor } = useAppBranding()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  // Don't show if user has unlimited contacts
  if (hasUnlimitedContacts) return null

  const remaining = getRemainingFreeContacts()
  const totalCredits = contactCredits || FREE_CONTACT_LIMIT
  const percentageUsed = (contactViewsCount / totalCredits) * 100

  // Don't show if no contacts have been used yet
  if (contactViewsCount === 0) return null

  return (
    <View style={[styles.container, { borderColor: currentTheme.border }]}>
      <View style={styles.content}>
        <View style={styles.iconTextContainer}>
          <MaterialIcons 
            name="phone" 
            size={16} 
            color={percentageUsed >= 80 ? '#ff6b6b' : primaryColor} 
          />
          <Text style={[
            styles.text,
            { 
              color: percentageUsed >= 80 ? '#ff6b6b' : textColor,
              fontWeight: percentageUsed >= 80 ? '600' : '500'
            }
          ]}>
            {remaining} of {totalCredits} contacts left
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[
            styles.progressBarBackground,
            { backgroundColor: currentTheme.border }
          ]}>
            <View style={[
              styles.progressBarFill,
              { 
                width: `${percentageUsed}%`,
                backgroundColor: percentageUsed >= 80 ? '#ff6b6b' : primaryColor
              }
            ]} />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    marginLeft: 6,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
  },
  progressBarBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
})

export default ContactViewsIndicator
