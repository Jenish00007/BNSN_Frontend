import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  loginButton: {
    marginTop: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  createButton: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default styles;