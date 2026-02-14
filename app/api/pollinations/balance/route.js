export async function GET(request) {
  try {
    const pollinationsKey = process.env.POLLINATIONS_API_KEY

    if (!pollinationsKey) {
      return new Response(
        JSON.stringify({ 
          balance: null, 
          message: 'API key not configured',
          status: 'unconfigured'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Call Pollinations API to get account balance
    // Endpoint: https://gen.pollinations.ai/account/balance
    const response = await fetch('https://gen.pollinations.ai/account/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pollinationsKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ 
            balance: null, 
            message: 'Invalid API key',
            status: 'invalid_key'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            balance: 0,
            message: 'Insufficient credits',
            status: 'insufficient'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // For any other error, try to get the response text for debugging
      const errorText = await response.text()
      console.error(`Pollinations API error ${response.status}:`, errorText)
      
      return new Response(
        JSON.stringify({ 
          balance: null, 
          message: 'Failed to fetch balance',
          status: 'error',
          statusCode: response.status
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    
    // Response can be { balance: number } or { tier, pack, crypto, balance }
    return new Response(
      JSON.stringify({ 
        balance: data.balance || 0,
        tier: data.tier || null,
        pack: data.pack || 0,
        crypto: data.crypto || 0,
        status: 'success'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Balance fetch error:', error.message)
    return new Response(
      JSON.stringify({ 
        balance: null, 
        message: 'Network error fetching balance',
        status: 'error'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
