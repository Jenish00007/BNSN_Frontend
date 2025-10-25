import React, { useContext, useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { theme } from '../../utils/themeColors';
import TextDefault from '../Text/TextDefault/TextDefault';
import TextError from '../Text/TextError/TextError';
import { alignment } from '../../utils/alignment';
import { scale } from '../../utils/scaling';
import { useTranslation } from 'react-i18next';
import ConfigurationContext from '../../context/Configuration';
import { calulateRemainingTime } from '../../utils/customFunctions';
import Spinner from '../Spinner/Spinner';
import EmptyView from '../EmptyView/EmptyView';
import AuthContext from '../../context/Auth';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppBranding } from '../../utils/translationHelper';

const ActiveOrders = ({ navigation, activeOrders, loading, error, reFetchOrders }) => {
  const { t } = useTranslation();
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const configuration = useContext(ConfigurationContext);
  const { token } = useContext(AuthContext);
  const branding = useAppBranding();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: t('myOrders'),
      headerTitleStyle: { 
        color: branding.textColor,
        fontSize: scale(18),
        fontWeight: '600'
      },
      headerStyle: { 
        backgroundColor: branding.headerColor,
        elevation: 0,
        shadowOpacity: 0
      },
      headerTintColor: branding.textColor,
      headerTitleAlign: 'center'
    });
  }, [navigation, branding, t]);

  const emptyView = () => {
    return (
      <EmptyView
        title={t('titleEmptyActiveOrders')}
        description={t('emptyActiveOrdersDesc')}
        buttonText={t('emptyActiveOrdersBtn')}
      />
    );
  };

  const renderItem = ({ item }) => {
    return (
      <OrderCard
        item={item}
        navigation={navigation}
        branding={branding}
        configuration={configuration}
      />
    );
  };

  if (loading && (!activeOrders || activeOrders.length === 0)) {
    return (
      <Spinner
        size={'small'}
        backColor={branding.backgroundColor}
        spinnerColor={branding.primaryColor}
      />
    );
  }
  if (error) return <TextError text={error} />;

  return (
    <View style={[styles.container, {backgroundColor: branding.backgroundColor}]}>
      <StatusBar
        backgroundColor={branding.headerColor}
        barStyle="dark-content"
        translucent={false}
        animated={true}
      />
      <FlatList
        data={activeOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item?._id?.toString()}
        ListEmptyComponent={emptyView}
        onRefresh={reFetchOrders}
        refreshing={loading}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const OrderCard = ({ item, navigation, branding, configuration }) => {
  const { t } = useTranslation();
  
  if (!item) return null;
  
  const orderId = item._id;
  const date = new Date(item.createdAt);
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  
  const orderStatus = item.status?.toUpperCase() || 'PENDING';
  
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return branding.primaryColor;
      case 'confirmed':
        return branding.primaryColor;
      case 'preparing':
        return branding.primaryColor;
      case 'ready':
        return branding.primaryColor;
      case 'delivered':
        return branding.primaryColor;
      case 'cancelled':
        return '#F44336';
      default:
        return branding.primaryColor;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.cardContainer, {
        backgroundColor: branding.secondaryColor,
        borderLeftWidth: 4,
        borderLeftColor: branding.primaryColor
      }]}
      onPress={() => navigation.navigate('OrderDetail', { id: item._id })}>
      <View style={styles.cardHeader}>
        <View style={styles.orderInfoContainer}>
          <View style={styles.orderIdContainer}>
            <TextDefault textColor={branding.textColor} bold H4>
              {`Order #${orderId.slice(-6)}`}
            </TextDefault>
            <View style={[styles.statusBadge, {backgroundColor: getStatusColor(orderStatus)}]}>
              <TextDefault small textColor="#FFFFFF" bold>
                {orderStatus}
              </TextDefault>
            </View>
          </View>
          <TextDefault small textColor={branding.textColor} style={styles.dateText}>
            {formattedDate}
          </TextDefault>
        </View>
      </View>

      <View style={styles.orderDetails}>
        
        
        <View style={styles.priceContainer}>
          <TextDefault textColor={branding.textColor} bold H4>
            {`Total: ₹${item.totalPrice?.toFixed(2)}`}
          </TextDefault>
        </View>

        <View style={styles.addressContainer}>
          <View style={styles.addressIcon}>
            <Icon name="location-on" size={18} color={branding.primaryColor} />
          </View>
          <TextDefault small textColor={branding.textColor} style={styles.addressText}>
            {item.shippingAddress?.address ? 
              `${item.shippingAddress?.address}, ${item.shippingAddress?.city || ''}, ${item.shippingAddress?.state || ''} - ${item.shippingAddress?.pincode || ''}` :
              'Address not available'
            }
          </TextDefault>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: scale(10),
  },
  cardContainer: {
    marginBottom: scale(12),
    borderRadius: scale(12),
    padding: scale(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    marginBottom: scale(12),
  },
  orderInfoContainer: {
    flex: 1,
  },
  orderIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  statusBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(12),
  },
  dateText: {
    marginTop: scale(2),
  },
  orderDetails: {
    marginTop: scale(8),
  },
  itemsContainer: {
    marginBottom: scale(12),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
    paddingVertical: scale(4),
  },
  itemInfo: {
    flex: 1,
    marginRight: scale(8),
  },
  itemQuantity: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(4),
  },
  priceContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    paddingTop: scale(12),
    marginBottom: scale(12),
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    paddingTop: scale(12),
  },
  addressIcon: {
    marginRight: scale(8),
    marginTop: scale(2),
  },
  addressText: {
    flex: 1,
  },
});

export default ActiveOrders;