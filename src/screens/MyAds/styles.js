import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  loginButton: {
    marginTop: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  createButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 12,
  },
  adCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  adImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  adContent: {
    padding: 16,
  },
  adTitle: {
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  originalPrice: {
    marginLeft: 8,
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 14,
  },
  adInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
  adActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 6,
  },
});

export default styles;