export async function GET(request) {
  try {
    const pollinationsKey = process.env.POLLINATIONS_API_KEY

    if (!pollinationsKey) {
      return new Response(
        JSON.stringify({ 
          status: 'unconfigured',
          message: 'API key not configured'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get full account profile including tier and reset date
    const response = await fetch('https://gen.pollinations.ai/account/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pollinationsKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          status: 'error',
          statusCode: response.status,
          message: 'Failed to fetch profile'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ 
        status: 'success',
        name: data.name || 'User',
        email: data.email || null,
        tier: data.tier || null,
        createdAt: data.createdAt || null,
        nextResetAt: data.nextResetAt || null,
        ...data
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Profile fetch error:', error.message)
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: 'Network error fetching profile'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
