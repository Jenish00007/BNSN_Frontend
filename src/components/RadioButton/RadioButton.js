import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'

export const RadioButton = ({ selected, onPress, color = '#000', disabled = false }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <View style={[
        styles.circle, 
        { borderColor: disabled ? '#ccc' : color },
        disabled && { opacity: 0.7 }
      ]}>
        {selected && (
          <View style={[
            styles.checkedCircle, 
            { backgroundColor: disabled ? '#ccc' : color }
          ]} />
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  circle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
}) 