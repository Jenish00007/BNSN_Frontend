// components/HighlightCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from './commonStyles'; // Import common styles
import Icon from 'react-native-vector-icons/FontAwesome';


export const HighlightCard = () => (
    <View style={styles.container}>
      <Text style={styles.title}>BREATHE BETTER,</Text>
      <Text style={styles.subtitle}>WORK BETTER</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Now $50 Off!</Text>
      </TouchableOpacity>
      <View style={styles.ratingContainer}>
        <Text style={styles.rating}>0.0 (0)</Text>
      </View>
      <Text style={styles.description}>Refresh Your Workspace</Text>
      <Text style={styles.subDescription}>Save $50 on our best-selling air fresheners.</Text>
    </View>
  );
  

export default HighlightCard;
