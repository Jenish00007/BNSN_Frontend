/* eslint-disable react/display-name */
import React from 'react'
import {
  RightButton,
  BackButton
} from '../components/Header/HeaderIcons/HeaderIcons'
import { StyleSheet } from 'react-native'
import { textStyles } from '../utils/textStyles'
import { scale } from '../utils/scaling'
import { useTranslation } from 'react-i18next'

const screenOptions = props => {
  const { t } = useTranslation()
  return {
    headerTitleAlign: 'center',
    headerBackTitleVisible: false,
    headerStyle: {
      backgroundColor: props.backColor,
      borderBottomColor: props.lineColor,
      borderBottomWidth: StyleSheet.hairlineWidth
    },
    headerTitleStyle: {
      color: '#FFFFFF', // Force white color for header text
      ...textStyles.Bolder,
      ...textStyles.B700,
      backgroundColor: 'transparent'
    },
    headerTitleContainerStyle: {
      marginHorizontal: scale(35)
    },
    headerBackImage: () =>
      BackButton({ iconColor: '#FFFFFF', icon: 'leftArrow' }), // Force white color for back arrow
    headerRight: () => (
      <RightButton icon="menu" iconColor="#FFFFFF" menuHeader={false} t={t}/> // Force white color for right button
    )
  }
}
export default screenOptions
