import React, { useContext } from 'react'
import { TouchableOpacity } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import styles from './styles'
import { scale } from '../../../utils/scaling'
import Spinner from '../../../components/Spinner/Spinner'
import { theme } from '../../../utils/themeColors'
import ThemeContext from '../../ThemeContext/ThemeContext'
import TextDefault from '../../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import { useTranslation } from 'react-i18next'


const FdGoogleBtn = props => {
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { t } = useTranslation()
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles(currentTheme).mainContainer, { borderColor: theme.Figgo.yellow }]}
      onPressIn={props.onPressIn}
      onPress={props.onPress}>
      {props.loadingIcon ? (
        <Spinner
          backColor={currentTheme.themeBackground}
          spinnerColor={theme.Figgo.yellow}
        />
      ) : (
        <>
          <FontAwesome name="google" size={scale(18)} color={theme.Figgo.yellow} />
          <TextDefault H4 textColor={theme.Figgo.yellow} style={alignment.MLlarge} bold>
            {t('ContinueWithGoogle')}
          </TextDefault>
        </>
      )}
    </TouchableOpacity>
  )
}

export default FdGoogleBtn
