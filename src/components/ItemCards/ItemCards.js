import React from 'react'
import { Image, Text, View, TouchableOpacity } from 'react-native'
import { scale } from '../../utils/scaling'
import styles from './styles'
import { useContext } from 'react'
import ConfigurationContext from '../../context/Configuration'
import { IMAGE_LINK } from '../../utils/constants'
import TextDefault from '../Text/TextDefault/TextDefault'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { formatNumber } from '../../utils/formatNumber'
import { LinearGradient } from 'expo-linear-gradient';

const ItemCard = ({ item, onPressItem, restaurant, tagCart }) => {
   
const themeContext = useContext(ThemeContext)
const currentTheme = theme[themeContext.ThemeValue]
  const configuration = useContext(ConfigurationContext)
  const handleAddToCart = () => {
    onPressItem({
      ...item,
      restaurant: restaurant._id,
      restaurantName: restaurant.name
    })
  }
  const imageUrl =
    item.image && item.image.trim() !== '' ? item.image : IMAGE_LINK

  // Function to format unit information
  const getUnitDisplay = () => {
    const { weight, unit, quantity, unitCount } = item || {};
    
    // If unitCount is provided, use it with unit
    if (unitCount && unit) {
      return `${unitCount} ${unit}`;
    }
    
    // If quantity is provided, use it with "Pcs"
    if (quantity) {
      return `${quantity} Pcs`;
    }
    
    // If weight is provided, use it
    if (weight) {
      return weight;
    }
    
    // If only unit is provided, use it
    if (unit) {
      return unit;
    }
    
    return null;
  };

  // Function to get unit count specifically for display
  const getUnitCountDisplay = () => {
    const { unitCount, unit } = item || {};
    if (unitCount && unit) {
      return `${unitCount} ${unit}`;
    }
    return null;
  };

  return (
    <TouchableOpacity onPress={handleAddToCart}>
      <LinearGradient style={styles(currentTheme).card} colors={[currentTheme.gray100, currentTheme.white]}>
      
        {tagCart(item._id)}
        <TextDefault
        textColor={currentTheme.gray600}
          style={{         
            fontSize: scale(12),
            fontWeight: '600',
            marginBottom: scale(11)
          }}>
          {item.title}
        </TextDefault>
        
        {/* Unit Count Display */}
        {getUnitCountDisplay() && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: scale(8),
            paddingHorizontal: scale(6),
            paddingVertical: scale(2),
            borderRadius: scale(6),
            alignSelf: 'flex-start',
            backgroundColor: currentTheme.primaryColor || '#F16122',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: scale(10),
              fontWeight: '600',
            }}>
              {getUnitCountDisplay()}
            </Text>
          </View>
        )}
        <View style={{ alignItems: 'center', marginTop: 'auto' }}>
          <Image
            source={{ uri: imageUrl }}
            style={[{ width: 138, height: 120, borderRadius: 8 }, styles().popularMenuImg]}
          />
          <View style={styles().popularMenuPrice}>
            <Text style={{ color: '#1C1C1E', fontSize: scale(12) }}>
              {`${configuration.currencySymbol}${formatNumber(item.variations[0].price)}`}
            </Text>
            {item?.variations[0]?.discounted > 0 && (
              <Text
              style={{
                color: '#9CA3AF',
                fontSize: scale(12),
                textDecorationLine: 'line-through'
              }}>
                {`${configuration?.currencySymbol} ${formatNumber(parseFloat(item?.variations[0]?.price + item?.variations[0]?.discounted).toFixed(0))}`}

            </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

export default ItemCard
