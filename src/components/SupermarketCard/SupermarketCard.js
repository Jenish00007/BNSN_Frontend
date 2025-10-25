// SupermarketCard.js
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useAppBranding } from '../../utils/translationHelper';

export const SupermarketCard = ({ name,
  isNew,
  active,
  address,
  distance,
  logo_full_url }) => {
  const branding = useAppBranding();

  return (
    <View style={[supermarketStyles.container, { backgroundColor: branding.backgroundColor }]}>
      
      <View style={supermarketStyles.header}>
        <View style={supermarketStyles.headerLeft}>
          
          {isNew && (
            <View style={[supermarketStyles.newBadge, { backgroundColor: branding.primaryColor }]}>
              <Text style={[supermarketStyles.newText, { color: branding.textColor }]}>NEW</Text>
            </View>
          )}
          <Image
            source={{ uri: logo_full_url }}
            style={supermarketStyles.logoIcon}
          />
          <Text style={[supermarketStyles.title, { color: branding.textColor }]}>{name}</Text>
        </View>
        <TouchableOpacity>
          <Image
            source={require('../../assets/icons/fullHeart.png')}
            style={supermarketStyles.heartIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={supermarketStyles.addressContainer}>
        <Image
          source={require('../../assets/images/home.png')}
          style={supermarketStyles.locationIcon}
        />
        <Text style={[supermarketStyles.address, { color: branding.textColor }]}>{address}</Text>
      </View>

      <View style={supermarketStyles.footer}>
        <View style={supermarketStyles.footerLeft}>
          <Image
            source={require('../../assets/images/other.png')}
            style={supermarketStyles.distanceIcon}
          />
          <Text style={[supermarketStyles.distance, { color: branding.textColor }]}>{distance}</Text>
        </View>
        {!active && (
          <View style={[supermarketStyles.closedBadge, { backgroundColor: branding.secondaryColor }]}>
            <Text style={[supermarketStyles.closedText, { color: branding.textColor }]}>Closed</Text>
          </View>
        )}
        {active && (
          <View style={[supermarketStyles.closedBadge, { backgroundColor: branding.primaryColor }]}>
            <Text style={[supermarketStyles.closedText, { color: branding.textColor }]}>Open</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const supermarketStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  newBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heartIcon: {
    width: 20,
    height: 20,
  },
  logoIcon: {
    width: 54,
    height: 54,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationIcon: {
    width: 20,
    height: 20,

  },
  address: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceIcon: {
    width: 16,
    height: 16,
    tintColor: 'green',
  },
  distance: {
    fontSize: 12,
  },
  closedBadge: {
    borderRadius: 25,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  closedText: {
    fontSize: 12,
    fontWeight: '600',
  },
});