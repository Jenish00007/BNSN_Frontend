import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center'
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666'
  },
  loginButton: {
    marginTop: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8
  },
  createButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  createButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    padding: 12
  },
  adCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  adImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative'
  },
  adImage: {
    width: '100%',
    height: '100%'
  },
  adImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  adContent: {
    padding: 16
  },
  adTitle: {
    marginBottom: 8
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  originalPrice: {
    marginLeft: 8,
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 14
  },
  adInfo: {
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
    flex: 1
  },
  adActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4
  },
  deleteButton: {
    backgroundColor: '#ff4444'
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 6
  },

  // Create Ad Button
  createAdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    color: '#002F34',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    fontWeight: '600'
  },

  // Product Card
  productCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E8E8E8'
  },
  productImage: {
    width: '100%',
    height: 180,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    marginBottom: 12
  },
  productImageWrapper: {
    position: 'relative'
  },
  productInfo: {
    marginBottom: 12
  },
  productName: {
    fontSize: 16,
    color: '#002F34',
    marginBottom: 4,
    lineHeight: 22
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4
  },
  productStock: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2
  },
  productMetaText: {
    fontSize: 12,
    color: '#94A3B8'
  },

  // Product Actions
  productActions: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginLeft: 8
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32
  },
  emptyStateTitle: {
    marginTop: 24,
    fontSize: 22,
    color: '#002F34',
    textAlign: 'center'
  },
  emptyStateSubtitle: {
    marginTop: 12,
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22
  },

  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFCE32',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#002F34'
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  inlineActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusChipDefault: {
    backgroundColor: '#E2E8F0'
  },
  statusChipText: {
    fontWeight: '700',
    color: '#0F172A'
  },
  statusMessageContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12
  },
  statusMessageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937'
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionButtonLarge: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4
  },
  actionButtonPrimary: {
    backgroundColor: '#1D4ED8'
  },
  actionButtonSecondary: {
    borderWidth: 1,
    borderColor: '#1D4ED8',
    backgroundColor: '#FFFFFF'
  },
  actionButtonDestructive: {
    borderWidth: 1,
    borderColor: '#B91C1C',
    backgroundColor: '#FFFFFF'
  },
  actionButtonTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  actionButtonTextSecondary: {
    color: '#1D4ED8',
    fontWeight: '700'
  },
  actionButtonTextDestructive: {
    color: '#B91C1C',
    fontWeight: '700'
  }
})

export default styles
