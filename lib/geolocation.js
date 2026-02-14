export async function getIPLocation(ip) {
  try {
    // Clean up IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1 or ::127.0.0.1)
    let cleanIP = ip
    if (ip.includes(':') && ip.includes('.')) {
      cleanIP = ip.split(':').pop()
    }

    // Skip geolocation for localhost
    if (cleanIP === '::1' || cleanIP === '127.0.0.1' || cleanIP === 'localhost' || cleanIP === '::') {
      console.log('📍 Localhost detected, returning local data')
      return {
        city: 'Local',
        country: 'Localhost',
        region: 'Dev',
        timezone: 'UTC',
        lat: 0,
        lon: 0,
        isp: 'Local Machine',
      }
    }

    console.log(`🌐 Fetching geolocation for IP: ${cleanIP}`)
    
    // Use AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(
        `http://ip-api.com/json/${cleanIP}?fields=city,country,region,timezone,lat,lon,isp,status`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'fail') {
        console.warn(`⚠️ Geolocation API failed for IP ${ip}:`, data.message)
        return null
      }

      console.log(`✅ Geolocation found: ${data.city}, ${data.country}`)
      
      return {
        city: data.city || 'Unknown',
        country: data.country || 'Unknown',
        region: data.region || 'Unknown',
        timezone: data.timezone || 'UTC',
        lat: data.lat || 0,
        lon: data.lon || 0,
        isp: data.isp || 'Unknown',
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.warn(`⚠️ Geolocation request timeout for IP ${ip}`)
      } else {
        console.warn(`⚠️ Geolocation fetch error for IP ${ip}:`, fetchError.message)
      }
      return null
    }
  } catch (error) {
    console.error(`❌ Failed to fetch geolocation for IP ${ip}:`, error.message)
    return null
  }
}
