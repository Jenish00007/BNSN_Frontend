import { verticalScale, scale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'

import { alignment } from '../../utils/alignment'

const styles = (props = null, branding = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    screenBackground: {
      backgroundColor: branding?.backgroundColor || (props != null ? props.themeBackground : '#FFF'),
      ...alignment.PBlarge
    },
    searchbar: {
      ...alignment.PBmedium,
      backgroundColor: branding?.headerColor || (props != null ? props.main : '#FFF')
    },

    mainContentContainer: {
      width: '100%',
      height: '100%',
      alignSelf: 'center'
    },

    ML20: {
      ...alignment.MLlarge
    },
    PB10: {
      ...alignment.MBsmall
    },
    mL5p: {
      ...alignment.MLsmall
    },

    addressbtn: {
      backgroundColor: props != null ? props.color8 : '#f0f0f0',
      marginLeft: scale(10),
      marginRight: scale(10),
      marginBottom: scale(10),
      borderRadius: scale(10),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: scale(5),
      ...alignment.PLmedium,
      ...alignment.PRmedium,
      borderWidth: scale(1),
      borderColor: props != null ? props.color10 : '#FFF'
    },
    addNewAddressbtn: {
      padding: scale(5),
      ...alignment.PLmedium,
      ...alignment.PRmedium
    },
    addressContainer: {
      width: '100%',
      ...alignment.PTsmall,
      ...alignment.PBsmall
    },
    addButton: {
      backgroundColor: branding?.primaryColor || (props !== null ? props.newheaderColor : 'transparent'),
      width: '100%',
      height: scale(40),
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center'
    },
    addressSubContainer: {
      width: '90%',
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center'
    },
    content: {
      ...alignment.PTlarge
    },
    modal: {
      backgroundColor: branding?.backgroundColor || (props != null ? props.themeBackground : '#FFF'),
      paddingTop: scale(10),
      borderTopEndRadius: scale(20),
      borderTopStartRadius: scale(20),
      position: 'relative',
      zIndex: 999,
      shadowOpacity: 0,
      borderWidth: scale(1),
      borderColor: branding?.secondaryColor || (props != null ? props.color10 : '#FFF')
    },
    addressTextContainer: {
      display: 'flex',
      flexDirection: 'row'
    },
    addressTick: {
      width: '10%',
      justifyContent: 'center',
      alignItems: 'flex-start',
      marginRight: scale(5)
    },
    overlay: {
      backgroundColor:
        branding?.secondaryColor || (props != null ? props.backgroundColor2 : 'rgba(0, 0, 0, 0.5)')
    },
    handle: {
      width: scale(150),
      backgroundColor: branding?.backgroundColor || (props != null ? props.backgroundColor : 'transparent')
    },
    relative: {
      position: 'relative'
    },
    placeHolderContainer: {
      backgroundColor: branding?.secondaryColor || (props != null ? props.cartContainer : '#B8B8B8'),
      borderRadius: scale(3),
      elevation: scale(3),
      marginBottom: scale(12),
      padding: scale(12)
    },
    height200: {
      height: scale(200)
    },
    placeHolderFadeColor: {
      backgroundColor: branding?.secondaryColor || (props != null ? props.gray : '#B8B8B8')
    },
    emptyViewContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    emptyViewBox: {
      backgroundColor: branding?.secondaryColor || (props !== null ? props.color8 : '#000'),
      borderRadius: scale(10),
      width: '85%',
      height: verticalScale(130),
      justifyContent: 'center',
      alignItems: 'center',
      padding: scale(15),
      marginTop: scale(30)
    },
    mL5p: {
      ...alignment.MLsmall
    },
    homeIcon: {
      color: branding?.textColor || (props !== null ? props.darkBgFont : '#000'),
      width: '15%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    titleAddress: {
      width: '55%',
      justifyContent: 'center'
    },
    labelStyle: {
      textAlignVertical: 'bottom',
      fontSize: scale(14),
      fontWeight: '700',
      textAlign: 'left'
    },
    addressDetail: {
      alignSelf: 'flex-end',
      fontSize: scale(4),
      fontWeight: '300',
      textAlign: 'justify',
      paddingLeft: scale(38)
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
   
      marginVertical: 0,
      paddingHorizontal: 15,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 5,
      marginVertical: 2,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
      marginRight: 4,
    },
    loadingText: {
      fontSize: 16,
  
      textAlign: 'center', // Center the "Loading..." text
      marginVertical: 20,
    },
    productCard: {
      width: scale(200),
      marginRight: scale(10),
      backgroundColor: branding?.backgroundColor || (props != null ? props.white : '#FFF'),
      borderRadius: 8,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: branding?.textColor || (props != null ? props.black : '#000'),
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    productImage: {
      width: '100%',
      height: scale(120),
    },
    productInfo: {
      padding: scale(8),
    },
    productName: {
      fontSize: scale(14),
      fontWeight: 'bold',
      color: branding?.textColor || (props != null ? props.black : '#000'),
      marginBottom: scale(4),
    },
    productPrice: {
      fontSize: scale(16),
      color: branding?.primaryColor || (props != null ? props.iconColorPink : '#FF007F'),
      fontWeight: 'bold',
      marginBottom: scale(4),
    },
    stockInfo: {
      fontSize: scale(12),
      color: branding?.textColor || (props != null ? props.fontMainColor : '#000'),
      marginBottom: scale(8),
    },
    cartControls: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    addToCartButton: {
      padding: scale(8),
      borderRadius: 4,
      backgroundColor: branding?.primaryColor || (props != null ? props.iconColorPink : '#FF007F'),
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: branding?.primaryColor || (props != null ? props.iconColorPink : '#FF007F'),
      borderRadius: 4,
      padding: scale(4),
    },
    quantityButton: {
      padding: scale(4),
    },
    quantityText: {
      fontSize: scale(16),
      fontWeight: 'bold',
      color: branding?.textColor || (props != null ? props.black : '#000'),
      marginHorizontal: scale(8),
    },
  })
export default styles
