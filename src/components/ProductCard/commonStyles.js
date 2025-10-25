// styles/commonStyles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: 180,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: '#FFE8E8',
    borderRadius: 25,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  discountText: {
    color: '#FF4B4B',
    fontSize: 12,
    fontWeight: '600',
  },
  heartIcon: {
    width: 20,
    height: 20,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  unit: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});