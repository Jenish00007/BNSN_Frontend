import React from 'react'
import {
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet
} from 'react-native'
import { scale } from '../../utils/scaling'
import TextDefault from '../Text/TextDefault/TextDefault'
import { useNavigation } from '@react-navigation/native'
import { theme } from '../../utils/themeColors'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { useContext } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import AddToFavourites from '../Favourites/AddtoFavourites'
import { useAppBranding } from '../../utils/translationHelper'

const NewFiggoStore = ({ item }) => {
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const branding = useAppBranding()

  const handleVisit = () => {
    navigation.navigate('Restaurant', { ...item })
  }

  const truncateText = (text, length) => {
    if (!text) return ''
    return text.length > length ? `${text.substring(0, length)}...` : text
  }

  return (
    <TouchableOpacity onPress={handleVisit} activeOpacity={0.8}>
      <View
        style={[
          styles.container,
          { backgroundColor: branding.backgroundColor }
        ]}
      >
        <ImageBackground
          source={{ uri: item?.cover_photo_full_url }}
          style={styles.coverImage}
          imageStyle={styles.coverImageStyle}
        >
          <View style={styles.favoriteContainer}>
            <TouchableOpacity
              style={[
                styles.favoriteButton,
                { backgroundColor: 'rgba(255, 255, 255, 0.8)' }
              ]}
            >
              <AddToFavourites restaurantId={item?.id} />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: item?.logo_full_url }}
              style={styles.logo}
              resizeMode='cover'
            />
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.mainInfo}>
              <TextDefault
                style={[styles.title, { color: branding.textColor }]}
                numberOfLines={1}
              >
                {item?.name || 'Store Name'}
              </TextDefault>

              <View style={styles.addressContainer}>
                <MaterialIcons
                  name='location-on'
                  size={14}
                  color={branding.textColor}
                />
                <TextDefault
                  style={[styles.address, { color: branding.textColor }]}
                  numberOfLines={1}
                >
                  {truncateText(item?.address, 30) ||
                    'House: 00, Road: 00, Street:00'}
                </TextDefault>
              </View>

              <View style={styles.distanceContainer}>
                <MaterialIcons
                  name='directions-bike'
                  size={14}
                  color={branding.primaryColor}
                />
                <TextDefault
                  style={[styles.distance, { color: branding.primaryColor }]}
                >
                  {Math.round(item?.distance / 1000) || '100+'} km
                </TextDefault>
              </View>
            </View>

            <View style={styles.visitButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.visitButton,
                  { backgroundColor: branding.buttonColor }
                ]}
                onPress={handleVisit}
                activeOpacity={0.7}
              >
                <TextDefault
                  style={[styles.visitText, { color: branding.textColor }]}
                >
                  Visit
                </TextDefault>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: scale(12),
    marginVertical: scale(8),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  coverImage: {
    width: '100%',
    height: scale(140),
    borderTopLeftRadius: scale(12),
    borderTopRightRadius: scale(12),
    overflow: 'hidden'
  },
  coverImageStyle: {
    resizeMode: 'cover'
  },
  favoriteContainer: {
    position: 'absolute',
    top: scale(8),
    right: scale(8)
  },
  favoriteButton: {
    borderRadius: scale(15),
    padding: scale(6),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84
  },
  contentContainer: {
    padding: scale(12),
    position: 'relative'
  },
  logoContainer: {
    position: 'absolute',
    top: -scale(25),
    left: scale(12),
    backgroundColor: '#fff',
    borderRadius: scale(8),
    padding: scale(3),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1
  },
  logo: {
    width: scale(45),
    height: scale(45),
    borderRadius: scale(6)
  },
  infoContainer: {
    marginLeft: scale(55),
    marginLeft: scale(60),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  mainInfo: {
    flex: 1,
    marginRight: scale(12)
  },
  title: {
    fontSize: scale(15),
    fontWeight: 'bold',
    marginBottom: scale(4)
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(4)
  },
  address: {
    fontSize: scale(12),
    marginLeft: scale(4),
    flex: 1
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  distance: {
    fontSize: scale(12),
    marginLeft: scale(4)
  },
  visitButtonContainer: {
    justifyContent: 'center',
    paddingLeft: scale(8)
  },
  visitButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(6),
    borderRadius: scale(15),
    minWidth: scale(70)
  },
  visitText: {
    fontSize: scale(12),
    fontWeight: 'bold',
    textAlign: 'center'
  }
})

export default NewFiggoStore
