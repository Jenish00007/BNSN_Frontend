import { StyleSheet } from 'react-native';

const OrderSummaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
  },
  
  // Progress Bar Styles
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  progressStep: {
    alignItems: 'center',
    width: 100,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeStep: {
    backgroundColor: '#2874f0',
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepText: {
    fontSize: 12,
    color: '#888',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  activeLine: {
    backgroundColor: '#2874f0',
  },
  
  // Content Styles
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  
  // Address Card Styles
  addressCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  selectedAddressCard: {
    borderColor: '#2874f0',
    backgroundColor: '#f5faff',
  },
  addressTypeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 4,
  },
  addressType: {
    fontSize: 12,
    color: '#666',
  },
  addressName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  addressDetails: {
    color: '#666',
    marginBottom: 4,
  },
  addressPhone: {
    color: '#666',
  },
  selectedCheckmark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  
  // Add Address Button Styles
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#2874f0',
    borderRadius: 4,
  },
  addAddressText: {
    color: '#2874f0',
    marginLeft: 8,
    fontWeight: '500',
  },
  
  // Address Form Styles
  addressForm: {
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  halfInput: {
    width: '48%',
  },
  addressTypeSelector: {
    marginBottom: 16,
  },
  addressTypeLabel: {
    marginBottom: 8,
  },
  addressTypeOptions: {
    flexDirection: 'row',
  },
  addressTypeOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  activeAddressType: {
    borderColor: '#2874f0',
    backgroundColor: '#e6f0ff',
  },
  addressTypeOptionText: {
    color: '#333',
  },
  activeAddressTypeText: {
    color: '#2874f0',
    fontWeight: 'bold',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: 10,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#2874f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Payment Option Styles
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedPayment: {
    borderWidth: 2,
    borderColor: '#2874f0',
    backgroundColor: '#f5faff',
    shadowColor: '#2874f0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paymentOptionText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 'auto',
    color: '#2874f0',
  },
  
  // Order Summary Styles
  orderSummary: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 80,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  freeDelivery: {
    color: '#388e3c',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Action Bar Styles
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 60,
  },
  amountContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 16,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  minimumOrderBottomText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  proceedButton: {
    backgroundColor: '#fb641b',
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
  },
  proceedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Minimum Order Warning Styles
  minimumOrderWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  minimumOrderText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },

  // Delivery Status Styles
  deliveryStatusContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  deliveryStatusContent: {
    flex: 1,
    marginLeft: 8,
  },
  deliveryStatusText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  currentLocationText: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  
  // Current Location Section Styles
  currentLocationSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  }
});

export default OrderSummaryStyles;