import { StyleSheet } from 'react-native';
import { scale } from '../../utils/scaling';
import { useContext } from 'react';
import ConfigurationContext from '../../context/Configuration';
import { useAppBranding } from '../../utils/translationHelper';

export default (props) => {
  const config = useContext(ConfigurationContext);
  const branding = useAppBranding();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: branding.backgroundColor,
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
      color: branding.textColor,
    },
    subtitle: {
      fontSize: scale(16),
      color: branding.textColor,
      textAlign: 'center',
      marginBottom: scale(20),
    },
    formContainer: {
      width: '100%',
    },
    inputContainer: {
      marginBottom: scale(20),
    },
    phoneInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: branding.borderColor,
      borderRadius: scale(12),
      backgroundColor: branding.secondaryColor,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    countryCode: {
      paddingHorizontal: scale(15),
      fontSize: scale(16),
      color: branding.textColor,
      borderRightWidth: 1,
      borderRightColor: branding.borderColor,
    },
    input: {
      flex: 1,
      padding: scale(15),
      fontSize: scale(16),
      color: branding.textColor,
    },
    otpInputWrapper: {
      alignItems: 'center',
    },
    otpInput: {
      width: '100%',
      borderWidth: 1,
      borderColor: branding.borderColor,
      borderRadius: scale(12),
      padding: scale(15),
      fontSize: scale(24),
      textAlign: 'center',
      letterSpacing: scale(8),
      backgroundColor: branding.secondaryColor,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    button: {
      backgroundColor: branding.buttonColor,
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
    buttonDisabled: {
      backgroundColor: `${branding.buttonColor}80`,
    },
    buttonText: {
      color: branding.textColor,
      fontSize: scale(16),
      fontWeight: 'bold',
    },
    resendButton: {
      marginTop: scale(15),
      alignItems: 'center',
    },
    resendText: {
      color: branding.buttonColor,
      fontSize: scale(14),
      fontWeight: '500',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: scale(30),
    },
    backText: {
      color: branding.textColor,
      fontSize: scale(14),
      marginLeft: scale(8),
    },
    headerRightIcon: {
      marginRight: scale(15),
    },
    headerLeftIcon: {
      marginLeft: scale(15),
    },
  });
}; 