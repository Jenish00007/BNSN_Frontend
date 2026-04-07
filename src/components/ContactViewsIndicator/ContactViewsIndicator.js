import React from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useSubscription } from '../../context/Subscription'
import { useNavigation } from '@react-navigation/native'

const { width } = Dimensions.get('window')

const ContactViewsIndicator = () => {
  const navigation = useNavigation()
  const {
    getRemainingFreeContacts,
    FREE_CONTACT_LIMIT,
    hasUnlimitedContacts,
    addContactCredits
  } = useSubscription()

  if (hasUnlimitedContacts) {
    return (
      <View style={ciStyles.wrapper}>
        <MaterialIcons name='phone' size={16} color='#4CAF50' />
        <Text style={[ciStyles.label, { color: '#4CAF50' }]}>
          Unlimited contacts (Premium)
        </Text>
      </View>
    )
  }

  const remaining = getRemainingFreeContacts()
  const limit = FREE_CONTACT_LIMIT          // always 7
  const used = limit - remaining
  const progress = Math.min(used / limit, 1) // 0 – 1, never > 1
  const isLow = remaining <= 1
  const barColor = isLow ? '#FF5252' : '#5B5EA6'

  // If no credits left, show payment options
  if (remaining === 0) {
    return (
      <View style={ciStyles.container}>
        <View style={ciStyles.row}>
          <MaterialIcons name='phone-locked' size={16} color='#FF5252' />
          <Text style={[ciStyles.label, { color: '#FF5252' }]}>
            No contacts left
          </Text>
        </View>
        
        <Text style={ciStyles.message}>
          You've used all your free contacts. Get more to continue connecting with sellers.
        </Text>
        
        <View style={ciStyles.buttonContainer}>
          <TouchableOpacity
            style={[ciStyles.button, ciStyles.primaryButton]}
            onPress={() => navigation.navigate('BuyContacts')}
          >
            <MaterialIcons name='add-circle' size={16} color='white' />
            <Text style={ciStyles.buttonText}>Buy 7 Contacts - ₹49</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[ciStyles.button, ciStyles.secondaryButton]}
            onPress={() => navigation.navigate('Subscription')}
          >
            <MaterialIcons name='star' size={16} color='#5B5EA6' />
            <Text style={[ciStyles.buttonText, { color: '#5B5EA6' }]}>
              Gold Membership
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={ciStyles.container}>
      {/* Header row */}
      <View style={ciStyles.row}>
        <MaterialIcons name='phone' size={16} color={barColor} />
        <Text style={[ciStyles.label, { color: barColor }]}>
          {remaining} of {remaining >limit ? remaining : limit} contacts left
        </Text>
      </View>

      {/* Progress track — overflow:hidden keeps the fill inside */}
      <View style={ciStyles.track}>
        <View
          style={[
            ciStyles.fill,
            {
              width: `${progress * 100}%`,
              backgroundColor: barColor
            }
          ]}
        />
      </View>
    </View>
  )
}

const isSmall = width < 360

const ciStyles = {
  container: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: width * 0.03,
    paddingVertical: width * 0.025,
    marginBottom: 10,
    overflow: 'hidden'
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  label: {
    fontSize: isSmall ? 11 : 13,
    fontWeight: '600'
  },
  message: {
    fontSize: isSmall ? 10 : 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: isSmall ? 14 : 16
  },
  buttonContainer: {
    gap: 8,
    flexDirection: width >= 400 ? 'row' : 'column'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: isSmall ? 8 : 10,
    paddingHorizontal: isSmall ? 8 : 12,
    borderRadius: 8,
    flex: width >= 400 ? 1 : undefined
  },
  primaryButton: {
    backgroundColor: '#5B5EA6'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5B5EA6'
  },
  buttonText: {
    fontSize: isSmall ? 11 : 13,
    fontWeight: '600',
    color: 'white'
  },
  track: {
    height: 5,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden'
  },
  fill: {
    height: 5,
    borderRadius: 4
  }
}

export default ContactViewsIndicator
