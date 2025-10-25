import { StyleSheet } from 'react-native';
import { scale } from '../../utils/scaling';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
    padding: scale(20),
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: scale(30),
  },
  title: {
    fontSize: scale(24),
    fontWeight: 'bold',
    marginTop: scale(20),
    marginBottom: scale(10),
  },
  subtitle: {
    fontSize: scale(16),
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: scale(15),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scale(8),
    padding: scale(15),
    fontSize: scale(16),
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: scale(8),
    padding: scale(15),
    alignItems: 'center',
    marginTop: scale(10),
  },
  buttonText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
}); 