import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Products from "../../components/Products/Products";
import { API_URL } from "../../config/api";
import { useAppBranding } from "../../utils/translationHelper";

function SearchPage() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const moduleId = 1;
  const branding = useAppBranding();

  const fetchSearchResults = async (text) => {
    if (text.trim() === "") {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const itemUrl = `${API_URL}/search/products?keyword=${encodeURIComponent(text)}&sortBy=name&sortOrder=asc&page=1&limit=50`;
      console.log('Fetching from URL:', itemUrl); // Debug log

      const response = await fetch(itemUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'zoneId': '[1]',
          'moduleId': moduleId.toString(),
        },
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      console.log('Response data:', json); // Debug log

      if (json?.success && Array.isArray(json?.products)) {
        setSearchResults(json.products);
        setError(null);
      } else {
        setSearchResults([]);
        setError('No products found');
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError(error.message || 'Failed to fetch search results');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim()) {
        fetchSearchResults(searchText);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchText]);

  // Display number of results
  const renderResultCount = () => {
    const count = searchResults.length;
    return (
      <Text style={[styles.resultCount, { color: branding.primaryColor }]}>
        {count} {count === 1 ? 'result' : 'results'} found
      </Text>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
      {/* Search bar */}
      <View style={[styles.headerContainer, { backgroundColor: branding.secondaryColor }]}>
        <View style={[styles.searchBarContainer, { backgroundColor: branding.backgroundColor }]}>
          <Icon name="search" size={22} color={branding.textColor} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: branding.textColor }]}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for items..."
            placeholderTextColor={branding.textColor}
          />
          {searchText !== "" && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchText("");
                setSearchResults([]);
                setError(null);
              }}
            >
              <Text style={[styles.clearText, { color: branding.textColor }]}>✖</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={branding.primaryColor} />
        </View>
      )}

      {/* Error message */}
      {error && !loading && (
        <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
      )}

      {/* Results count */}
      {searchResults.length > 0 && !loading && renderResultCount()}
      
      {!loading && (
        <FlatList
          data={searchResults}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <Products item={item} />}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            searchText.trim() !== "" && !error ? (
              <Text style={[styles.noResults, { color: branding.textColor }]}>No results found</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 45,
  },
  clearButton: {
    padding: 5,
  },
  clearText: {
    fontSize: 16,
  },
  resultCount: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  noResults: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
  },
});

export default SearchPage;
