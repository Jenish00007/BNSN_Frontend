import React, { useContext, useEffect } from 'react'
import {
  Modal,
  View,
  TouchableOpacity,
  Keyboard,
  Dimensions
} from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
// Removed animations to fix memory leaks
import useEnvVars from '../../../environment'
import CloseIcon from '../../assets/SVG/imageComponents/CloseIcon'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { alignment } from '../../utils/alignment'
import { scale } from '../../utils/scaling'
import { theme } from '../../utils/themeColors'
import TextDefault from '../Text/TextDefault/TextDefault'
import styles from './styles'

import { useTranslation } from 'react-i18next'
import { AntDesign, Ionicons } from '@expo/vector-icons'

const { height } = Dimensions.get('screen')

export default function SearchModal({
  visible = false,
  onClose = () => {},
  onSubmit = () => {}
}) {
  const { t } = useTranslation()
  // Removed animation to fix memory leaks
  const { GOOGLE_MAPS_KEY } = useEnvVars()

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  // Removed animated styles to fix memory leaks

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow)
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide)

    // cleanup function
    return () => {
      Keyboard.removeAllListeners('keyboardDidShow', _keyboardDidShow)
      Keyboard.removeAllListeners('keyboardDidHide', _keyboardDidHide)
    }
  }, [])

  const _keyboardDidShow = () => {
    // Removed animation to fix memory leaks
  }

  const _keyboardDidHide = () => {
    // Removed animation to fix memory leaks
  }

  function close() {
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType={'slide'}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles(currentTheme).modalContainer,
          { marginTop: height * 0.4, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
          {
            borderWidth: 1,
            borderColor: '#DAD6D6'
          }
        ]}
      >
        <View style={[styles(currentTheme).flex, alignment.MTsmall]}>
          <TouchableOpacity style={styles().modalTextBtn} onPress={close}>
            <AntDesign
              name='arrowleft'
              size={24}
              color={currentTheme.newIconColor}
            />
          </TouchableOpacity>
          <GooglePlacesAutocomplete
            placeholder={t('search')}
            minLength={2} // minimum length of text to search
            autoFocus={true}
            returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
            listViewDisplayed='auto' // true/false/undefined
            fetchDetails={true}
            renderDescription={(row) => row.description} // custom description render
            renderRow={(data) =>(
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles(currentTheme).locationIcon} >
                      <Ionicons name="location-outline" size={16} color={currentTheme.newIconColor} />
                    </View>
                    <TextDefault>{data?.description}</TextDefault>
                  </View>
              )
            } //
            onPress={(data, details = null) => {
              onSubmit(data.description, details.geometry.location)
            }}
            getDefaultValue={() => {
              return '' // text input default value
            }}
            query={{
              // available options: https://developers.google.com/places/web-service/autocomplete
              key: GOOGLE_MAPS_KEY,
              language: 'en', // language of the results
              components: 'country:in', // Restrict to India
              types: 'geocode' // Only return geocoding results, not business results
            }}
            textInputProps={{
              placeholderTextColor: currentTheme.fontMainColor
            }}
            styles={{
              listView: {
                marginLeft: -50,
              },
              description: {
                fontWeight: 'bold',
                color: currentTheme.black,
              },
              predefinedPlacesDescription: {
                color: '#1faadb'
              },
              textInputContainer: {
                borderWidth: 1,
                borderColor: currentTheme.verticalLine,
                borderRadius: scale(6),
                backgroundColor: currentTheme.themeBackground
              },
              textInput: {
                ...alignment.MTxSmall,
                color: currentTheme.newFontcolor,
                backgroundColor: currentTheme.themeBackground,
                height: 38
              }
            }}
            nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
            GoogleReverseGeocodingQuery={
              {
                // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                components: 'country:in'
              }
            }
            GooglePlacesSearchQuery={{
              // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
              rankby: 'distance',
              type: 'geocode'
            }}
            // filterReverseGeocodingByTypes={[
            //   'locality',
            // ]} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
            debounce={200}
          />
        </View>
      </View>
    </Modal>
  )
}
