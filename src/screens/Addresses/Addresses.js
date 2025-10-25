import React, { useContext, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import {
  View,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform
} from 'react-native'
import {
  AntDesign,
  EvilIcons,
  SimpleLineIcons,
  MaterialIcons
} from '@expo/vector-icons'
import { LocationContext } from '../../context/Location'
//import gql from 'graphql-tag'

import { scale } from '../../utils/scaling'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import styles from './styles'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import EmptyAddress from '../../assets/SVG/imageComponents/EmptyAddress'
import analytics from '../../utils/analytics'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import navigationService from '../../routes/navigationService'
import { HeaderBackButton } from '@react-navigation/elements'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import { useTranslation } from 'react-i18next'
import AuthContext from '../../context/Auth'

function Addresses() {
  const Analytics = analytics()
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { t } = useTranslation()
  const { location } = useContext(LocationContext)

  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const { token } = useContext(AuthContext)

  // Network-only fetch function
  const fetchAddress = useCallback(async () => {
    try {
      setLoading(true)
            
      const headers = {
        'moduleId': '1',
        'zoneId': '[1]',
        'latitude': location?.latitude?.toString() || '23.79354466376145',
        'longitude': location?.longitude?.toString() || '90.41166342794895',
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
       
      }
      
      const response = await fetch('https://6ammart-admin.6amtech.com/api/v1/customer/address/list', {
        method: 'GET',
        headers: headers
      })

      if (!response.ok) {
        throw new Error('Failed to fetch addresses')
      }

      const result = await response.json()
      console.log('API Response:', result)
      
      setAddresses(result.addresses || [])
      setError(null)
    } catch (err) {
      console.log('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [location, token])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAddress()
  }

  useEffect(() => {
    fetchAddress()
  }, [fetchAddress])

  function onCompleted() {
    FlashMessage({ message: t('addressDeletedMessage') })
    fetchAddress()
  }

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(currentTheme.menuBar)
      }
      StatusBar.setBarStyle(
        themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content'
      )
    }, [currentTheme, themeContext])
  )

  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_ADDRESS)
    }
    Track()
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('myAddresses'),
      headerRight: null,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
        fontWeight: 'bold'
      },
      headerTitleContainerStyle: {
        marginTop: '2%',
        paddingLeft: scale(25),
        paddingRight: scale(25),
        height: '75%',
        marginLeft: 0
      },
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG,
        elevation: 0
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View>
              <MaterialIcons name='arrow-back' size={30} color={currentTheme.newIconColor} />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [navigation, currentTheme, t])

  const addressIcons = {
    'home': CustomHomeIcon,
    'office': CustomWorkIcon,
    'apartment': CustomApartmentIcon,
    'other': CustomOtherIcon
  }

  function emptyView() {
    return (
      <View style={styles().subContainerImage}>
        <EmptyAddress width={scale(300)} height={scale(300)} />
        <View>
          <View style={styles().descriptionEmpty}>
            <View style={styles().viewTitle}>
              <TextDefault textColor={currentTheme.fontMainColor} bolder>
                {t('emptyHere')}
              </TextDefault>
            </View>
            <View>
              <TextDefault textColor={currentTheme.fontMainColor} bold>
                {t('addressNotSaved')}
                {'\n'}
                {t('addNewAddress')}
              </TextDefault>
            </View>
          </View>
        </View>
      </View>
    )
  }


  const onDeleteAddress = async (addressId) => {
    console.log("Delete address with ID:", addressId);
  
    try {
      const response = await fetch(`https://6ammart-admin.6amtech.com/api/v1/customer/address/delete?address_id=${addressId}`, {
        method: 'DELETE', // Use DELETE method to delete the address
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'zoneId': '[3,1]', // Pass zoneId in the headers
          latitude: '23.793544663762145', // Pass the latitude in the headers
          longitude: '90.41166342794895', // Pass the longitude in the headers
          'X-localization': 'en', 
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Handle success, show a success message, or update UI
        onCompleted()
        console.log('Address deleted successfully:', data);
      } else {
        // Handle failure, show an error message
        console.error('Error deleting address:', data);
        FlashMessage({ message: t('addressDeleteFailedMessage') });
      }
    } catch (error) {
      console.error('Error with the delete API call:', error);
      FlashMessage({ message: t('addressDeleteFailedMessage') });
    }
  };

  // Add this function to handle address updates
  const updateAddress = async (addressData) => {
    try {
      const response = await fetch(`${API_URL}/user/update-user-addresses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(addressData)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  };

  return (
    <View style={styles(currentTheme).flex}>
      <FlatList
        //onRefresh={refetchProfile}
        //refreshing={networkStatus === NetworkStatus.refetch}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        data={addresses}
        ListEmptyComponent={emptyView}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => (
          <View style={styles(currentTheme).line} />
        )}
        ListHeaderComponent={() => <View style={{ ...alignment.MTmedium }} />}
        renderItem={({ item: address }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles(currentTheme).containerSpace]}
          >
            <View style={[styles().width100, styles().rowContainer]}>
              <View style={[styles(currentTheme).homeIcon]}>
                {addressIcons[address.address_type]
                  ? React.createElement(addressIcons[address.address_type], {
                      fill: currentTheme.darkBgFont
                    })
                  : React.createElement(addressIcons['other'], {
                      fill: currentTheme.darkBgFont
                    })}
              </View>
              <View style={[styles().titleAddress]}>
                <TextDefault
                  textColor={currentTheme.darkBgFont}
                  style={styles(currentTheme).labelStyle}
                >
                  {/* {t(address.label)} */}
                  {address.address_type || "Address"}
                </TextDefault>
              </View>
              <View style={styles().buttonsAddress}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    // const [longitude, latitude] = address.location.coordinates
                    navigation.navigate('AddNewAddress', {
                      id: address.id,
                      // longitude: +longitude,
                      // latitude: +latitude,
                      longitude: +address.longitude,
                      latitude: +address.latitude,
                      prevScreen: 'Addresses'
                    })
                  }}
                >
                  <SimpleLineIcons
                    name='pencil'
                    size={scale(20)}
                    color={currentTheme.darkBgFont}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  //disabled={loadingMutation}
                  onPress={() => {
                   
                    onDeleteAddress(address.id);
                    FlashMessage({ message: t('addressDeletedMessage') })
                  }}
                >
                  <EvilIcons
                    name='trash'
                    size={scale(33)}
                    color={currentTheme.darkBgFont}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ ...alignment.MTxSmall }}></View>
            </View>
            <View style={styles().midContainer}>
              <View style={styles(currentTheme).addressDetail}>
                <TextDefault
                  numberOfLines={2}
                  textColor={currentTheme.darkBgFont}
                  style={{ ...alignment.PBxSmall }}
                >
                  {/* {address.deliveryAddress} */}
                  {address.address}
                </TextDefault>
                <TextDefault
                  numberOfLines={1}
                  textColor={currentTheme.fontSecondColor}
                  style={{ ...alignment.PBxSmall }}
                >
                  {address.contact_person_name} • {address.contact_person_number}
                </TextDefault>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* </ScrollView> */}
      <View>
        <View style={styles(currentTheme).containerButton}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles(currentTheme).addButton}
            onPress={() => navigation.navigate('SelectLocation', {
              prevScreen: 'Addresses'
            })}
          >
            <TextDefault H5 bold>
              {t('addAddress')}
            </TextDefault>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Addresses