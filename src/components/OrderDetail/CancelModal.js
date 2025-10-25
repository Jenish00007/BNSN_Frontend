import React, { useState, useEffect, useContext } from 'react'
import { View, Modal, Pressable, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import TextDefault from '../Text/TextDefault/TextDefault'
import Button from '../Button/Button'
import styles from './styles'
import { alignment } from '../../utils/alignment'
import { scale } from '../../utils/scaling'
import { ORDER_STATUS_ENUM } from '../../utils/enums'
import { useTranslation } from 'react-i18next'
import { RadioButton } from '../RadioButton/RadioButton'
import AuthContext from '../../context/Auth'
import { API_URL } from '../../config/api'

export const CancelModal = ({
  theme,
  modalVisible,
  setModalVisible,
  cancelOrder,
  loading,
  orderStatus,
  orderId
}) => {
  const { t } = useTranslation()
  const [reasons, setReasons] = useState([])
  const [selectedReason, setSelectedReason] = useState(null)
  const [loadingReasons, setLoadingReasons] = useState(false)
  const { token } = useContext(AuthContext)

  useEffect(() => {
    if (modalVisible) {
      fetchCancellationReasons()
    } else {
      // Reset state when modal closes
      setSelectedReason(null)
      setReasons([])
    }
  }, [modalVisible])

  const fetchCancellationReasons = async () => {
    try {
      setLoadingReasons(true)
      
      // Default cancellation reasons as fallback
      const defaultReasons = [
        { id: 1, reason: 'Changed my mind' },
        { id: 2, reason: 'Found better alternative' },
        { id: 3, reason: 'Delivery time too long' },
        { id: 4, reason: 'Order placed by mistake' },
        { id: 5, reason: 'Price too high' },
        { id: 6, reason: 'Other' }
      ]

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json'
      }

      try {
        const response = await fetch(
          `${API_URL}/order/cancellation-reasons`,
          {
            method: 'GET',
            headers: headers
          }
        )

        if (response && response.ok) {
          const data = await response.json()
          
          if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
            setReasons(data.data)
            return
          }
        }
      } catch (apiError) {
        console.warn('API call failed, using default reasons:', apiError)
      }

      // Use default reasons if API fails
      setReasons(defaultReasons)

    } catch (error) {
      console.error('Error fetching cancellation reasons:', error)
      // Set default reasons even if there's an error
      setReasons([
        { id: 1, reason: 'Changed my mind' },
        { id: 2, reason: 'Found better alternative' },
        { id: 3, reason: 'Delivery time too long' },
        { id: 4, reason: 'Order placed by mistake' },
        { id: 5, reason: 'Price too high' },
        { id: 6, reason: 'Other' }
      ])
    } finally {
      setLoadingReasons(false)
    }
  }

  const handleCancelOrder = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for cancellation')
      return
    }
    cancelOrder(selectedReason.reason)
  }

  const closeModal = () => {
    if (!loading && !loadingReasons) {
      setModalVisible()
    }
  }

  return (
    <Modal animationType="slide" visible={modalVisible} transparent={true}>
      <Pressable style={styles.container(theme)} onPress={closeModal}>
        <Pressable style={styles.modalContainer(theme)} onPress={e => e.stopPropagation()}>
          <View style={{ ...alignment.MBsmall }}>
            <TextDefault H4 bolder textColor={theme.gray900}>
              {t('selectCancellationReasons')}
            </TextDefault>
          </View>

          {loadingReasons ? (
            <View style={{ marginVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : reasons.length > 0 ? (
            <View style={{ marginVertical: 20 }}>
              {reasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 10,
                    paddingVertical: 5
                  }}
                  onPress={() => setSelectedReason(reason)}
                  disabled={loading}
                >
                  <RadioButton
                    selected={selectedReason?.id === reason.id}
                    onPress={() => setSelectedReason(reason)}
                    color={theme.primary}
                    disabled={loading}
                  />
                  <TextDefault
                    style={{ marginLeft: 10, flex: 1 }}
                    H5
                    textColor={loading ? theme.gray400 : theme.gray500}
                  >
                    {reason.reason}
                  </TextDefault>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ marginVertical: 20, alignItems: 'center' }}>
              <TextDefault H5 textColor={theme.gray500}>
                No cancellation reasons available
              </TextDefault>
              <TouchableOpacity
                style={{
                  marginTop: scale(16),
                  paddingHorizontal: scale(20),
                  paddingVertical: scale(12),
                  backgroundColor: theme.red600,
                  borderRadius: scale(8)
                }}
                onPress={() => {
                  // Allow cancellation with default reason
                  cancelOrder('Other')
                }}
                disabled={loading}
              >
                <TextDefault textColor={theme.white}>
                  Cancel Anyway
                </TextDefault>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ ...alignment.MTlarge }}>
              <Button
                text={loading ? t('cancelling') : t('submit')}
                buttonProps={{
                  onPress: handleCancelOrder,
                  disabled: loading || !selectedReason
                }}
                buttonStyles={[
                  styles.cancelButtonContainer(theme),
                  {
                    backgroundColor: theme.red600,
                    opacity: loading || !selectedReason ? 0.7 : 1
                  }
                ]}
                textProps={{ textColor: theme.white }}
                textStyles={{ ...alignment.Pmedium }}
                loading={loading}
              />
            </View>
            <View style={{ ...alignment.MTsmall }}>
              <Button
                text={t('cancel')}
                buttonProps={{ 
                  onPress: closeModal,
                  disabled: loading 
                }}
                buttonStyles={[
                  styles.dismissButtonContainer(theme),
                  loading && { opacity: 0.7 }
                ]}
                textStyles={{
                  ...alignment.Pmedium,
                  color: theme.newIconColor
                }}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
