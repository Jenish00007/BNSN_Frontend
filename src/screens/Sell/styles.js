import { StyleSheet, Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },

  // Empty/Login State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF'
  },
  emptyText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 18,
    color: '#002F34'
  },
  loginButton: {
    marginTop: 24,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },

  // List Content
  listContent: {
    paddingBottom: 16,
    flexGrow: 1
  },

  // Header Section
  headerSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    marginBottom: 8
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  statNumber: {
    fontSize: 28,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '700'
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9
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
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 4,
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
    width: 100,
    height: 100,
    borderRadius: 4,
    backgroundColor: '#F5F5F5'
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
    paddingVertical: 4
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
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start'
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
  }
})

export default styles
