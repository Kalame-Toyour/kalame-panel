interface IPLocationResponse {
  country: string
  countryCode: string
  region: string
  city: string
  isp: string
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
      // throw new Error('Failed to fetch location data')
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

    const data = await response.json()
    
    return {
      isFromIran: data.country === 'IR',
      country: data.country,
    }
  } catch (error) {
    console.error('Error checking user location (fallback):', error)
    return {
      isFromIran: true, // Default to true to avoid blocking legitimate users
      error: 'Unable to verify location'
    }
  }
}
