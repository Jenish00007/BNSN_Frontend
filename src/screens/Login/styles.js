import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'
import { scale } from '../../utils/scaling'
import { useContext } from 'react'
import ConfigurationContext from '../../context/Configuration'

const styles = (props = null) => {
  const config = useContext(ConfigurationContext)
  const primaryColor = config?.appColors?.primary || '#F16122'

  return StyleSheet.create({
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
    logo: {
      width: scale(120),
      height: scale(120),
      resizeMode: 'contain',
      marginBottom: scale(20),
    },
    title: {
      fontSize: scale(24),
      fontWeight: 'bold',
      marginBottom: scale(10),
      color: '#000',
    },
    subtitle: {
      fontSize: scale(16),
      color: '#666',
      textAlign: 'center',
      marginBottom: scale(20),
    },
    formContainer: {
      width: '100%',
    },
    inputContainer: {
      marginBottom: scale(20),
    },
    textField: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: scale(12),
      padding: scale(15),
      fontSize: scale(16),
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    loginBtn: {
      backgroundColor: primaryColor,
      borderRadius: scale(12),
      padding: scale(15),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    loginBtnText: {
      color: '#000',
      fontSize: scale(16),
      fontWeight: 'bold',
    },
    phoneLoginBtn: {
      backgroundColor: '#fff',
      borderRadius: scale(12),
      padding: scale(15),
      alignItems: 'center',
      marginTop: scale(15),
      borderWidth: 1,
      borderColor: primaryColor,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    phoneLoginBtnText: {
      color: primaryColor,
      fontSize: scale(16),
      fontWeight: 'bold',
    },
    forgotPasswordBtn: {
      alignItems: 'center',
      marginTop: scale(20),
    },
    forgotPasswordText: {
      color: primaryColor,
      fontSize: scale(14),
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: scale(30),
    },
    signupText: {
      color: '#666',
      fontSize: scale(14),
    },
    signupLink: {
      color: primaryColor,
      fontSize: scale(14),
      fontWeight: 'bold',
    },
    headerRightIcon: {
      marginRight: scale(15),
    },
    headerLeftIcon: {
      marginLeft: scale(15),
    },
    safeAreaViewStyles: {
      flex: 1,
      backgroundColor:
        props !== null ? props.themeBackground : 'transparent'
    },
    subContainer: {
      width: '90%',
      height: '100%',
      flex: 1,
      flexDirection: 'column'
    },
    alignItemsCenter: {
      alignItems: 'center'
    },
    marginTop10: {
      ...alignment.MTlarge
    },
    marginTop5: {
      ...alignment.MTmedium
    },
    marginTop3: {
      ...alignment.MTxSmall
    },
    appleBtn: {
      width: '100%'
    },
    errorInput: {
      backgroundColor: props !== null ? props.errorInputBack : '#F7E7E5',
      borderColor: props !== null ? props.errorInputBorder : '#DB4A39'
    },
    error: {
      ...alignment.MTxSmall,
      color: props !== null ? props.textErrorColor : '#DB4A39',
      fontSize: scale(14),
      marginTop: scale(5)
    },
    passwordField: {
      display: 'flex',
      flexDirection: 'row',
      ...alignment.MTlarge,
      alignItems: 'center'
    },
    passwordInput: {
      width: '100%'
    },
    eyeBtn: {
      marginLeft: scale(-40),
      elevation: scale(999)
    },
    btn: {
      marginBottom: scale(20),
      position: 'relative',
      width: '100%',
      alignItems: 'center',
      backgroundColor: props !== null ? props.main : '#000',
      alignSelf: 'center',
      padding: scale(15),
      borderRadius: scale(28),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    logoContainer: {
      width: 150,
      height: 150,
      display: 'flex',
      justifyContent: 'center'
    },
    googlelogo: {
      width: '50%',
      height: 50,
      objectFit: 'contain',
      alignItems: 'center',
      marginHorizontal: 40
    },
    termsContainer: {
      marginTop: scale(15),
      marginBottom: scale(20)
    },
  })
}

export default styles
