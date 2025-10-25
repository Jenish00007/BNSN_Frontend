import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { View, Text, StyleSheet } from 'react-native'
import { getCurrentLocation } from '../ui/hooks/useLocation'
import { safeJsonParse } from '../utils/stockUtils'


// Geocoding service with retry logic and fallbacks
const geocodeLocation = async (latitude, longitude, retryCount = 0) => {
  const maxRetries = 3
  const baseDelay = 1000 // 1 second

  // Primary service: Nominatim (OpenStreetMap)
  const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`

  try {
    console.log(`Attempting geocoding (attempt ${retryCount + 1}/${maxRetries + 1})...`)

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'QuixoApp/1.0 (contact@quixo.com)',
        'Accept': 'application/json',
        'Referer': 'https://quixo.com'
      },
      timeout: 10000 // 10 second timeout
    })

    if (response.status === 403) {
      console.warn('Nominatim returned 403 Forbidden - rate limited')
      throw new Error('Rate limited by Nominatim')
    }

    if (response.status === 429) {
      console.warn('Nominatim returned 429 Too Many Requests')
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount) // Exponential backoff
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return geocodeLocation(latitude, longitude, retryCount + 1)
      }
      throw new Error('Rate limited by Nominatim after retries')
    }

    if (response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        if (!data.error) {
          return data
        }
      }
    }

    throw new Error(`Geocoding failed with status: ${response.status}`)

  } catch (error) {
    console.warn(`Geocoding attempt ${retryCount + 1} failed:`, error.message)

    // Try fallback service if primary fails and we haven't exhausted retries
    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount)
      console.log(`Trying fallback service in ${delay}ms...`)

      await new Promise(resolve => setTimeout(resolve, delay))

      try {
        // Fallback: Use a different geocoding service
        const fallbackUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`

        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'QuixoApp/1.0 (contact@quixo.com)',
            'Accept': 'application/json'
          },
          timeout: 8000 // 8 second timeout
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          console.log('Fallback geocoding successful:', fallbackData)
          return fallbackData
        }
      } catch (fallbackError) {
        console.warn('Fallback geocoding also failed:', fallbackError.message)
      }

      // Try again with primary service
      return geocodeLocation(latitude, longitude, retryCount + 1)
    }

    throw error
  }
}

export const LocationContext = createContext()


