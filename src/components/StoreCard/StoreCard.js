import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const StoreCard = () => (
  <View style={styles.container}>
    {/* Icon Container (Store Logo or Image) */}
    <View style={styles.iconContainer}>
      <Image source={require('../../assets/images/ItemsList/2.png')} style={styles.icon} />
    </View>

    {/* Content Container (Store Details) */}
    <View style={styles.contentContainer}>
      <Text style={styles.distance}>10+ km From You</Text>
      <Text style={styles.title}>Sk General Store</Text>
      <Text style={styles.price}>Start From $ 0.00</Text>
    </View>

    {/* Heart Icon for Favorite */}
    <TouchableOpacity style={styles.heartContainer}>
      <Image source={require('../../assets/icons/fullHeart.png')} style={styles.heartIcon} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row', // Align items horizontally
    padding: 12,
    alignItems: 'center', // Center the content vertically
    position: 'relative', // Necessary for the absolute positioning of the heart icon
  },
  // Icon Container (Store Image)
  iconContainer: {
    flex: 0.3,
    marginRight: 12,
  },
  icon: {
    width: '100%',
    height: 80,
    borderRadius: 8, // If you want rounded corners for the image
    resizeMode: 'contain',
  },
  // Content Container (Store Details)
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  distance: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 14,
    color: '#008800',
    marginTop: 4,
  },
  // Heart Icon container
  heartContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6347',
    borderRadius: 20,
    padding: 8,
    elevation: 3, // Shadow effect
  },
  heartIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff', // Heart icon color in white
  },
});

export default StoreCard;
