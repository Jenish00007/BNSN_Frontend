import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// CategoryListView component
const PopularProducts = ({ data }) => {
  // Check if data is properly passed
  if (!data) {
    return null;  // If data is undefined or null, return nothing or handle accordingly
  }

  const { index, item } = data;  // Destructure index and item from data

  // Ensure item is defined before rendering
  if (!item) {
    return null;  // If item is undefined, return nothing or handle accordingly
  }

  // Animation refs removed to prevent callback leaks
  // const translateX = useRef(new Animated.Value(50));
  // const opacity = useRef(new Animated.Value(0));
  // const animationRef = useRef(null);

  // Animation effect removed to prevent callback leaks

  return (
    <View style={styles.container}> 
      <Pressable style={{ height: 134, width: 280 }} touchOpacity={0.6}>
        <View style={styles.bgColorView} />
        <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: 'row' }}>
          <View style={{ paddingVertical: 24, paddingLeft: 16 }}>
            <Image
              style={{ flex: 1, borderRadius: 16, aspectRatio: 1.0 }}
              source={{uri:item.logo_full_url}}
            />
          </View>
          <View style={{ flex: 1, paddingLeft: 16, paddingVertical: 16 }}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.lessionCountRatingContainer}>
              <Text style={[styles.textStyle, { flex: 1, fontSize: 12 }]}>
                {item.distance} lesson
              </Text>
              <Text style={styles.textStyle}>{item.rating}</Text>
                <Icon name="star" size={20} color="#00B6F0" />
            </View>
            <View style={{ flexDirection: 'row', paddingRight: 16 }}>
              <Text style={[styles.textStyle, styles.moneyText]}>
                ${item.name}
              </Text>
              <View style={styles.addIconView}>
                  <Icon name="add" size={20} color="white" />
              </View>
            </View>
           
          </View>
        </View>
      </Pressable>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden' },
  bgColorView: {
    flex: 1,
    marginLeft: 48,
    borderRadius: 16,
    backgroundColor: '#F8FAFB',
  },
  title: {
    fontSize: 16,
    fontFamily: 'WorkSans-SemiBold',
    letterSpacing: 0.27,
    color: '#17262A',
  },
  lessionCountRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    paddingBottom: 8,
  },
  textStyle: {
    fontSize: 18,
    fontFamily: 'WorkSans-Regular',
    letterSpacing: 0.27,
    color: '#3A5160',
  },
  moneyText: {
    flex: 1,
    fontFamily: 'WorkSans-SemiBold',
    color: '#00B6F0',
  },
  addIconView: {
    padding: 4,
    backgroundColor: '#00B6F0',
    borderRadius: 8,
  },
});

export default PopularProducts;
