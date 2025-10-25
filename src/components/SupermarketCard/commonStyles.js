// styles/commonStyles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    color: '#4CAF50',
    fontSize: 16,
  },
  highlightCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  highlightTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  discountButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  discountText: {
    color: 'white',
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: 'white',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 20,
    marginTop: 16,
  },
  description: {
    color: '#666',
    fontSize: 16,
  },
  storeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  distance: {
    color: '#666',
    marginTop: 8,
  },
  price: {
    color: '#444',
    marginTop: 4,
  },
  status: {
    color: '#FF0000',
    marginTop: 4,
  },
  offerCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  address: {
    color: '#666',
    marginTop: 4,
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  discountBadgeText: {
    color: 'white',
    fontSize: 14,
  },
  categoryCard: {
    borderRadius: 8,
    padding: 16,
    marginRight: 16,
    marginBottom: 16,
    width: 160,
  },
  categoryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionButtonText: {
    textAlign: 'center',
    fontSize: 14,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginRight: 16,
    marginBottom: 16,
    width: 192,
    elevation: 2,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  unit: {
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  originalPrice: {
    color: '#666',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
