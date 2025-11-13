import React, { useContext, useMemo, useState, useEffect } from 'react'
import {
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Text,
  ActivityIndicator
} from 'react-native'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import styles from './styles'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { scale } from '../../../utils/scaling'
import { useTranslation } from 'react-i18next'
import { useAppBranding } from '../../../utils/translationHelper'
import filterStyles from './filterStyles'

const DISTANCE_FILTER_OPTIONS = [
  { label: 'All', value: null },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 }
]

function Search(props) {
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const branding = useAppBranding()
  const [showFilterModal, setShowFilterModal] = useState(false)

  const isFiltering = props.isFilteringByDistance || false
  const hasDistanceFilterSupport =
    typeof props.onDistanceFilterChange === 'function'

  const externalDistanceFilter =
    props.distanceFilter !== undefined ? props.distanceFilter : null
  const [internalDistanceFilter, setInternalDistanceFilter] = useState(
    hasDistanceFilterSupport ? externalDistanceFilter : null
  )

  useEffect(() => {
    if (hasDistanceFilterSupport) {
      setInternalDistanceFilter(externalDistanceFilter)
    }
  }, [externalDistanceFilter, hasDistanceFilterSupport])

  const activeDistanceFilter = useMemo(() => {
    return hasDistanceFilterSupport
      ? externalDistanceFilter
      : internalDistanceFilter
  }, [hasDistanceFilterSupport, externalDistanceFilter, internalDistanceFilter])

  // Helper function to check if option is selected
  const isOptionSelected = (optionValue) => {
    // Handle null/"All" option
    if (optionValue === null || optionValue === undefined) {
      return activeDistanceFilter === null || activeDistanceFilter === undefined
    }

    // Handle numeric options
    if (activeDistanceFilter === null || activeDistanceFilter === undefined) {
      return false
    }

    return Number(activeDistanceFilter) === Number(optionValue)
  }

  const handleFilterSelect = (value) => {
    const filterValue = value === null ? null : Number(value)
    if (hasDistanceFilterSupport && props.onDistanceFilterChange) {
      props.onDistanceFilterChange(filterValue)
    } else {
      setInternalDistanceFilter(filterValue)
    }
    setTimeout(() => {
      setShowFilterModal(false)
    }, 150)
  }

  return (
    <View
      style={styles(currentTheme, props.newheaderColor).mainContainerHolder}
    >
      <View style={styles(currentTheme, props.cartContainer).mainContainer}>
        <View style={styles().subContainer}>
          <View style={styles().leftContainer}>
            <View style={styles().searchContainer}>
              <Ionicons
                name='search'
                color={currentTheme.gray500}
                size={scale(18)}
              />
            </View>
            <View style={styles().inputContainer}>
              <TextInput
                style={styles(currentTheme).bodyStyleOne}
                placeholder={props.placeHolder}
                placeholderTextColor={currentTheme.gray500}
                onChangeText={(text) => props.setSearch(text)}
                value={props.search}
                returnKeyType='search'
                clearButtonMode='never'
              />
            </View>
          </View>
          <View style={styles().filterContainer}>
            <View style={filterStyles.rightButtonsContainer}>
              {/* Filter Icon - Always show if distance filter callback exists */}
              <TouchableOpacity
                onPress={() => setShowFilterModal(true)}
                style={filterStyles.filterButton}
              >
                <Ionicons
                  name='filter'
                  size={18}
                  color={
                    activeDistanceFilter !== null &&
                    activeDistanceFilter !== undefined
                      ? branding.primaryColor
                      : currentTheme.gray500
                  }
                />
                {activeDistanceFilter !== null &&
                  activeDistanceFilter !== undefined && (
                    <View
                      style={[
                        filterStyles.filterBadge,
                        { backgroundColor: branding.primaryColor }
                      ]}
                    />
                  )}
              </TouchableOpacity>

              {/* Loading indicator while filtering */}
              {hasDistanceFilterSupport && isFiltering && (
                <ActivityIndicator
                  size='small'
                  color={branding.primaryColor || '#007AFF'}
                  style={{ marginLeft: 8 }}
                />
              )}

              {/* Clear Button - Only visible when there's search text */}
              {props.search && (
                <TouchableOpacity
                  onPress={() => {
                    props.setSearch('')
                  }}
                  style={filterStyles.clearButton}
                >
                  <AntDesign
                    name='closecircleo'
                    size={18}
                    color={currentTheme.fontSecondColor}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={filterStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View
            style={[
              filterStyles.modalContent,
              { backgroundColor: branding.secondaryColor || '#FFFFFF' }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text
              style={[filterStyles.modalTitle, { color: branding.textColor }]}
            >
              Filter by Distance
            </Text>
            {DISTANCE_FILTER_OPTIONS.map((option) => {
              const isSelected = isOptionSelected(option.value)
              return (
                <TouchableOpacity
                  key={option.value !== null ? option.value.toString() : 'all'}
                  style={[
                    filterStyles.filterOption,
                    isSelected && {
                      backgroundColor: branding.primaryColor + '20',
                      borderColor: branding.primaryColor
                    }
                  ]}
                  onPress={() => handleFilterSelect(option.value)}
                >
                  <Text
                    style={[
                      filterStyles.filterOptionText,
                      { color: branding.textColor },
                      isSelected && {
                        color: branding.primaryColor,
                        fontWeight: '600'
                      }
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name='checkmark'
                      size={20}
                      color={branding.primaryColor}
                    />
                  )}
                </TouchableOpacity>
              )
            })}
            <TouchableOpacity
              style={[
                filterStyles.closeButton,
                { backgroundColor: branding.primaryColor }
              ]}
              onPress={() => setShowFilterModal(false)}
            >
              <Text
                style={[filterStyles.closeButtonText, { color: '#FFFFFF' }]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default Search
