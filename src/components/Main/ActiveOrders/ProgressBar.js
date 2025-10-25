import React from 'react'
import { View } from 'react-native'
import { scale } from '../../../utils/scaling'
import { useSubscription } from '@apollo/client'
import { subscriptionOrder } from '../../../apollo/subscriptions'
import gql from 'graphql-tag'
import { ORDER_STATUS_ENUM } from '../../../utils/enums'

export const orderStatuses = [
  {
    key: 'PENDING',
    status: 1,
    statusText: 'pendingOrder'
  },
  {
    key: 'ACCEPTED',
    status: 2,
    statusText: 'acceptedOrder'
  },
  {
    key: 'ASSIGNED',
    status: 3,
    statusText: 'assignedOrder'
  },
  {
    key: 'PICKED',
    status: 4,
    statusText: 'pickedOrder'
  },
  {
    key: 'DELIVERED',
    status: 5,
    statusText: 'deliveredOrder'
  },
  {
    key: 'COMPLETED',
    status: 6,
    statusText: 'completedOrder'
  },
  {
    key: 'CANCELLED',
    status: 6,
    statusText: 'cancelledOrder'
  }
]

export const checkStatus = status => {
  if (!status) return orderStatuses[0] // Return pending status as default
  const obj = orderStatuses.filter(x => {
    return x.key === status.toUpperCase()
  })
  return obj[0] || orderStatuses[0] // Return pending status if no match found
}

export const ProgressBar = ({ currentTheme, item, customWidth, orderStatus }) => {
  // Get status from either item.orderStatus or orderStatus prop
  const status = item?.orderStatus || orderStatus

  // Return null if status is cancelled or undefined
  if (!status || status === ORDER_STATUS_ENUM.CANCELLED) return null

  // Subscribe to order updates if we have an item with _id
  if (item?._id) {
    useSubscription(
      gql`
        ${subscriptionOrder}
      `,
      { variables: { id: item._id } }
    )
  }

  const defaultWidth = scale(50)
  const width = customWidth !== undefined ? customWidth : defaultWidth

  // Get the current status object
  const currentStatus = checkStatus(status)

  return (
    <View style={{ marginTop: scale(10) }}>
      <View style={{ flexDirection: 'row' }}>
        {Array(currentStatus.status)
          .fill(0)
          .map((_, index) => (
            <View
              key={`active-${index}`}
              style={{
                height: scale(4),
                backgroundColor: currentTheme.primary,
                width: width,
                marginRight: scale(10)
              }}
            />
          ))}
        {Array(4 - currentStatus.status)
          .fill(0)
          .map((_, index) => (
            <View
              key={`inactive-${index}`}
              style={{
                height: scale(4),
                backgroundColor: currentTheme.gray200,
                width: width,
                marginRight: scale(10)
              }}
            />
          ))}
      </View>
    </View>
  )
}
