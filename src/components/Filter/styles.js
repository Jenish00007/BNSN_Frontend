import { StyleSheet } from 'react-native'
import { verticalScale, scale } from '../../utils/scaling'
import { useAppBranding } from '../../utils/translationHelper'

const styles = (props = null) => {
  const branding = useAppBranding()
  
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: props !== null ? branding.backgroundColor : '#fff',
      padding: scale(10),
      marginBottom: scale(10)
    },
    filterButton: {
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: scale(5),
      backgroundColor: props !== null ? branding.secondaryColor : '#f0f0f0',
      marginRight: scale(10)
    },
    selectedFilterButton: {
      backgroundColor: props !== null ? branding.primaryColor : '#F16122'
    },
    filterText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: props !== null ? branding.textColor : '#F16122',
      marginRight: scale(10)
    },
    filterButtonText: {
      fontSize: 14,
      marginRight: scale(10)
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: scale(2),
      rowGap: scale(10)
    },
    modalContainer: {
      flex: 1,
      backgroundColor: props !== null ? branding.backgroundColor : '#fff',
      paddingTop: scale(20),
      paddingHorizontal: scale(20)
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: scale(40),
      paddingHorizontal: scale(18),
      backgroundColor: props !== null ? branding.backgroundColor : '#fff',

    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: scale(10),
      marginTop: scale(10)
    },
    modalItem: {
      paddingVertical: scale(10),
      borderBottomWidth: 0.5,
      borderBottomColor: props !== null ? branding.secondaryColor : '#fff'
    },
    modalItemText: {
      fontSize: 16,
      
    },
    saveBtnContainer: {
      width: '100%',
      height: verticalScale(60),
      borderRadius: scale(30),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: props !== null ? branding.primaryColor : '#F16122',
      alignSelf: 'center',
      marginTop: scale(20),
      marginBottom: scale(40)
    },
    selectedModalItem: {
      backgroundColor: props !== null ? branding.secondaryColor : '#efefef'
    }
  })
}
export default styles
