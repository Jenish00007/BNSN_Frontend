import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  rating: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  description: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
  },
  subDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
});
