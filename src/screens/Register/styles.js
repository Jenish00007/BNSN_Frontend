import { StyleSheet, Platform } from 'react-native'
import { scale } from '../../utils/scaling'
import { alignment } from '../../utils/alignment'

export default function styles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF'
    },
    keyboardView: {
      flex: 1
    },
    scrollView: {
      flexGrow: 1
    },
    mainContainer: {
      flex: 1,
      paddingHorizontal: scale(20),
      paddingTop: scale(20),
      paddingBottom: scale(40)
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: scale(30)
    },
    logo: {
      width: scale(120),
      height: scale(120),
      resizeMode: 'contain',
      marginBottom: scale(20)
    },
    title: {
      fontSize: scale(24),
      fontWeight: 'bold',
      marginBottom: scale(8),
      textAlign: 'center'
    },
    subtitle: {
      fontSize: scale(16),
      textAlign: 'center',
      opacity: 0.7
    },
    formContainer: {
      flex: 1
    },
    inputContainer: {
      marginBottom: scale(16)
    },
    input: {
      height: scale(50),
      borderWidth: 1,
      borderRadius: scale(12),
      paddingHorizontal: scale(16),
      fontSize: scale(16),
      backgroundColor: '#FFFFFF',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2
          },
          shadowOpacity: 0.1,
          shadowRadius: 4
        },
        android: {
          elevation: 2
        }
      })
    },
    passwordInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: scale(12),
      backgroundColor: '#FFFFFF',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2
          },
          shadowOpacity: 0.1,
          shadowRadius: 4
        },
        android: {
          elevation: 2
        }
      })
    },
    passwordInput: {
      flex: 1,
      height: scale(50),
      paddingHorizontal: scale(16),
      fontSize: scale(16)
    },
    eyeButton: {
      padding: scale(10)
    },
    errorText: {
      fontSize: scale(12),
      marginTop: scale(4),
      marginLeft: scale(4)
    },
    button: {
      height: scale(50),
      borderRadius: scale(12),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: scale(8),
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2
          },
          shadowOpacity: 0.1,
          shadowRadius: 4
        },
        android: {
          elevation: 2
        }
      })
    },
    buttonText: {
      fontSize: scale(16),
      fontWeight: '600'
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: scale(24)
    },
    divider: {
      flex: 1,
      height: 1,
      opacity: 0.5
    },
    dividerText: {
      marginHorizontal: scale(16),
      fontSize: scale(14),
      fontWeight: '500'
    },
    phoneButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: scale(50),
      borderWidth: 1,
      borderRadius: scale(12),
      backgroundColor: '#FFFFFF',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2
          },
          shadowOpacity: 0.1,
          shadowRadius: 4
        },
        android: {
          elevation: 2
        }
      })
    },
    phoneIconContainer: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(22),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: scale(12)
    },
    phoneButtonText: {
      fontSize: scale(16),
      fontWeight: '500'
    }
  })
}
