import React, { useState, useEffect, useContext, useMemo } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import Products from '../../components/Products/Products'
import { API_URL } from '../../config/api'
import { useAppBranding } from '../../utils/translationHelper'
import { LocationContext } from '../../context/Location'
import Search from '../../components/Main/Search/Search'
import {
  calculateDistanceKm,
  getSellerCoordinates
} from '../../utils/geolocation'

function SearchPage() {
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [resultsWithDistance, setResultsWithDistance] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [computingDistances, setComputingDistances] = useState(false)
  const [error, setError] = useState(null)
  const [distanceFilterKm, setDistanceFilterKm] = useState(null)
  const [sellerCache, setSellerCache] = useState({})
  const moduleId = 1
  const branding = useAppBranding()
  const { location } = useContext(LocationContext)

  const fetchSearchResults = async (text) => {
    if (text.trim() === '') {
      setSearchResults([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const itemUrl = `${API_URL}/search/products?keyword=${encodeURIComponent(text)}&sortBy=name&sortOrder=asc&page=1&limit=50`

      const response = await fetch(itemUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          zoneId: '[1]',
          moduleId: moduleId.toString()
        }
      })

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        )
      }

      const json = await response.json()

      if (json?.success && Array.isArray(json?.products)) {
        setSearchResults(json.products)
        setError(null)
      } else {
        setSearchResults([])
        setError('No products found')
      }
    } catch (error) {
      console.error('Error fetching search results:', error)
      setError(error.message || 'Failed to fetch search results')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch seller user info if needed
  const fetchSellerUser = async (userId) => {
    if (!userId || sellerCache[userId]) {
      return sellerCache[userId] || null
    }

    try {
      const response = await fetch(`${API_URL}/user/user-info/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setSellerCache((prev) => ({ ...prev, [userId]: data.user }))
          return data.user
        }
      }
    } catch (error) {
      console.error('Error fetching seller user:', error)
    }
    return null
  }

  const enhanceResultsWithDistance = async (products) => {
    if (!products.length) {
      setResultsWithDistance([])
      return
    }

    setComputingDistances(true)

    const buyerCoords =
      location && location.latitude && location.longitude
        ? { latitude: location.latitude, longitude: location.longitude }
        : null

    const enhanced = await Promise.all(
      products.map(async (product) => {
        let sellerUser = null
        if (product.userId && !product.shop) {
          sellerUser = await fetchSellerUser(product.userId)
        }

        let distanceKm = null
        if (buyerCoords) {
          const sellerCoords = getSellerCoordinates(product, sellerUser)
          if (sellerCoords) {
            distanceKm = calculateDistanceKm(
              buyerCoords.latitude,
              buyerCoords.longitude,
              sellerCoords.latitude,
              sellerCoords.longitude
            )
          }
        }

        return {
          ...product,
          distanceKm,
          distanceLabel:
            typeof distanceKm === 'number'
              ? `${distanceKm.toFixed(1)} km away`
              : 'N/A'
        }
      })
    )

    setResultsWithDistance(enhanced)
    setComputingDistances(false)
  }

  useEffect(() => {
    enhanceResultsWithDistance(searchResults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults, location])

  // Apply distance filter to search results
  useEffect(() => {
    if (
      distanceFilterKm === null ||
      distanceFilterKm === undefined ||
      distanceFilterKm === 'all'
    ) {
      setFilteredResults(resultsWithDistance)
      return
    }

    const filtered = resultsWithDistance.filter(
      (item) =>
        item.distanceKm !== null && item.distanceKm <= Number(distanceFilterKm)
    )

    setFilteredResults(filtered)
  }, [resultsWithDistance, distanceFilterKm])

  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim()) {
        fetchSearchResults(searchText)
      } else {
        setSearchResults([])
        setError(null)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchText])

  const activeResults = useMemo(() => {
    if (distanceFilterKm === null || distanceFilterKm === undefined) {
      return resultsWithDistance
    }
    return filteredResults
  }, [resultsWithDistance, filteredResults, distanceFilterKm])

  // Display number of results
  const renderResultCount = () => {
    const count = activeResults.length
    const totalCount = resultsWithDistance.length
    return (
      <View style={styles.resultCountContainer}>
        <Text style={[styles.resultCount, { color: branding.primaryColor }]}>
          {count} {count === 1 ? 'result' : 'results'} found
        </Text>
        {distanceFilterKm && totalCount > count && (
          <Text style={[styles.filterHint, { color: branding.textColor }]}>
            ({totalCount} total, filtered by {distanceFilterKm} km)
          </Text>
        )}
        {distanceFilterKm && !location?.latitude && (
          <Text style={[styles.filterHint, { color: '#FF3B30' }]}>
            Location unavailable - enable location to filter by distance
          </Text>
        )}
      </View>
    )
  }

  return (
    <View
      style={[styles.container, { backgroundColor: branding.backgroundColor }]}
    >
      {/* Search bar with filter */}
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: branding.primaryColor }
        ]}
      >
        <Search
          setSearch={setSearchText}
          search={searchText}
          newheaderColor={branding.primaryColor}
          placeHolder='Search for items...'
          distanceFilter={distanceFilterKm}
          onDistanceFilterChange={setDistanceFilterKm}
          isFilteringByDistance={computingDistances}
        />
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={branding.primaryColor} />
        </View>
      )}
      {computingDistances && !loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='small' color={branding.primaryColor} />
          <Text style={[styles.filterHint, { color: branding.textColor }]}>
            Calculating distances...
          </Text>
        </View>
      )}

      {/* Error message */}
      {error && !loading && (
        <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
      )}

      {/* Results count */}
      {resultsWithDistance.length > 0 && !loading && renderResultCount()}

      {!loading && (
        <FlatList
          data={activeResults}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <Products item={item} />}
          keyExtractor={(item) =>
            (item._id || item.id || Math.random()).toString()
          }
          ListEmptyComponent={
            searchText.trim() !== '' && !error ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.noResults, { color: branding.textColor }]}>
                  No results found
                </Text>
                {distanceFilterKm && searchResults.length > 0 && (
                  <Text
                    style={[styles.filterHint, { color: branding.textColor }]}
                  >
                    Try adjusting the distance filter
                  </Text>
                )}
              </View>
            ) : null
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 45
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 45
  },
  clearButton: {
    padding: 5
  },
  clearText: {
    fontSize: 16
  },
  resultCountContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  resultCount: {
    fontSize: 16,
    fontWeight: '600'
  },
  filterHint: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    padding: 10
  }
})

export default SearchPage
