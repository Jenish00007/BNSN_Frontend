import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppBranding } from '../../utils/translationHelper';
import { searchPlaces, getAddressFromCoordinates, isWithinServiceArea } from '../../utils/locationUtils';

const LocationPicker = ({ 
  onLocationSelect, 
  currentLocation, 
  placeholder = "Search for your location...",
  showServiceAreaWarning = true 
}) => {
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useAppBranding();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation(currentLocation);
    }
  }, [currentLocation]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPlaces(query, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = async (location) => {
    try {
      const addressInfo = await getAddressFromCoordinates(location.lat, location.lon);
      
      const locationData = {
        latitude: location.lat,
        longitude: location.lon,
        address: location.display_name,
        deliveryAddress: location.display_name,
        label: 'selectedLocation'
      };

      setSelectedLocation(locationData);
      setSearchQuery('');
      setSearchResults([]);
      
      if (onLocationSelect) {
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Location selection error:', error);
      Alert.alert('Error', 'Failed to select location. Please try again.');
    }
  };

  const renderSearchResult = ({ item }) => {
    const isWithinService = isWithinServiceArea(item.lat, item.lon);
    
    return (
      <TouchableOpacity
        style={[
          styles.searchResult,
          { 
            backgroundColor: backgroundColor,
            borderColor: secondaryColor 
          }
        ]}
        onPress={() => handleLocationSelect(item)}
      >
        <View style={styles.resultContent}>
          <Icon 
            name="location-on" 
            size={20} 
            color={primaryColor} 
            style={styles.locationIcon}
          />
          <View style={styles.resultText}>
            <Text style={[styles.resultTitle, { color: textColor }]} numberOfLines={2}>
              {item.display_name}
            </Text>
            {showServiceAreaWarning && (
              <View style={styles.serviceAreaIndicator}>
                <Icon 
                  name={isWithinService ? "check-circle" : "cancel"} 
                  size={14} 
                  color={isWithinService ? '#4CAF50' : '#F44336'} 
                />
                <Text style={[
                  styles.serviceAreaText,
                  { color: isWithinService ? '#4CAF50' : '#F44336' }
                ]}>
                  {isWithinService ? 'Within delivery area' : 'Outside delivery area'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: backgroundColor, borderColor: secondaryColor }]}>
        <Icon name="search" size={20} color={textColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={textColor}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearch(text);
          }}
        />
        {isSearching && (
          <ActivityIndicator size="small" color={primaryColor} style={styles.loadingIcon} />
        )}
      </View>

      {/* Selected Location Display */}
      {selectedLocation && (
        <View style={[styles.selectedLocation, { backgroundColor: '#E8F5E8', borderColor: '#4CAF50' }]}>
          <Icon name="check-circle" size={16} color="#4CAF50" />
          <Text style={[styles.selectedLocationText, { color: '#2E7D32' }]} numberOfLines={2}>
            {selectedLocation.deliveryAddress}
          </Text>
        </View>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={[styles.resultsContainer, { backgroundColor: backgroundColor }]}>
          <Text style={[styles.resultsTitle, { color: textColor }]}>
            Search Results
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.place_id.toString()}
            style={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Service Area Information */}
      {showServiceAreaWarning && (
        <View style={[styles.serviceAreaInfo, { backgroundColor: '#FFF3CD', borderColor: '#FFEAA7' }]}>
          <Icon name="info" size={16} color="#856404" />
          <Text style={[styles.serviceAreaInfoText, { color: '#856404' }]}>
            We deliver within 5km of Tirupattur Bus Stand
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  selectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  selectedLocationText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  resultsContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 300,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultsList: {
    maxHeight: 250,
  },
  searchResult: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  locationIcon: {
    marginRight: 12,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  serviceAreaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceAreaText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  serviceAreaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  serviceAreaInfoText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});

export default LocationPicker;
