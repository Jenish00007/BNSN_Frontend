import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PaymentMethod = ({ selectedMethod, onSelectMethod, theme }) => {
  const paymentOptions = [
    { id: 'cash_on_delivery', title: 'Cash on Delivery', icon: 'attach-money' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.itemCardColor }]}>
      <Text style={[styles.title, { color: theme.fontMainColor }]}>Select Payment Method</Text>
      
      {paymentOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.paymentOption,
            { borderColor: theme.borderColor },
            selectedMethod === option.id && { borderColor: theme.primary, backgroundColor: theme.color8 }
          ]}
          onPress={() => onSelectMethod(option.id)}
        >
          <Icon name={option.id === 'cash_on_delivery' ? 'attach-money' : 'payments'} size={24} color={theme.primary} />
          <Text style={[styles.paymentOptionText, { color: theme.fontMainColor }]}>
            {option.title}
          </Text>
          {selectedMethod === option.id && (
            <Icon name="check-circle" size={24} color={theme.primary} style={styles.checkIcon} />
          )}
        </TouchableOpacity>
      ))}
      
      <View style={[styles.securityNote, { backgroundColor: theme.color8 }]}>
        <Icon name="security" size={18} color={theme.success || '#388e3c'} />
        <Text style={[styles.securityText, { color: theme.fontSecondColor }]}>
          Your payment information is securely processed
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
  },
  paymentOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 12,
  }
});

export default PaymentMethod;