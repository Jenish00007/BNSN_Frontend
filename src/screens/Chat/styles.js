import { StyleSheet, Platform } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9'
  },
  loadingText: {
    marginTop: 16,
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center'
  },
  connectionStatus: {
    backgroundColor: '#ef4444',
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  connectionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600'
  },
  chatDisabledBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  chatDisabledText: {
    color: '#B91C1C',
    flex: 1,
    fontSize: 13,
    fontWeight: '600'
  },
  messagesList: {
    padding: 16,
    flexGrow: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80
  },
  emptyText: {
    fontSize: 24,
    color: '#1e293b',
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center'
  },
  emptySubText: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22
  },
  messageContainer: {
    marginVertical: 2,
    width: '100%',
    paddingHorizontal: 8
  },
  myMessageContainer: {
    alignItems: 'flex-end'
  },
  otherMessageContainer: {
    alignItems: 'flex-start'
  },
  firstInGroup: {
    marginTop: 16
  },
  lastInGroup: {
    marginBottom: 16
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 8
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 4
  },
  roleBadgeWrapper: {
    flexDirection: 'row',
    marginBottom: 6
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  myMessage: {
    alignSelf: 'flex-end'
  },
  otherMessage: {
    alignSelf: 'flex-start'
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400'
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6
  },
  messageTime: {
    fontSize: 12,
    fontWeight: '500'
  },
  readIndicator: {
    marginLeft: 4
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 24
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  typingText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic'
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 70,
    position: 'relative',
    zIndex: 10
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 44
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 120,
    minHeight: 40,
    marginRight: 8,
    color: '#1e293b',
    fontWeight: '400',
    textAlignVertical: 'top',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 40,
    minHeight: 40
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0
  },
  productHeaderStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1
  },
  productHeaderImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f1f5f9'
  },
  productHeaderTextWrap: {
    flex: 1,
    marginLeft: 12
  },
  productHeaderCategory: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2
  },
  productHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2
  },
  productHeaderPrice: {
    fontSize: 16,
    fontWeight: '700'
  },
  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 10
  },
  ctaBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e'
  },
  ctaBannerButton: {
    fontSize: 14,
    fontWeight: '700'
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    paddingTop: 0
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600'
  },
  makeOfferContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16
  },
  makeOfferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12
  },
  makeOfferButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  suggestedPricesScroll: {
    marginBottom: 8,
    maxHeight: 44
  },
  priceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8
  },
  priceChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b'
  },
  currentOfferLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8
  },
  feedbackBannerText: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '600'
  },
  sendOfferButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  sendOfferButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  eliteModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center'
  },
  eliteModalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1
  },
  eliteLogoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  eliteLogoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
    letterSpacing: 0.5
  },
  eliteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8
  },
  eliteModalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16
  },
  elitePackageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  elitePackageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b'
  },
  eliteSavingsBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  eliteSavingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534'
  },
  elitePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4
  },
  elitePriceOld: {
    fontSize: 16,
    color: '#94a3b8',
    textDecorationLine: 'line-through'
  },
  elitePriceNew: {
    fontSize: 24,
    fontWeight: '800'
  },
  elitePricePer: {
    fontSize: 12,
    color: '#64748b'
  },
  elitePackageNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20
  },
  elitePayButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  elitePayButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  eliteExploreLink: {
    fontSize: 14,
    fontWeight: '600'
  }
})

export default styles
