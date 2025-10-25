import React, { useContext, useLayoutEffect, useState } from 'react'
import {
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Alert
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styles from './styles'
import { scale } from '../../utils/scaling'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { LocationContext } from '../../context/Location'
import { MaterialIcons } from '@expo/vector-icons'
import { HeaderBackButton } from '@react-navigation/elements'
import navigationService from '../../routes/navigationService'
import { useTranslation } from 'react-i18next'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import AuthContext from '../../context/Auth'
import {
  StackActions,
  useFocusEffect,
  useNavigation
} from '@react-navigation/native'
import { createAddress, editAddress } from '../../apollo/mutations'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/client'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import Spinner from '../../components/Spinner/Spinner'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'

const CREATE_ADDRESS = gql`
  ${createAddress}
`
const EDIT_ADDRESS = gql`
  ${editAddress}
`

function SaveAddress(props) {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const { locationData } = props.route.params
  const { setLocation } = useContext(LocationContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const [selectedLabel, setSelectedLabel] = useState('')
  const inset = useSafeAreaInsets()
  const {  token, logout } = useContext(AuthContext)

  const [mutate, { loading }] = useMutation(locationData?.id ? EDIT_ADDRESS : CREATE_ADDRESS, {
    onCompleted,
    onError
  })
  function onCompleted({createAddress, editAddress}) {
    FlashMessage({
      message: t('addressUpdated')
    })
    
    const address = (createAddress||editAddress)?.addresses.find(a => a.selected) || 
    setLocation({
      _id: address._id,
      label: selectedLabel,
      deliveryAddress: locationData.deliveryAddress,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      city: locationData.city
    })
    if(locationData.prevScreen){
      navigation.navigate(locationData.prevScreen)
    } else{
      navigation.dispatch(StackActions.popToTop())
    }
  }

  function onError(error) {
    FlashMessage({
      message: `${t('errorOccured')} ${error.message}`
    })
  }

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentTheme.menuBar)
    }
    StatusBar.setBarStyle(
      themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content'
    )
  })

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: null,
      title: t('saveAddress'),
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
      headerTitleAlign: 'center',
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
  })

  const onSelectLocation = async () => {
    if (!selectedLabel) {
      Alert.alert('Alert', t('alertLocation'));
      return;
    }
  
    const addressInput = {
      longitude: `${locationData.longitude}`,
      latitude: `${locationData.latitude}`,
      address: locationData.deliveryAddress,
      details: locationData.deliveryAddress,
      label: selectedLabel,
      id: locationData.id || null,
      address_type: 'home', 
      contact_person_number: '+917418291374', 
      additional_address: null,
      contact_person_name: 'Jenish1', 
      road: 'street name',
      house: 'house', 
      floor: 'floor', 
      zone_id: 1,
      zone_ids: null, 
      area_ids: null 
    };
  
    try {
      if (!token) {
        Alert.alert('Error', 'Please login to continue');
        return;
      }

      const response = await fetch('https://6ammart-admin.6amtech.com/api/v1/customer/address/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'zoneId': '[3,1]',
          'latitude': '23.793544663762145',
          'longitude': '90.41166342794895',
          'X-localization': 'en'
        },
        body: JSON.stringify(addressInput)
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Alert.alert('Success', 'Address added successfully');
        navigation.navigate('Addresses');
      } else {
        if (data.errors && data.errors[0].code === 'auth-001') {
          Alert.alert('Session Expired', 'Please login again');
          // You might want to handle logout here
          await logout();
          navigation.navigate('Login');
        } else {
          console.error('Error adding address:', data);
          Alert.alert('Error', data.message || 'Failed to add the address.');
        }
      }
    } catch (error) {
      console.error('Error with the API call:', error);
      Alert.alert('Error', 'An error occurred while adding the address.');
    }
  };

  
  const handleLabelSelection = (label) => {
    setSelectedLabel(label)
  }

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
        style={styles(currentTheme).flex}
      >
        <View style={styles(currentTheme).flex}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles(currentTheme).subContainer}>
              <View style={styles().upperContainer}>
                <View style={styles(currentTheme).addressContainer}>
                  <View style={styles(currentTheme).addressTag}>
                    <TextDefault
                      H4
                      bolder
                      textColor={currentTheme.newFontcolor}
                    >
                      {t('address')}
                    </TextDefault>
                  </View>
                  <View style={styles().address}>
                    <View style={styles().addressTag}>
                      <TextDefault
                        H5
                        bold
                        textColor={currentTheme.newFontcolor}
                      >
                        {locationData.city}
                      </TextDefault>
                    </View>
                    <View style={styles().addressDetails}>
                      <TextDefault bold textColor={currentTheme.gray600}>
                        {locationData.deliveryAddress}
                      </TextDefault>
                    </View>
                  </View>
                  <View style={styles().address}>
                    <View style={styles().addressTag}>
                      <TextDefault
                        H5
                        bold
                        textColor={currentTheme.newFontcolor}
                      >
                        {t('locationType')}
                      </TextDefault>
                    </View>
                    <View style={styles().addressDetails}>
                      <TextDefault bold textColor={currentTheme.gray600}>
                        {t('locationTypeDetails')}
                      </TextDefault>
                    </View>
                  </View>
                  <View style={styles(currentTheme).locationContainer}>
                    <View style={styles(currentTheme).locationRow}>
                      <View style={styles().locationIcon}>
                        <TouchableOpacity
                          style={styles().locationIconStyles}
                          onPress={() => handleLabelSelection('apartment')}
                        >
                          <CustomApartmentIcon
                            iconColor={
                              selectedLabel === 'apartment'
                                ? currentTheme.newheaderColor
                                : currentTheme.darkBgFont
                            }
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles().locationTypes}>
                        <TouchableOpacity
                          style={styles().locationStyles}
                          onPress={() => handleLabelSelection('apartment')}
                        >
                          <TextDefault
                            H5
                            bolder
                            textColor={
                              selectedLabel === 'apartment'
                                ? currentTheme.newheaderColor
                                : currentTheme.darkBgFont
                            }
                          >
                            {t('Apartment')}
                          </TextDefault>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles(currentTheme).locationRow}>
                      <View style={styles().locationIcon}>
                        <TouchableOpacity
                          style={styles().locationIconStyles}
                          onPress={() => handleLabelSelection('home')}
                        >
                          <CustomHomeIcon
                            iconColor={
                              selectedLabel === 'home'
                                ? currentTheme.newheaderColor
                                : currentTheme.darkBgFont
                            }
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles().locationTypes}>
                        <TouchableOpacity
                          style={styles().locationStyles}
                          onPress={() => handleLabelSelection('home')}
                        >
                          <TextDefault
                            H5
                            bolder
                            textColor={
                              selectedLabel === 'home'
                                ? currentTheme.newheaderColor
                                : currentTheme.darkBgFont
                            }
                          >
                            {t('House')}
                          </TextDefault>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles(currentTheme).locationRow}>
                      <View style={styles().locationIcon}>
                        <TouchableOpacity
                          style={styles().locationIconStyles}
                          onPress={() => handleLabelSelection('office')}
                        >
                          <CustomWorkIcon
                            iconColor={
                              selectedLabel === 'office'
                                ? currentTheme.newheaderColor
                                : currentTheme.darkBgFont
                            }
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles().locationTypes}>
                        <TouchableOpacity
                          style={styles().locationStyles}
                          onPress={() => handleLabelSelection('office')}
                        >
                          <TextDefault
                            H5
                            bolder
                            textColor={
                              selectedLabel === 'office'
                                ? currentTheme.newheaderColor
                                : currentTheme.darkBgFont
                            }
                          >
                            {t('Office')}
                          </TextDefault>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles().lastLocationRow}>
                      <View style={styles().locationIcon}>
                        <TouchableOpacity
                          style={styles().locationIconStyles}
                          onPress={() => handleLabelSelection('other')}
                        >
                          <CustomOtherIcon
                            iconColor={
                              selectedLabel === 'other'
                                ? currentTheme.newheaderColor
                                : currentTheme.darkBgFont
                            }
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles().locationTypes}>
                        <TouchableOpacity
                          style={styles().locationStyles}
                          onPress={() => handleLabelSelection('other')}
                        >
                          <TextDefault
                            H5
                            bolder
                            textColor={
                              selectedLabel === 'other'
                                ? currentTheme.newheaderColor
                                : currentTheme.darkBgFont
                            }
                          >
                            {t('Other')}
                          </TextDefault>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View>
              <TouchableOpacity
                disabled={loading}
                onPress={onSelectLocation}
                activeOpacity={0.5}
                style={styles(currentTheme).saveBtnContainer}
              >
                {!loading && (
                  <TextDefault textColor={currentTheme.black} H5 bold>
                    {t('saveAddress')}
                  </TextDefault>
                )}
                {loading && <Spinner backColor={'transparent'} />}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <View
        style={{
          paddingBottom: inset.bottom,
          backgroundColor: currentTheme.themeBackground
        }}
      />
    </>
  )
}

export default SaveAddress
