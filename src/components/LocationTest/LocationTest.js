import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppBranding } from '../../utils/translationHelper';
import { 
  checkDeliveryAvailability, 
  getAddressFromCoordinates,
  isWithinServiceArea,
  TIRUPATTUR_BUS_STAND,
  MAX_DELIVERY_RADIUS 
} from '../../utils/locationUtils';

const LocationTest = () => {
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useAppBranding();
  const [testResults, setTestResults] = useState([]);

  // Test coordinates around Tirupattur Bus Stand
  const testLocations = [
    {
      name: 'Tirupattur Bus Stand (Center)',
      latitude: 12.4962,
      longitude: 78.5696,
      expected: true
    },
    {
      name: 'Near Bus Stand (1km)',
      latitude: 12.5052,
      longitude: 78.5696,
      expected: true
    },
    {
      name: 'Within 5km (3km)',
      latitude: 12.5262,
      longitude: 78.5696,
      expected: true
    },
    {
      name: 'Edge of 5km (4.9km)',
      latitude: 12.5402,
      longitude: 78.5696,
      expected: true
    },
    {
      name: 'Outside 5km (6km)',
      latitude: 12.5562,
      longitude: 78.5696,
      expected: false
    },
    {
      name: 'Far Outside (10km)',
      latitude: 12.5862,
      longitude: 78.5696,
      expected: false
    }
  ];

  const runTests = async () => {
    const results = [];
    
    for (const location of testLocations) {
      try {
        const availability = checkDeliveryAvailability({
          latitude: location.latitude,
          longitude: location.longitude
        });

        const isWithinService = isWithinServiceArea(location.latitude, location.longitude);
        
        // Get address for this location
        const addressInfo = await getAddressFromCoordinates(location.latitude, location.longitude);
        
        results.push({
          name: location.name,
          coordinates: `${location.latitude}, ${location.longitude}`,
          available: availability.available,
          expected: location.expected,
          correct: availability.available === location.expected,
          distance: availability.distance,
          message: availability.message,
          address: addressInfo.success ? addressInfo.address : 'Address not found',
          isWithinService
        });
      } catch (error) {
        results.push({
          name: location.name,
          coordinates: `${location.latitude}, ${location.longitude}`,
          available: false,
          expected: location.expected,
          correct: false,
          distance: null,
          message: 'Error testing location',
          address: 'Error',
          isWithinService: false,
          error: error.message
        });
      }
    }
    
    setTestResults(results);
  };

  const renderTestResult = (result, index) => {
    const isCorrect = result.correct;
    const statusColor = isCorrect ? '#4CAF50' : '#F44336';
    const statusIcon = isCorrect ? 'check-circle' : 'cancel';

    return (
      <View key={index} style={[styles.testResult, { backgroundColor: backgroundColor, borderColor: secondaryColor }]}>
        <View style={styles.testHeader}>
          <Icon name={statusIcon} size={20} color={statusColor} />
          <Text style={[styles.testName, { color: textColor }]}>{result.name}</Text>
        </View>
        
        <Text style={[styles.testCoordinates, { color: textColor }]}>
          Coordinates: {result.coordinates}
        </Text>
        
        <Text style={[styles.testAddress, { color: textColor }]} numberOfLines={2}>
          Address: {result.address}
        </Text>
        
        <View style={styles.testDetails}>
          <Text style={[styles.testDetail, { color: textColor }]}>
            Available: {result.available ? 'Yes' : 'No'} (Expected: {result.expected ? 'Yes' : 'No'})
          </Text>
          <Text style={[styles.testDetail, { color: textColor }]}>
            Distance: {result.distance ? `${result.distance.toFixed(2)}km` : 'N/A'}
          </Text>
          <Text style={[styles.testDetail, { color: textColor }]}>
            Within Service: {result.isWithinService ? 'Yes' : 'No'}
          </Text>
        </View>
        
        <Text style={[styles.testMessage, { color: textColor }]} numberOfLines={2}>
          Message: {result.message}
        </Text>
        
        {result.error && (
          <Text style={[styles.testError, { color: '#F44336' }]}>
            Error: {result.error}
          </Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: backgroundColor }]}>
      <View style={styles.header}>
        <Icon name="location-on" size={24} color={primaryColor} />
        <Text style={[styles.title, { color: textColor }]}>
          OpenStreetMap Location Test
        </Text>
      </View>

      <View style={[styles.infoCard, { backgroundColor: '#E3F2FD', borderColor: '#2196F3' }]}>
        <Icon name="info" size={20} color="#1976D2" />
        <View style={styles.infoContent}>
          <Text style={[styles.infoTitle, { color: '#1976D2' }]}>
            Test Configuration
          </Text>
          <Text style={[styles.infoText, { color: '#1976D2' }]}>
            Center: Tirupattur Bus Stand ({TIRUPATTUR_BUS_STAND.latitude}, {TIRUPATTUR_BUS_STAND.longitude})
          </Text>
          <Text style={[styles.infoText, { color: '#1976D2' }]}>
            Radius: {MAX_DELIVERY_RADIUS}km
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.testButton, { backgroundColor: primaryColor }]}
        onPress={runTests}
      >
        <Icon name="play-arrow" size={20} color="white" />
        <Text style={styles.testButtonText}>Run Location Tests</Text>
      </TouchableOpacity>

      {testResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, { color: textColor }]}>
            Test Results ({testResults.length} locations)
          </Text>
          {testResults.map((result, index) => renderTestResult(result, index))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  testResult: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  testCoordinates: {
    fontSize: 14,
    marginBottom: 4,
  },
  testAddress: {
    fontSize: 14,
    marginBottom: 8,
  },
  testDetails: {
    marginBottom: 8,
  },
  testDetail: {
    fontSize: 14,
    marginBottom: 2,
  },
  testMessage: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  testError: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default LocationTest;
