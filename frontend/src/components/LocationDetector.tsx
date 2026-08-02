'use client'

import { useState, useEffect } from 'react'
import { MapPin, X } from 'lucide-react'

interface LocationData {
  location: string | null
  latitude: number | null
  longitude: number | null
}

export function LocationDetector() {
  const [location, setLocation] = useState<LocationData>({
    location: null,
    latitude: null,
    longitude: null,
  })
  const [loading, setLoading] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualCity, setManualCity] = useState('')

  const storageKey = 'smartfetch_location'
  const latKey = 'smartfetch_lat'
  const lonKey = 'smartfetch_lon'

  useEffect(() => {
    initializeLocation()
  }, [])

  const initializeLocation = () => {
    // Check if location already saved
    if (typeof window !== 'undefined') {
      const savedLocation = localStorage.getItem(storageKey)
      const savedLat = localStorage.getItem(latKey)
      const savedLon = localStorage.getItem(lonKey)

      if (savedLocation) {
        setLocation({
          location: savedLocation,
          latitude: savedLat ? parseFloat(savedLat) : null,
          longitude: savedLon ? parseFloat(savedLon) : null,
        })
      } else {
        requestLocation()
      }
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setShowManualInput(true)
      return
    }

    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => handleLocationSuccess(position),
      (error) => handleLocationError(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleLocationSuccess = async (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords

    try {
      const address = await getAddressFromCoordinates(latitude, longitude)

      // Save to localStorage
      localStorage.setItem(storageKey, address)
      localStorage.setItem(latKey, latitude.toString())
      localStorage.setItem(lonKey, longitude.toString())

      setLocation({
        location: address,
        latitude,
        longitude,
      })
      setLoading(false)
    } catch (error) {
      console.error('Error getting address:', error)
      setShowManualInput(true)
      setLoading(false)
    }
  }

  const handleLocationError = (error: GeolocationPositionError) => {
    console.warn('Geolocation error:', error)
    setShowManualInput(true)
    setLoading(false)
  }

  const getAddressFromCoordinates = async (
    lat: number,
    lon: number
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch address')
      }

      const data = await response.json()
      const address = data.address || {}

      // Extract location components
      const city = address.city || address.town || address.suburb || 'Unknown'
      const state = address.state || ''

      // Format location string
      let locationString = city
      if (state) {
        locationString += `, ${state}`
      }

      return locationString
    } catch (error) {
      console.error('Error converting coordinates to address:', error)
      throw error
    }
  }

  const changeLocation = () => {
    localStorage.removeItem(storageKey)
    localStorage.removeItem(latKey)
    localStorage.removeItem(lonKey)

    setLocation({
      location: null,
      latitude: null,
      longitude: null,
    })
    setShowManualInput(false)
    requestLocation()
  }

  const submitManualLocation = () => {
    if (!manualCity.trim()) {
      alert('Please enter a city name')
      return
    }

    localStorage.setItem(storageKey, manualCity.trim())

    setLocation({
      location: manualCity.trim(),
      latitude: null,
      longitude: null,
    })
    setShowManualInput(false)
    setManualCity('')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
        <MapPin className="w-4 h-4 text-blue-600 animate-pulse" />
        <span className="text-sm text-blue-600">Detecting location...</span>
      </div>
    )
  }

  if (showManualInput) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={manualCity}
          onChange={(e) => setManualCity(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              submitManualLocation()
            }
          }}
          placeholder="Enter city name"
          className="px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={submitManualLocation}
          className="px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Set
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
      <MapPin className="w-4 h-4 text-blue-600" />
      <span className="text-sm text-blue-600 font-medium">{location.location}</span>
      <button
        onClick={changeLocation}
        className="ml-2 p-1 hover:bg-blue-100 rounded transition"
        title="Change location"
      >
        <X className="w-4 h-4 text-blue-600" />
      </button>
    </div>
  )
}
export default LocationDetector;