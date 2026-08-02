/**
 * SmartFetch Location Detection System
 * Detects user location using Geolocation API and converts to address
 * Saves location data in localStorage for future use
 */

class LocationManager {
  constructor() {
    this.storageKey = 'smartfetch_location'
    this.latKey = 'smartfetch_lat'
    this.lonKey = 'smartfetch_lon'
    this.locationElement = document.getElementById('user-location')
    this.init()
  }

  /**
   * Initialize location detection on page load
   */
  init() {
    // Check if location already saved
    const savedLocation = localStorage.getItem(this.storageKey)
    
    if (savedLocation) {
      // Display saved location
      this.displayLocation(savedLocation)
    } else {
      // Request location permission
      this.requestLocation()
    }
  }

  /**
   * Request user's location using Geolocation API
   */
  requestLocation() {
    if (!navigator.geolocation) {
      this.showManualInput('Geolocation not supported')
      return
    }

    // Show loading state
    this.showLoading()

    navigator.geolocation.getCurrentPosition(
      (position) => this.handleLocationSuccess(position),
      (error) => this.handleLocationError(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  /**
   * Handle successful location retrieval
   */
  async handleLocationSuccess(position) {
    const { latitude, longitude } = position.coords

    try {
      // Convert coordinates to address
      const address = await this.getAddressFromCoordinates(latitude, longitude)
      
      // Save location data
      localStorage.setItem(this.storageKey, address)
      localStorage.setItem(this.latKey, latitude.toString())
      localStorage.setItem(this.lonKey, longitude.toString())

      // Display location
      this.displayLocation(address)
    } catch (error) {
      console.error('Error getting address:', error)
      this.showManualInput('Could not detect location')
    }
  }

  /**
   * Handle location request error
   */
  handleLocationError(error) {
    console.warn('Geolocation error:', error)
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.showManualInput('Location permission denied')
        break
      case error.POSITION_UNAVAILABLE:
        this.showManualInput('Location unavailable')
        break
      case error.TIMEOUT:
        this.showManualInput('Location request timeout')
        break
      default:
        this.showManualInput('Could not detect location')
    }
  }

  /**
   * Convert latitude and longitude to address using Nominatim API
   */
  async getAddressFromCoordinates(lat, lon) {
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
      const postcode = address.postcode || ''

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

  /**
   * Display location in navbar
   */
  displayLocation(location) {
    if (!this.locationElement) {
      console.warn('Location element not found')
      return
    }

    this.locationElement.innerHTML = `
      <div class="location-display">
        <span class="location-text">📍 ${location}</span>
        <button class="location-change-btn" onclick="locationManager.changeLocation()">
          Change
        </button>
      </div>
    `

    // Add styles
    this.addStyles()
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (!this.locationElement) return

    this.locationElement.innerHTML = `
      <div class="location-display">
        <span class="location-text">📍 Detecting location...</span>
      </div>
    `
  }

  /**
   * Show manual input for location
   */
  showManualInput(message = 'Enter your city') {
    if (!this.locationElement) return

    this.locationElement.innerHTML = `
      <div class="location-display">
        <input 
          type="text" 
          id="manual-location-input" 
          class="location-input" 
          placeholder="Enter city name"
          onkeypress="locationManager.handleManualLocationInput(event)"
        />
        <button class="location-submit-btn" onclick="locationManager.submitManualLocation()">
          Set
        </button>
      </div>
    `

    // Add styles
    this.addStyles()

    // Focus input
    setTimeout(() => {
      const input = document.getElementById('manual-location-input')
      if (input) input.focus()
    }, 100)
  }

  /**
   * Handle manual location input
   */
  handleManualLocationInput(event) {
    if (event.key === 'Enter') {
      this.submitManualLocation()
    }
  }

  /**
   * Submit manually entered location
   */
  submitManualLocation() {
    const input = document.getElementById('manual-location-input')
    if (!input || !input.value.trim()) {
      alert('Please enter a city name')
      return
    }

    const location = input.value.trim()
    
    // Save location
    localStorage.setItem(this.storageKey, location)
    
    // Display location
    this.displayLocation(location)
  }

  /**
   * Change location - clear saved data and re-request
   */
  changeLocation() {
    // Clear saved location
    localStorage.removeItem(this.storageKey)
    localStorage.removeItem(this.latKey)
    localStorage.removeItem(this.lonKey)

    // Request new location
    this.requestLocation()
  }

  /**
   * Add CSS styles for location display
   */
  addStyles() {
    // Check if styles already added
    if (document.getElementById('location-styles')) {
      return
    }

    const style = document.createElement('style')
    style.id = 'location-styles'
    style.textContent = `
      .location-display {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background-color: #f0f9ff;
        border-radius: 6px;
        border: 1px solid #bfdbfe;
      }

      .location-text {
        font-size: 14px;
        color: #1e40af;
        font-weight: 500;
        white-space: nowrap;
      }

      .location-change-btn {
        padding: 4px 8px;
        font-size: 12px;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .location-change-btn:hover {
        background-color: #2563eb;
      }

      .location-input {
        padding: 6px 10px;
        font-size: 14px;
        border: 1px solid #bfdbfe;
        border-radius: 4px;
        outline: none;
        width: 150px;
      }

      .location-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .location-submit-btn {
        padding: 6px 12px;
        font-size: 12px;
        background-color: #10b981;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .location-submit-btn:hover {
        background-color: #059669;
      }

      @media (max-width: 768px) {
        .location-display {
          flex-direction: column;
          gap: 6px;
          padding: 6px 8px;
        }

        .location-input {
          width: 100%;
        }

        .location-text {
          font-size: 12px;
        }
      }
    `

    document.head.appendChild(style)
  }

  /**
   * Get saved location
   */
  getSavedLocation() {
    return localStorage.getItem(this.storageKey)
  }

  /**
   * Get saved latitude
   */
  getSavedLatitude() {
    const lat = localStorage.getItem(this.latKey)
    return lat ? parseFloat(lat) : null
  }

  /**
   * Get saved longitude
   */
  getSavedLongitude() {
    const lon = localStorage.getItem(this.lonKey)
    return lon ? parseFloat(lon) : null
  }

  /**
   * Get all saved location data
   */
  getAllLocationData() {
    return {
      location: this.getSavedLocation(),
      latitude: this.getSavedLatitude(),
      longitude: this.getSavedLongitude(),
    }
  }
}

// Initialize location manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.locationManager = new LocationManager()
  })
} else {
  window.locationManager = new LocationManager()
}