export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null)
  const [country, setCountry] = useState('IN')
  const [cities, setCities] = useState([])
  const [loadingCountry, setLoadingCountry] = useState(true)
  const [errorCountry, setErrorCountry] = useState('')
  const [zoneId, setZoneId] = useState('[1]')
  const [zoneData, setZoneData] = useState(null)

 


  useEffect(() => {
    const getActiveLocation = async () => {
      try {
        // Always try to get current location first if permissions are available
        const { coords, error } = await getCurrentLocation()

        if (!error && coords) {
          console.log('LocationContext: Got current location:', coords.latitude, coords.longitude)

          const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
          console.log('LocationContext: Geocoding API URL:', apiUrl)

          try {
            const data = await geocodeLocation(coords.latitude, coords.longitude)
            console.log('LocationContext: Geocoding successful:', data)

            let address = ''
            if (data.display_name) {
              // Nominatim response
              address = data.display_name
            } else if (data.localityInfo && data.localityInfo.informative) {
              // BigDataCloud response
              const locality = data.localityInfo.informative[0]
              address = `${locality.name}, ${locality.administrative[1].name}, ${locality.administrative[0].name}`
            } else {
              // Fallback to coordinates
              address = `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`
            }

            if (address.length > 21) {
              address = address.substring(0, 21) + '...'
            }

            const newLocation = {
              label: 'currentLocation',
              latitude: coords.latitude,
              longitude: coords.longitude,
              deliveryAddress: address,
              timestamp: Date.now()
            }
            console.log('LocationContext: Setting current location:', newLocation)
            setLocation(newLocation)
            await AsyncStorage.setItem('location', JSON.stringify(newLocation))
            return

          } catch (geocodingError) {
            console.warn('LocationContext: Geocoding failed:', geocodingError.message)
          }
        } else {
          console.log('LocationContext: Location error:', error?.message)
        }

        // Fallback to stored location if current location fails
        if (error?.message?.includes('permission') || error?.message?.includes('denied')) {
          console.log('Location permission denied, trying stored location')
          const locationStr = await AsyncStorage.getItem('location')
          if (locationStr) {
            try {
              const storedLocation = JSON.parse(locationStr)
              // Check if stored location is recent (within 24 hours)
              const isRecent = storedLocation.timestamp &&
                (Date.now() - storedLocation.timestamp) < (24 * 60 * 60 * 1000)

              if (storedLocation && storedLocation.latitude && storedLocation.longitude && isRecent) {
                console.log('Using recent stored location:', storedLocation)
                setLocation(storedLocation)
                return
              } else {
                console.log('Stored location is old or invalid, clearing it')
                await AsyncStorage.removeItem('location')
              }
            } catch (parseError) {
              console.log('Error parsing stored location:', parseError)
              await AsyncStorage.removeItem('location')
            }
          }

          // Set permission denied indicator but also trigger permission request again
          console.log('Setting location permission denied indicator and requesting permission again')
          setLocation({
            label: 'locationPermissionDenied',
            latitude: 28.6139,
            longitude: 77.2090,
            deliveryAddress: 'Location permission required'
          })

          // Location permission denied - continue with default location
          console.log('Location permission denied - using default location')
        } else {
          // Try stored location for other errors
          const locationStr = await AsyncStorage.getItem('location')
          if (locationStr) {
            try {
              const storedLocation = JSON.parse(locationStr)
              if (storedLocation && storedLocation.latitude && storedLocation.longitude) {
                console.log('Using stored location as fallback:', storedLocation)
                setLocation(storedLocation)
                return
              }
            } catch (parseError) {
              console.log('Error parsing stored location:', parseError)
              await AsyncStorage.removeItem('location')
            }
          }

          // Last resort - set default location
          console.log('Using default location as last resort')
          setLocation({
            label: 'defaultLocation',
            latitude: 28.6139,
            longitude: 77.2090,
            deliveryAddress: 'Delhi, India'
          })
        }
      } catch (err) {
        console.log('Location initialization error:', err)
        // Try stored location as final fallback
        try {
          const storedLocation = await AsyncStorage.getItem('location')
          if (storedLocation) {
            const parsedLocation = JSON.parse(storedLocation)
            if (parsedLocation && parsedLocation.latitude && parsedLocation.longitude) {
              console.log('Using stored location after error:', parsedLocation)
              setLocation(parsedLocation)
              return
            }
          }
        } catch (storageError) {
          console.log('Error parsing stored location:', storageError)
        }

        // Ultimate fallback - default location
        console.log('Using default location after all attempts failed')
        setLocation({
          label: 'defaultLocation',
          latitude: 28.6139,
          longitude: 77.2090,
          deliveryAddress: 'Delhi, India'
        })
      }
    }

    getActiveLocation()
  }, [])

  // Auto-save location when it changes
  useEffect(() => {
    if (location && location.label !== 'locationPermissionDenied' && location.label !== 'defaultLocation') {
      const saveLocation = async () => {
        try {
          await AsyncStorage.setItem('location', JSON.stringify(location))
          console.log('LocationContext: Auto-saved location to storage')
        } catch (error) {
          console.warn('LocationContext: Failed to save location to storage:', error)
        }
      }
      saveLocation()
    }
  }, [location])

  // Fetch country information
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        setLoadingCountry(true)
        const response = await axios.get('https://api.ipify.org/?format=json')
        const data = response.data

        const ipResponse = await axios.get(`https://ipinfo.io/${data.ip}/json`)
        const countryName = ipResponse.data.country
        setCountry(countryName)
      } catch (error) {
        setErrorCountry(error.message)
        console.error('Error fetching user location:', error)
      } finally {
        setLoadingCountry(false)
      }
    }
    fetchCountry()
  }, [])

  useEffect(() => {
    const fetchCities = async () => {
      if (country) {
        try {
          const citiesResponse = await axios.get(`https://api.example.com/cities/${country}`)
          setCities(citiesResponse.data || [])
        } catch (error) {
          console.error('Error fetching cities:', error)
        }
      }
    }

    if (country && !loadingCountry) {
      fetchCities()
    }
  }, [country, loadingCountry])

  const refreshLocation = async () => {
    try {
      console.log('LocationContext: Refreshing location...')
      const { coords, error } = await getCurrentLocation()

      if (!error && coords) {
        console.log('LocationContext: Got current location:', coords.latitude, coords.longitude)

        try {
          const data = await geocodeLocation(coords.latitude, coords.longitude)
          console.log('LocationContext: Geocoding successful during refresh:', data)

          let address = ''
          if (data.display_name) {
            // Nominatim response
            address = data.display_name
          } else if (data.localityInfo && data.localityInfo.informative) {
            // BigDataCloud response
            const locality = data.localityInfo.informative[0]
            address = `${locality.name}, ${locality.administrative[1].name}, ${locality.administrative[0].name}`
          } else {
            // Fallback to coordinates
            address = `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`
          }

          if (address.length > 21) {
            address = address.substring(0, 21) + '...'
          }

          const newLocation = {
            label: 'currentLocation',
            latitude: coords.latitude,
            longitude: coords.longitude,
            deliveryAddress: address,
            timestamp: Date.now()
          }
          console.log('LocationContext: Setting refreshed location:', newLocation)
          setLocation(newLocation)
          // Location successfully obtained
          await AsyncStorage.setItem('location', JSON.stringify(newLocation))
          return newLocation

        } catch (geocodingError) {
          console.warn('LocationContext: Geocoding failed during refresh:', geocodingError.message)
        }
      } else {
        console.warn('LocationContext: Error getting location during refresh:', error?.message)
      }

      return null
    } catch (err) {
      console.log('LocationContext: Error refreshing location:', err)
      return null
    }
  }


  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        refreshLocation,
        cities,
        zoneId,
        zoneData
      }}>
      {children}
    </LocationContext.Provider>
  )
}
