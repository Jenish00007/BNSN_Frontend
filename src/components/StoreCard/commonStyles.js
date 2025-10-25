// styles/commonStyles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  distance: {
    fontSize: 12,
    color: '#666666',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    color: '#1A1A1A',
    marginTop: 4,
  },
  heartContainer: {
    padding: 8,
  },
  heartIcon: {
    width: 20,
    height: 20,
  },
});
