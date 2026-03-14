import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback
} from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Dimensions
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LocationContext } from '../../context/Location'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scale } from '../../utils/scaling'
import { theme } from '../../utils/themeColors'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import styles from './styles'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { useTranslation } from 'react-i18next'
import SearchModal from '../../components/Address/SearchModal'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import MapView from './MapView'
import screenOptions from './screenOptions'
import { useLocation } from '../../ui/hooks'
import UserContext from '../../context/User'
import AuthContext from '../../context/Auth'
import useGeocoding from '../../ui/hooks/useGeocoding'
import { API_URL } from '../../config/api'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import { useAppBranding } from '../../utils/translationHelper'

const LATITUDE = 13.0827 // Chennai coordinates
const LONGITUDE = 80.2707 // Chennai coordinates
const LATITUDE_DELTA = 0.2
const LONGITUDE_DELTA = 0.2
const { width, height } = Dimensions.get('window')

export default function AddNewAddress(props) {
  const { isLoggedIn } = useContext(UserContext)
  const { token } = useContext(AuthContext)
  const branding = useAppBranding()
  const { getAddress } = useGeocoding()

  // Extract route params first
  const {
    longitude,
    latitude,
    id,
    city,
    address,
    streetAddress,
    district,
    pincode,
    state,
    addressType: editAddressType,
    addressLabel: editAddressLabel
  } = props.route.params || {}

  const [searchModalVisible, setSearchModalVisible] = useState(false)
  const [saveAddressModalVisible, setSaveAddressModalVisible] = useState(false)
  const [addressLabel, setAddressLabel] = useState(editAddressLabel || 'Home')
  const [addressType, setAddressType] = useState(editAddressType || 'home')
  const [saving, setSaving] = useState(false)

  // Resizable form height state (45% default for map, 55% for form)
  const [mapHeight, setMapHeight] = useState(height * 0.45)
  const [formHeight, setFormHeight] = useState(height * 0.55)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  // Check if we're in edit mode
  const isEditMode = id != null

  // Initialize coordinates - handle edit mode with proper fallbacks
  const initialCoordinates = {
    latitude:
      latitude != null && latitude !== undefined && latitude !== null
        ? latitude
        : LATITUDE,
    longitude:
      longitude != null && longitude !== undefined && longitude !== null
        ? longitude
        : LONGITUDE
  }

  console.log('Initial coordinates setup:', {
    isEditMode,
    latitude,
    longitude,
    initialCoordinates,
    hasValidLatitude:
      latitude != null && latitude !== undefined && latitude !== null,
    hasValidLongitude:
      longitude != null && longitude !== undefined && longitude !== null
  })

  // Try to get stored coordinates from AsyncStorage as fallback for edit mode
  const [storedCoordinates, setStoredCoordinates] = useState(null)

  useEffect(() => {
    if (
      isEditMode &&
      (!latitude || !longitude || latitude === null || longitude === null)
    ) {
      // Try to get coordinates from AsyncStorage for this address
      const getStoredCoordinates = async () => {
        try {
          const storedKey = `address_coords_${id}`
          const stored = await AsyncStorage.getItem(storedKey)
          if (stored) {
            const coords = JSON.parse(stored)
            console.log('Found stored coordinates for address:', coords)
            setStoredCoordinates(coords)

            // Update both coordinate states with stored values
            setCoordinates({
              latitude: coords.latitude,
              longitude: coords.longitude
            })

            setSelectedValue((prev) => ({
              ...prev,
              latitude: coords.latitude,
              longitude: coords.longitude
            }))
          }
        } catch (error) {
          console.log('Error getting stored coordinates:', error)
        }
      }
      getStoredCoordinates()
    }
  }, [isEditMode, id, latitude, longitude])

  const [selectedValue, setSelectedValue] = useState({
    city: city || '',
    address: address || '',
    streetAddress: streetAddress || '',
    district: district || '',
    pincode: pincode || '',
    state: state || '',
    latitude: initialCoordinates.latitude,
    longitude: initialCoordinates.longitude
  })

  const [coordinates, setCoordinates] = useState(initialCoordinates)
  const { setLocation } = useContext(LocationContext)
  const mapRef = useRef()

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const inset = useSafeAreaInsets()
  const navigation = useNavigation()
  const { getCurrentLocation } = useLocation()

  const { t } = useTranslation()
  // Resize function for toggle between 80% and 20%
  const resizeForm = () => {
    if (formHeight >= height * 0.5) {
      // Currently large form, switch to small form (20%)
      setFormHeight(height * 0.2)
      setMapHeight(height * 0.8)
    } else {
      // Currently small form, switch to large form (80%)
      setFormHeight(height * 0.8)
      setMapHeight(height * 0.2)
    }
  }

  const setCurrentLocation = async () => {
    try {
      console.log('Getting current location...')
      const { coords, error } = await getCurrentLocation()
      if (!error && coords) {
        console.log('Current location obtained:', coords)

        // Update coordinates state
        setCoordinates({
          latitude: coords.latitude,
          longitude: coords.longitude
        })

        // Update selectedValue with new coordinates
        setSelectedValue((prev) => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude
        }))

        // Trigger geocoding for the new coordinates
        await onRegionChangeComplete({
          latitude: coords.latitude,
          longitude: coords.longitude
        })

        // Animate map to new location
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA
            },
            1000
          )
        }
      } else {
        console.error('Error getting current location:', error)
        FlashMessage({
          message:
            'Unable to get current location. Please check your GPS settings.',
          type: 'danger'
        })
      }
    } catch (error) {
      console.error('Error in setCurrentLocation:', error)
      FlashMessage({
        message: 'Failed to get location. Please try again.',
        type: 'danger'
      })
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions(
      screenOptions({
        title: isEditMode
          ? t('editAddress') || 'Edit Address'
          : t('addAddress') || 'Add Address',
        fontColor: currentTheme.newFontcolor,
        backColor: currentTheme.newheaderBG,
        iconColor: currentTheme.newIconColor,
        lineColor: currentTheme.newIconColor,
        setCurrentLocation
      })
    )
  }, [isEditMode])

  // Effect to handle initial setup
  useEffect(() => {
    // If we have coordinates in edit mode, update the map
    if (
      latitude != null &&
      longitude != null &&
      latitude !== null &&
      longitude !== null &&
      mapRef.current
    ) {
      setTimeout(() => {
        mapRef.current.animateToRegion(
          {
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          },
          1000
        )
      }, 500)
    }
  }, [])

  const onRegionChangeComplete = useCallback(async (coordinates) => {
    // Validate coordinates before attempting geocoding
    if (
      !coordinates ||
      coordinates.latitude == null ||
      coordinates.longitude == null
    ) {
      console.warn('Invalid coordinates for geocoding:', coordinates)
      return
    }

    try {
      console.log('Attempting geocoding for coordinates:', coordinates)
      const response = await getAddress(
        coordinates.latitude,
        coordinates.longitude
      )
      console.log('Geocoding response:', response)

      // Update coordinates and address, but DO NOT update city from geocoding
      setSelectedValue((prev) => ({
        ...prev,
        address: response.formattedAddress || 'Location not found',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
        // Note: We intentionally do NOT update city from geocoding
        // city: response.city || '' // REMOVED - city will be manually entered by user
      }))

      // Update coordinates state to keep them in sync
      setCoordinates({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      })
    } catch (error) {
      console.error('Geocoding failed:', error.message || error)

      // Check if it's a JSON parse error
      if (error.message && error.message.includes('JSON')) {
        console.error('JSON Parse Error - API response may be invalid:', error)
        FlashMessage({
          message:
            'Location service temporarily unavailable. Please try again.',
          type: 'warning'
        })
      }

      // Fallback to coordinate display
      if (
        coordinates &&
        coordinates.latitude != null &&
        coordinates.longitude != null
      ) {
        setSelectedValue((prev) => ({
          ...prev,
          address: `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        }))

        // Update coordinates state to keep them in sync
        setCoordinates({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        })
      } else {
        setSelectedValue((prev) => ({
          ...prev,
          address: 'Location coordinates not available',
          latitude: LATITUDE,
          longitude: LONGITUDE
        }))

        // Update coordinates state to keep them in sync
        setCoordinates({
          latitude: LATITUDE,
          longitude: LONGITUDE
        })
      }
    }
  }, [])

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        const keyboardHeight = event.endCoordinates.height
        setKeyboardHeight(keyboardHeight)

        // Adjust form height when keyboard is shown
        if (formHeight < height * 0.7) {
          setFormHeight(height * 0.7)
          setMapHeight(height * 0.3)
        }
      }
    )

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0)
        // Reset to default when keyboard is hidden
        setFormHeight(height * 0.55)
        setMapHeight(height * 0.45)
      }
    )

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const handleAddressTypeSelect = (type) => {
    setAddressType(type)
    switch (type) {
      case 'home':
        setAddressLabel('Home')
        break
      case 'work':
        setAddressLabel('Work')
        break
      case 'other':
        setAddressLabel('Other')
        break
    }
  }

  const openSaveAddressModal = () => {
    if (
      !selectedValue.address ||
      !selectedValue.city ||
      !selectedValue.streetAddress ||
      !selectedValue.pincode
    ) {
      Alert.alert(
        'Incomplete Information',
        'Please fill all required fields (marked with *)',
        [{ text: 'OK' }]
      )
      return
    }
    setSaveAddressModalVisible(true)
  }

  const onSaveAddress = async () => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please login to save address')
      return
    }

    setSaving(true)

    try {
      const completeAddress = [
        selectedValue.streetAddress,
        selectedValue.district,
        selectedValue.city,
        selectedValue.state,
        selectedValue.pincode
      ]
        .filter(Boolean)
        .join(', ')

      // Debug coordinates before saving
      console.log('Coordinates before saving:', {
        coordinates,
        selectedValueLatitude: selectedValue.latitude,
        selectedValueLongitude: selectedValue.longitude,
        latitude,
        longitude
      })

      // Ensure coordinates are never null - use fallback values
      const finalLatitude =
        selectedValue.latitude || coordinates.latitude || LATITUDE
      const finalLongitude =
        selectedValue.longitude || coordinates.longitude || LONGITUDE

      console.log('Final coordinates to save:', {
        finalLatitude,
        finalLongitude,
        finalLatitudeType: typeof finalLatitude,
        finalLongitudeType: typeof finalLongitude
      })

      const addressData = {
        addressType: addressType,
        address1: selectedValue.streetAddress || completeAddress,
        address2: selectedValue.district || '',
        city: selectedValue.city, // City is manually entered by user
        state: selectedValue.state,
        zipCode: selectedValue.pincode,
        country: 'India',
        latitude: finalLatitude,
        longitude: finalLongitude,
        contactPersonName: '',
        contactPersonNumber: '',
        isDefault: false
      }

      console.log('Complete address data being sent to backend:', addressData)

      // If we're editing an existing address, include the ID
      if (isEditMode && id) {
        addressData._id = id
        console.log('Updating existing address with ID:', id)
      }

      console.log('Saving address data:', addressData)

      const response = await fetch(`${API_URL}/user/update-user-addresses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      })

      if (response.ok) {
        const result = await response.json()

        // Store coordinates in AsyncStorage as backup since backend might not store them
        try {
          const storedKey = `address_coords_${result.address?._id || id}`
          const coordsToStore = {
            latitude: finalLatitude,
            longitude: finalLongitude,
            timestamp: Date.now()
          }
          await AsyncStorage.setItem(storedKey, JSON.stringify(coordsToStore))
          console.log('Stored coordinates in AsyncStorage:', coordsToStore)
        } catch (storageError) {
          console.log(
            'Failed to store coordinates in AsyncStorage:',
            storageError
          )
        }

        const locationData = {
          label: addressLabel,
          addressType: addressType,
          deliveryAddress:
            completeAddress || selectedValue.city || selectedValue.address,
          latitude: selectedValue.latitude,
          longitude: selectedValue.longitude,
          city: selectedValue.city,
          streetAddress: selectedValue.streetAddress,
          district: selectedValue.district,
          pincode: selectedValue.pincode,
          state: selectedValue.state
        }

        setLocation(locationData)
        setSaveAddressModalVisible(false)

        navigation.navigate('Menu')

        FlashMessage({ message: 'Address saved successfully', type: 'success' })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Save address error:', errorData)
        FlashMessage({ message: 'Failed to save address', type: 'danger' })
      }
    } catch (error) {
      console.error('Error saving address:', error)
      FlashMessage({ message: 'Error saving address', type: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const fitMapToCoordinates = useCallback((location) => {
    if (
      mapRef.current &&
      location &&
      location.latitude != null &&
      location.longitude != null
    ) {
      mapRef.current.fitToCoordinates([
        {
          latitude: location.latitude,
          longitude: location.longitude
        }
      ])
    }
  }, [])

  return (
    <KeyboardAvoidingView
      style={containerStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      enabled
    >
      <View style={containerStyles.container}>
        {/* Map Section - Dynamic Height */}
        <View style={[containerStyles.mapContainer, { height: mapHeight }]}>
          <MapView
            ref={mapRef}
            initialRegion={{
              latitude: initialCoordinates.latitude,
              longitude: initialCoordinates.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA
            }}
            onRegionChangeComplete={onRegionChangeComplete}
          />
          <View style={containerStyles.markerContainer}>
            <View style={containerStyles.markerPin}>
              <MaterialIcons
                name='location-pin'
                size={40}
                color={branding.primaryColor}
              />
              <View
                style={[
                  containerStyles.markerPulse,
                  { borderColor: branding.primaryColor }
                ]}
              />
            </View>
          </View>

          {/* Search Button on Map */}
          <TouchableOpacity
            style={[
              containerStyles.mapSearchButton,
              { backgroundColor: branding.primaryColor }
            ]}
            onPress={() => setSearchModalVisible(true)}
          >
            <Feather name='search' size={20} color={currentTheme.buttonText} />
            <TextDefault
              textColor={currentTheme.buttonText}
              H6
              style={{ marginLeft: 8 }}
            >
              {t('searchLocation') || 'Search Location'}
            </TextDefault>
          </TouchableOpacity>
        </View>

        {/* Simple Divider */}
        <View
          style={[
            containerStyles.simpleDivider,
            { backgroundColor: currentTheme.newIconColor }
          ]}
        />

        {/* Form Section - Dynamic Height */}
        <View style={[containerStyles.formCard, { height: formHeight }]}>
          {/* Card Header with Resize Controls */}
          <View
            style={[
              containerStyles.cardHeader,
              { backgroundColor: currentTheme.newheaderBG }
            ]}
          >
            <View style={containerStyles.headerContent}>
              <View style={containerStyles.headerLeft}>
                <MaterialIcons
                  name='location-on'
                  size={24}
                  color={branding.primaryColor}
                />
                <TextDefault
                  textColor={currentTheme.newFontcolor}
                  H4
                  bolder
                  style={{ marginLeft: 10 }}
                >
                  {isEditMode
                    ? t('editAddress') || 'Edit Address'
                    : t('addAddress') || 'Add Address'}
                </TextDefault>
              </View>
              {isEditMode && (
                <View style={containerStyles.editIndicator}>
                  <Feather
                    name='edit-2'
                    size={16}
                    color={branding.primaryColor}
                  />
                  <TextDefault
                    textColor={branding.primaryColor}
                    H7
                    style={{ marginLeft: 6 }}
                  >
                    {t('editing') || 'Editing'}
                  </TextDefault>
                </View>
              )}
            </View>

            {/* Resize Dropdown Button */}
            <TouchableOpacity
              style={[
                containerStyles.resizeDropdownButton,
                { backgroundColor: branding.primaryColor }
              ]}
              onPress={resizeForm}
            >
              <Feather
                name='maximize-2'
                size={16}
                color={currentTheme.buttonText}
              />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView
            style={formStyles.scrollView}
            contentContainerStyle={formStyles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            nestedScrollEnabled={true}
            automaticallyAdjustContentInsets={false}
            contentInset={{ bottom: 0 }}
            contentOffset={{ x: 0, y: 0 }}
          >
            {/* Address Selection Section */}
            <View style={formStyles.section}>
              <View style={formStyles.sectionHeader}>
                <Feather
                  name='map-pin'
                  size={18}
                  color={currentTheme.newIconColor}
                />
                <TextDefault
                  textColor={currentTheme.newFontcolor}
                  H5
                  bolder
                  style={formStyles.sectionTitle}
                >
                  {t('selectedLocation') || 'Selected Location'}
                </TextDefault>
              </View>

              <TouchableOpacity
                onPress={() => setSearchModalVisible(true)}
                style={[
                  formStyles.locationCard,
                  {
                    borderColor: currentTheme.newIconColor,
                    backgroundColor: currentTheme.newheaderBG
                  }
                ]}
              >
                <View style={formStyles.locationContent}>
                  <Feather
                    name='map-pin'
                    size={16}
                    color={branding.primaryColor}
                  />
                  <View style={formStyles.locationTextContainer}>
                    <TextDefault
                      textColor={currentTheme.newFontcolor}
                      H6
                      numberOfLines={2}
                      style={{ flex: 1 }}
                    >
                      {selectedValue.address ||
                        t('selectAddress') ||
                        'Select an address'}
                    </TextDefault>
                    <Feather
                      name='chevron-right'
                      size={18}
                      color={currentTheme.newIconColor}
                    />
                  </View>
                </View>
                <View style={formStyles.coordinatesRow}>
                  <TextDefault
                    textColor={currentTheme.fontSecondColor}
                    H7
                    style={formStyles.coordinateText}
                  >
                    Lat: {selectedValue.latitude?.toFixed(6)}
                  </TextDefault>
                  <TextDefault
                    textColor={currentTheme.fontSecondColor}
                    H7
                    style={formStyles.coordinateText}
                  >
                    Lng: {selectedValue.longitude?.toFixed(6)}
                  </TextDefault>
                </View>
              </TouchableOpacity>
              {/* Address Details Form */}
              <View style={formStyles.section}>
                <View style={formStyles.sectionHeader}>
                  <Feather
                    name='edit-3'
                    size={18}
                    color={currentTheme.newIconColor}
                  />
                  <TextDefault
                    textColor={currentTheme.newFontcolor}
                    H5
                    bolder
                    style={formStyles.sectionTitle}
                  >
                    {t('addressDetails') || 'Address Details'}
                  </TextDefault>
                </View>

                {/* Street Address */}
                <View style={formStyles.inputGroup}>
                  <View style={formStyles.inputHeader}>
                    <TextDefault
                      textColor={currentTheme.newFontcolor}
                      H6
                      bolder
                    >
                      {t('streetAddress') || 'Street Address'}
                    </TextDefault>
                    <Text style={{ color: '#FF4444', marginLeft: 4 }}>*</Text>
                  </View>
                  <View
                    style={[
                      formStyles.inputContainer,
                      {
                        borderColor: currentTheme.newIconColor,
                        backgroundColor: currentTheme.newheaderBG
                      }
                    ]}
                  >
                    <TextInput
                      style={[
                        formStyles.textInput,
                        { color: currentTheme.newFontcolor }
                      ]}
                      placeholder='House number, building name, street'
                      placeholderTextColor={currentTheme.fontSecondColor}
                      value={selectedValue.streetAddress}
                      onChangeText={(text) =>
                        setSelectedValue((prev) => ({
                          ...prev,
                          streetAddress: text
                        }))
                      }
                      multiline={true}
                      numberOfLines={2}
                    />
                    <Feather
                      name='home'
                      size={18}
                      color={currentTheme.newIconColor}
                      style={formStyles.inputIcon}
                    />
                  </View>
                </View>

                {/* District and City Row */}
                <View style={formStyles.row}>
                  {/* District */}
                  <View style={[formStyles.inputGroup, formStyles.flex]}>
                    <View style={formStyles.inputHeader}>
                      <TextDefault
                        textColor={currentTheme.newFontcolor}
                        H6
                        bolder
                      >
                        {t('district') || 'District'}
                      </TextDefault>
                    </View>
                    <View
                      style={[
                        formStyles.inputContainer,
                        {
                          borderColor: currentTheme.newIconColor,
                          backgroundColor: currentTheme.newheaderBG
                        }
                      ]}
                    >
                      <TextInput
                        style={[
                          formStyles.textInput,
                          { color: currentTheme.newFontcolor }
                        ]}
                        placeholder='District'
                        placeholderTextColor={currentTheme.fontSecondColor}
                        value={selectedValue.district}
                        onChangeText={(text) =>
                          setSelectedValue((prev) => ({
                            ...prev,
                            district: text
                          }))
                        }
                      />
                      <Feather
                        name='map'
                        size={16}
                        color={currentTheme.newIconColor}
                        style={formStyles.inputIcon}
                      />
                    </View>
                  </View>

                  {/* City - Manually editable (required) */}
                  <View
                    style={[
                      formStyles.inputGroup,
                      formStyles.flex,
                      { marginLeft: 10 }
                    ]}
                  >
                    <View style={formStyles.inputHeader}>
                      <TextDefault
                        textColor={currentTheme.newFontcolor}
                        H6
                        bolder
                      >
                        {t('city') || 'City'}
                      </TextDefault>
                      <Text style={{ color: '#FF4444', marginLeft: 4 }}>*</Text>
                    </View>
                    <View
                      style={[
                        formStyles.inputContainer,
                        {
                          borderColor: currentTheme.newIconColor,
                          backgroundColor: currentTheme.newheaderBG
                        }
                      ]}
                    >
                      <TextInput
                        style={[
                          formStyles.textInput,
                          { color: currentTheme.newFontcolor }
                        ]}
                        placeholder='Enter city name'
                        placeholderTextColor={currentTheme.fontSecondColor}
                        value={selectedValue.city}
                        onChangeText={(text) =>
                          setSelectedValue((prev) => ({ ...prev, city: text }))
                        }
                      />
                      <Feather
                        name='map-pin'
                        size={16}
                        color={currentTheme.newIconColor}
                        style={formStyles.inputIcon}
                      />
                    </View>
                  </View>
                </View>

                {/* State and Pincode Row */}
                <View style={formStyles.row}>
                  {/* State */}
                  <View style={[formStyles.inputGroup, formStyles.flex]}>
                    <View style={formStyles.inputHeader}>
                      <TextDefault
                        textColor={currentTheme.newFontcolor}
                        H6
                        bolder
                      >
                        {t('state') || 'State'}
                      </TextDefault>
                    </View>
                    <View
                      style={[
                        formStyles.inputContainer,
                        {
                          borderColor: currentTheme.newIconColor,
                          backgroundColor: currentTheme.newheaderBG
                        }
                      ]}
                    >
                      <TextInput
                        style={[
                          formStyles.textInput,
                          { color: currentTheme.newFontcolor }
                        ]}
                        placeholder='State'
                        placeholderTextColor={currentTheme.fontSecondColor}
                        value={selectedValue.state}
                        onChangeText={(text) =>
                          setSelectedValue((prev) => ({ ...prev, state: text }))
                        }
                      />
                      <Feather
                        name='map'
                        size={16}
                        color={currentTheme.newIconColor}
                        style={formStyles.inputIcon}
                      />
                    </View>
                  </View>

                  {/* Pincode */}
                  <View
                    style={[
                      formStyles.inputGroup,
                      formStyles.flex,
                      { marginLeft: 10 }
                    ]}
                  >
                    <View style={formStyles.inputHeader}>
                      <TextDefault
                        textColor={currentTheme.newFontcolor}
                        H6
                        bolder
                      >
                        {t('pincode') || 'Pincode'}
                      </TextDefault>
                      <Text style={{ color: '#FF4444', marginLeft: 4 }}>*</Text>
                    </View>
                    <View
                      style={[
                        formStyles.inputContainer,
                        {
                          borderColor: currentTheme.newIconColor,
                          backgroundColor: currentTheme.newheaderBG
                        }
                      ]}
                    >
                      <TextInput
                        style={[
                          formStyles.textInput,
                          { color: currentTheme.newFontcolor }
                        ]}
                        placeholder='Pincode'
                        placeholderTextColor={currentTheme.fontSecondColor}
                        value={selectedValue.pincode}
                        onChangeText={(text) =>
                          setSelectedValue((prev) => ({
                            ...prev,
                            pincode: text
                          }))
                        }
                        keyboardType='numeric'
                        maxLength={6}
                      />
                      <Feather
                        name='hash'
                        size={16}
                        color={currentTheme.newIconColor}
                        style={formStyles.inputIcon}
                      />
                    </View>
                  </View>
                </View>

                {/* Address Type Selection */}
                <View style={formStyles.section}>
                  <View style={formStyles.sectionHeader}>
                    <Feather
                      name='tag'
                      size={18}
                      color={currentTheme.newIconColor}
                    />
                    <TextDefault
                      textColor={currentTheme.newFontcolor}
                      H5
                      bolder
                      style={formStyles.sectionTitle}
                    >
                      {t('addressType') || 'Address Type'}
                    </TextDefault>
                  </View>

                  <View style={formStyles.addressTypeContainer}>
                    {[
                      {
                        type: 'home',
                        label: t('home') || 'Home',
                        icon: CustomHomeIcon
                      },
                      {
                        type: 'work',
                        label: t('work') || 'Work',
                        icon: CustomWorkIcon
                      },
                      {
                        type: 'other',
                        label: t('other') || 'Other',
                        icon: CustomOtherIcon
                      }
                    ].map(({ type, label, icon }) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          formStyles.addressTypeButton,
                          {
                            borderColor:
                              addressType === type
                                ? branding.primaryColor
                                : currentTheme.newIconColor,
                            backgroundColor:
                              addressType === type
                                ? branding.primaryColor + '20'
                                : currentTheme.newheaderBG
                          }
                        ]}
                        onPress={() => handleAddressTypeSelect(type)}
                      >
                        {React.createElement(icon, {
                          width: 24,
                          height: 24,
                          fill:
                            addressType === type
                              ? branding.primaryColor
                              : currentTheme.newIconColor
                        })}
                        <TextDefault
                          textColor={
                            addressType === type
                              ? branding.primaryColor
                              : currentTheme.newFontcolor
                          }
                          H6
                          style={formStyles.addressTypeLabel}
                        >
                          {label}
                        </TextDefault>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                formStyles.saveButton,
                { backgroundColor: branding.primaryColor }
              ]}
              onPress={openSaveAddressModal}
              disabled={
                !selectedValue.address ||
                !selectedValue.city ||
                !selectedValue.streetAddress ||
                !selectedValue.pincode
              }
            >
              <TextDefault textColor={currentTheme.buttonText} H5 bolder>
                {isEditMode
                  ? t('updateAddress') || 'Update Address'
                  : t('saveAddress') || 'Save Address'}
              </TextDefault>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Search Modal */}
        <SearchModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
          onSubmit={(description, coords) => {
            setSearchModalVisible(false)
            setCoordinates({
              latitude: coords.lat,
              longitude: coords.lng
            })
            onRegionChangeComplete({
              latitude: coords.lat,
              longitude: coords.lng
            })
          }}
        />

        {/* Save Address Confirmation Modal */}
        <Modal
          animationType='slide'
          transparent={true}
          visible={saveAddressModalVisible}
          onRequestClose={() => setSaveAddressModalVisible(false)}
        >
          <View style={modalStyles.modalOverlay}>
            <View
              style={[
                modalStyles.modalContent,
                { backgroundColor: currentTheme.newheaderBG }
              ]}
            >
              <View style={modalStyles.modalHeader}>
                <TextDefault textColor={currentTheme.newFontcolor} H4 bolder>
                  {t('confirmSaveAddress') || 'Confirm Save Address'}
                </TextDefault>
              </View>

              <View style={modalStyles.modalBody}>
                <TextDefault textColor={currentTheme.newFontcolor} H6>
                  {t('saveAddressConfirmation') ||
                    'Are you sure you want to save this address?'}
                </TextDefault>
                <View style={modalStyles.addressPreview}>
                  <TextDefault textColor={currentTheme.fontSecondColor} H6>
                    {selectedValue.streetAddress}
                  </TextDefault>
                  <TextDefault textColor={currentTheme.fontSecondColor} H6>
                    {selectedValue.city}, {selectedValue.state}{' '}
                    {selectedValue.pincode}
                  </TextDefault>
                </View>
              </View>

              <View style={modalStyles.modalActions}>
                <TouchableOpacity
                  style={[
                    modalStyles.cancelButton,
                    { borderColor: currentTheme.newIconColor }
                  ]}
                  onPress={() => setSaveAddressModalVisible(false)}
                >
                  <TextDefault textColor={currentTheme.newFontcolor} H6>
                    {t('cancel') || 'Cancel'}
                  </TextDefault>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    modalStyles.confirmButton,
                    { backgroundColor: branding.primaryColor }
                  ]}
                  onPress={onSaveAddress}
                  disabled={saving}
                >
                  {saving ? (
                    <TextDefault textColor={currentTheme.buttonText} H6>
                      {t('saving') || 'Saving...'}
                    </TextDefault>
                  ) : (
                    <TextDefault textColor={currentTheme.buttonText} H6>
                      {t('confirm') || 'Confirm'}
                    </TextDefault>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  )
}

// Styles for the enhanced address form
const containerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  mapContainer: {
    position: 'relative',
    overflow: 'hidden'
  },
  markerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -40 }],
    zIndex: 2
  },
  markerPin: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  markerPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'transparent'
  },
  mapSearchButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  simpleDivider: {
    height: 1,
    width: '100%'
  },
  formCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  editIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10
  },
  resizeDropdownButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const formStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
    marginBottom: 60
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40, // Increased padding for keyboard
    flexGrow: 1
  },
  section: {
    marginBottom: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    marginLeft: 8
  },
  locationCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12
  },
  coordinatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  coordinateText: {
    fontSize: 12
  },
  inputGroup: {
    marginBottom: 16
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    minHeight: 44 // Ensure minimum touch target
  },
  inputIcon: {
    marginLeft: 8
  },
  row: {
    flexDirection: 'row'
  },
  flex: {
    flex: 1
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  addressTypeButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '30%'
  },
  addressTypeLabel: {
    marginTop: 4,
    fontSize: 12
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 20
  }
})

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  modalBody: {
    marginBottom: 20
  },
  addressPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 10
  }
})
