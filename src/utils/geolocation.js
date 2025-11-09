export const toNumber = (value) => {
  if (value === null || value === undefined) return null
  const numeric = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(numeric) ? numeric : null
}

export const isValidCoordinatePair = (latitude, longitude) => {
  const lat = toNumber(latitude)
  const lon = toNumber(longitude)
  if (lat === null || lon === null) return false
  if (lat < -90 || lat > 90) return false
  if (lon < -180 || lon > 180) return false
  return true
}

export const combineAddressParts = (parts) =>
  parts
    .filter(Boolean)
    .map((part) => part.toString().trim())
    .filter((part) => part.length > 0)
    .join(', ')

export const extractCoordinatesFromEntity = (entity) => {
  if (!entity || typeof entity !== 'object') return null

  if (isValidCoordinatePair(entity.latitude, entity.longitude)) {
    return {
      latitude: toNumber(entity.latitude),
      longitude: toNumber(entity.longitude)
    }
  }

  if (isValidCoordinatePair(entity.lat, entity.lon)) {
    return {
      latitude: toNumber(entity.lat),
      longitude: toNumber(entity.lon)
    }
  }

  if (isValidCoordinatePair(entity.lat, entity.lng)) {
    return {
      latitude: toNumber(entity.lat),
      longitude: toNumber(entity.lng)
    }
  }

  if (
    entity.location &&
    Array.isArray(entity.location.coordinates) &&
    entity.location.coordinates.length >= 2
  ) {
    const [longitude, latitude] = entity.location.coordinates
    if (isValidCoordinatePair(latitude, longitude)) {
      return {
        latitude: toNumber(latitude),
        longitude: toNumber(longitude)
      }
    }
  }

  if (
    entity.location &&
    Array.isArray(entity.location.coordinate) &&
    entity.location.coordinate.length >= 2
  ) {
    const [longitude, latitude] = entity.location.coordinate
    if (isValidCoordinatePair(latitude, longitude)) {
      return {
        latitude: toNumber(latitude),
        longitude: toNumber(longitude)
      }
    }
  }

  if (entity.lastKnownLocation) {
    return extractCoordinatesFromEntity(entity.lastKnownLocation)
  }

  if (entity.address) {
    return extractCoordinatesFromEntity(entity.address)
  }

  if (Array.isArray(entity.addresses)) {
    for (const entry of entity.addresses) {
      const coords = extractCoordinatesFromEntity(entry)
      if (coords) return coords
    }
  }

  return null
}

export const extractAddressFromEntity = (entity) => {
  if (!entity || typeof entity !== 'object') return null

  if (typeof entity.address === 'string' && entity.address.trim()) {
    return entity.address.trim()
  }

  if (entity.lastKnownLocation?.address) {
    return entity.lastKnownLocation.address
  }

  if (entity.deliveryAddress) {
    if (typeof entity.deliveryAddress === 'string') {
      return entity.deliveryAddress.trim()
    }
    if (typeof entity.deliveryAddress === 'object') {
      return extractAddressFromEntity(entity.deliveryAddress)
    }
  }

  if (
    entity.address1 ||
    entity.address2 ||
    entity.city ||
    entity.state ||
    entity.country
  ) {
    const combined = combineAddressParts([
      entity.address1,
      entity.address2,
      entity.city,
      entity.state,
      entity.country,
      entity.zipCode ?? entity.postalCode ?? entity.zip
    ])
    if (combined.length > 0) {
      return combined
    }
  }

  if (Array.isArray(entity.addresses)) {
    for (const entry of entity.addresses) {
      const address = extractAddressFromEntity(entry)
      if (address) return address
    }
  }

  return null
}

export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const latitude1 = toNumber(lat1)
  const longitude1 = toNumber(lon1)
  const latitude2 = toNumber(lat2)
  const longitude2 = toNumber(lon2)

  if (
    latitude1 === null ||
    longitude1 === null ||
    latitude2 === null ||
    longitude2 === null
  ) {
    return null
  }

  const toRadians = (value) => (value * Math.PI) / 180
  const earthRadiusKm = 6371

  const dLat = toRadians(latitude2 - latitude1)
  const dLon = toRadians(longitude2 - longitude1)
  const lat1Rad = toRadians(latitude1)
  const lat2Rad = toRadians(latitude2)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = earthRadiusKm * c
  if (!Number.isFinite(distance)) return null

  return Number(distance.toFixed(2))
}

export const formatDistanceKm = (distance) => {
  if (typeof distance !== 'number' || Number.isNaN(distance)) return null
  return `${distance.toFixed(distance < 10 ? 1 : 0)} km`
}

export const getSellerCoordinates = (product, sellerUser) => {
  if (product?.shop) {
    const coords = extractCoordinatesFromEntity(product.shop)
    if (coords) return coords
  }

  if (sellerUser) {
    const coords = extractCoordinatesFromEntity(sellerUser)
    if (coords) return coords
  }

  if (product?.location) {
    const coords = extractCoordinatesFromEntity(product.location)
    if (coords) return coords
  }

  return null
}

export const getSellerAddress = (product, sellerUser) => {
  if (product?.shop?.address) return product.shop.address
  if (sellerUser) {
    const address = extractAddressFromEntity(sellerUser)
    if (address) return address
  }
  if (product?.shop) {
    const address = extractAddressFromEntity(product.shop)
    if (address) return address
  }
  if (product?.address) return product.address
  if (typeof product?.location === 'string') return product.location
  return null
}
