import { cookies } from 'next/headers'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import { generateToken } from '@/lib/auth'
import { getIPLocation } from '@/lib/geolocation'

export const dynamic = 'force-dynamic'

function getClientIP(request) {
  // Try various headers for real IP (standard for proxies/load balancers)
  const headers = request.headers
  
  const ip = headers.get('cf-connecting-ip') ||
             headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             headers.get('x-real-ip') ||
             headers.get('x-client-ip') ||
             headers.get('true-client-ip') ||
             'unknown'

  // Clean up IPv4-mapped IPv6 (::ffff:127.0.0.1 -> 127.0.0.1)
  let cleanIp = ip
  if (ip.includes(':') && ip.includes('.')) {
    cleanIp = ip.split(':').pop()
  } else if (ip === '::1') {
    cleanIp = '127.0.0.1'
  }

  return cleanIp
}

export async function POST(request) {
  try {
    await connectDB()

    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    
    const sessionToken = generateToken({ ip, timestamp: Date.now() })

    // Fetch geolocation data
    const location = await getIPLocation(ip)

    const session = await Session.create({
      ip,
      sessionToken,
      userAgent,
      location,
    })

    const cookieStore = await cookies()
    cookieStore.set('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7,
      path: '/',
    })

    return new Response(
      JSON.stringify({
        message: 'Session started',
        sessionToken,
        sessionId: session._id,
        location,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    // Only log detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Session start error:', error.message)
      console.error('Stack:', error.stack)
    }
    return new Response(
      JSON.stringify({ error: 'Failed to start session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

