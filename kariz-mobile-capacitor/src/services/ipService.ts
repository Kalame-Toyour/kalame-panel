// IP Location Services for Mobile App
interface IPLocationResponse {
  country: string
  countryCode: string
  region: string
  city: string
  ip: string
}

interface IPInfoResponse {
  country: string
  countryCode: string
  region: string
  city: string
  ip: string
}

interface IPGeolocationResponse {
  country_name: string
  country_code: string
  state_prov: string
  city: string
  ip: string
}

interface IPCheckResult {
  isFromIran: boolean
  country?: string
  error?: string
}

export async function checkUserLocation(): Promise<IPCheckResult> {
  try {
    // Using ipapi.co as it's free and reliable
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      // Return true to avoid blocking legitimate users
      return {
        isFromIran: true,
        country: 'IR',
      }
    }

    const data: IPLocationResponse = await response.json()
    
    return {
      isFromIran: data.countryCode === 'IR',
      country: data.country,
    }
  } catch (error) {
    console.error('Error checking user location:', error)
    return {
      isFromIran: true, // Default to true to avoid blocking legitimate users
      error: 'Unable to verify location'
    }
  }
}

// Alternative service in case the primary one fails
export async function checkUserLocationFallback(): Promise<IPCheckResult> {
  try {
    const response = await fetch('https://ipinfo.io/json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch location data')
    }

    const data: IPInfoResponse = await response.json()
    
    return {
      isFromIran: data.countryCode === 'IR',
      country: data.country,
    }
  } catch (error) {
    console.error('Error checking user location (fallback):', error)
    return {
      isFromIran: true,
      error: 'Unable to verify location'
    }
  }
}

// Third service for additional verification
export async function checkUserLocationThird(): Promise<IPCheckResult> {
  try {
    const response = await fetch('https://ipgeolocation.io/ipgeo/api/v1/json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch location data')
    }

    const data: IPGeolocationResponse = await response.json()
    
    return {
      isFromIran: data.country_code === 'IR',
      country: data.country_name,
    }
  } catch (error) {
    console.error('Error checking user location (third):', error)
    return {
      isFromIran: true, // Default to true to avoid blocking legitimate users
      error: 'Unable to verify location'
    }
  }
}

// Fourth service using a different API
export async function checkUserLocationFourth(): Promise<IPCheckResult> {
  try {
    const response = await fetch('https://api.country.is', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch location data')
    }

    const data = await response.json()
    
    return {
      isFromIran: data.country === 'IR',
      country: data.country,
    }
  } catch (error) {
    console.error('Error checking user location (fourth):', error)
    return {
      isFromIran: true,
      error: 'Unable to verify location'
    }
  }
}

// Comprehensive IP check using multiple services
export async function checkUserLocationComprehensive(): Promise<IPCheckResult> {
  const services = [
    checkUserLocation,
    checkUserLocationFallback,
    checkUserLocationThird,
    checkUserLocationFourth
  ]

  const results: IPCheckResult[] = []
  
  // Try all services in parallel
  const promises = services.map(async (service) => {
    try {
      return await service()
    } catch (error) {
      console.error('Service failed:', error)
      return { isFromIran: true, error: 'Service failed' }
    }
  })

  const responses = await Promise.allSettled(promises)
  
  responses.forEach((response) => {
    if (response.status === 'fulfilled') {
      results.push(response.value)
    }
  })

  // Count how many services say user is from Iran
  const iranCount = results.filter(result => result.isFromIran).length
  const totalCount = results.length

  console.log('IP Check Results:', {
    totalServices: totalCount,
    iranCount,
    results: results.map(r => ({ isFromIran: r.isFromIran, country: r.country }))
  })

  // If majority of services say user is from Iran, consider them from Iran
  const isFromIran = iranCount > totalCount / 2
  
  // Get the most common country from successful results
  const countries = results
    .filter(r => r.country && !r.error)
    .map(r => r.country)
  
  const mostCommonCountry = countries.length > 0 
    ? countries.sort((a, b) => 
        countries.filter(v => v === a).length - countries.filter(v => v === b).length
      ).pop()
    : 'Unknown'

  return {
    isFromIran,
    country: mostCommonCountry,
    error: isFromIran ? undefined : 'Location verification failed'
  }
}
