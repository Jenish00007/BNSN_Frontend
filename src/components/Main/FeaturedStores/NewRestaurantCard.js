import { useNavigation } from '@react-navigation/native'
import React, { useContext } from 'react'
import { TouchableOpacity, View, Image, Text } from 'react-native'
import ConfigurationContext from '../../../context/Configuration'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { alignment } from '../../../utils/alignment'
import { scale } from '../../../utils/scaling'
import { theme } from '../../../utils/themeColors'
import TextDefault from '../../Text/TextDefault/TextDefault'
import styles from './styles'
import {
  AntDesign,
  FontAwesome5,
  MaterialCommunityIcons
} from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { addFavouriteRestaurant } from '../../../apollo/mutations'
import UserContext from '../../../context/User'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import { profile } from '../../../apollo/queries'
import { FlashMessage } from '../../../ui/FlashMessage/FlashMessage'
import Spinner from '../../Spinner/Spinner'
import AddToFavourites from '../../Favourites/AddtoFavourites'

const ADD_FAVOURITE = gql`
  ${addFavouriteRestaurant}
`
const PROFILE = gql`
  ${profile}
`

function NewRestaurantCard(props) {
  const { t } = useTranslation()
  const configuration = useContext(ConfigurationContext)
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { profile } = useContext(UserContext)
  const heart = profile ? profile.favourite.includes(props._id) : false
  const [mutate, { loading: loadingMutation }] = useMutation(ADD_FAVOURITE, {
    onCompleted,
    refetchQueries: [{ query: PROFILE }]
  })

  function onCompleted() {
    FlashMessage({ message: t('favouritelistUpdated') })
    // alert("favv list updated")
  }

  const handleAddToFavorites = () => {
    if (!loadingMutation && profile) {
      mutate({ variables: { id: props._id } });
    }
  };

  return (
    
      <TouchableOpacity
        style={styles(currentTheme).offerContainer}
        activeOpacity={1}
        onPress={() => navigation.navigate('Restaurant', { ...props })}>
        <View style={styles().imageContainer}>
          <Image
            resizeMode="cover"
            source={{ uri: props?.avatar }}
            style={styles().restaurantImage}
          />

          <View style={styles().overlayContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleAddToFavorites}>
              <View style={styles(currentTheme).favouriteOverlay}>
                
                 <AddToFavourites product={props}/>
                
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles().descriptionContainer}>
          <View style={styles().aboutRestaurant}>
            <TextDefault
              H4
              numberOfLines={1}
              textColor={currentTheme.fontThirdColor}
              bolder>
              {props?.name}
            </TextDefault>
            <View style={styles().aboutRestaurant}>
              <FontAwesome5 name="star" size={18} color={currentTheme.stars} />

              <TextDefault
                textColor={currentTheme.fontThirdColor}
                style={styles().restaurantRatingContainer}
                bolder
                H4>
                {props?.avg_rating}
              </TextDefault>
              <TextDefault
                textColor={currentTheme.fontNewColor}
                style={[
                  styles().restaurantRatingContainer,
                  styles().restaurantTotalRating
                ]}
                H5>
                (
                {props?.rating_count}
                )
              </TextDefault>
            </View>
          </View>
          <TextDefault
            textColor={currentTheme.fontNewColor}
            numberOfLines={1}
            bolder
            Normal
            style={styles().offerCategoty}>
            {props?.address}
          </TextDefault>
         
        </View>
      </TouchableOpacity>
   
  )
}

export default React.memo(NewRestaurantCard)
