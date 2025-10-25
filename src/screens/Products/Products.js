const styles = StyleSheet.create({
  // ... other styles ...
  addButton: {
    backgroundColor: '#FFE135',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

// In the render section:
<TouchableOpacity 
  onPress={handleAddToCart}
  style={styles.addButton}
>
  <Icon name="add" size={20} color="#000000" />
</TouchableOpacity> 