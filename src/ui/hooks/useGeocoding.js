import axios from 'axios'
import useEnvVars from '../../../environment'

const useGeocoding = () => {
  const { GOOGLE_MAPS_KEY } = useEnvVars()

  const getAddress = async (latitude, longitude) => {
    try {
      // Validate coordinates
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid coordinates provided')
      }

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}&language=en`
      )
//console.log(latitude, longitude)
      // Check if the response is successful and contains results
      if (
        response.data &&
        response.data.results &&
        response.data.results.length > 0
      ) {
        // Extract the formatted address from the first result
        const formattedAddress = response.data.results[0].formatted_address

        // Extract the city from the address components
        const cityComponent = response.data.results[0].address_components.find(
          (component) =>
            component.types.includes('locality') ||
            component.types.includes('administrative_area_level_2')
        )
        const city = cityComponent ? cityComponent.long_name : null
        return { formattedAddress, city }
      } else {
        throw new Error('No address found for the given coordinates.')
      }
    } catch (error) {
      console.error('Error fetching address:', error.message)
      // Provide more specific error information
      if (error.response) {
        console.error('API Response Error:', error.response.status, error.response.data)
      }
      throw error
    }
  }
  return {getAddress}
}

export default useGeocoding