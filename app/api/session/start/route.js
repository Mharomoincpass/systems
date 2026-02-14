import { cookies } from 'next/headers'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import { generateToken } from '@/lib/auth'
import { getIPLocation } from '@/lib/geolocation'

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown'
  console.log('🔍 Client IP extracted:', ip)
  return ip
}

export async function POST(request) {
  try {
    console.log('📍 POST /api/session/start called')
    
    console.log('🔗 Connecting to MongoDB...')
    await connectDB()
    console.log('✅ MongoDB connected')

    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    console.log('📱 User Agent:', userAgent)
    
    const sessionToken = generateToken({ ip, timestamp: Date.now() })
    console.log('🔐 Generated token:', sessionToken)

    // Fetch geolocation data
    console.log('🗺️ Fetching geolocation...')
    const location = await getIPLocation(ip)
    console.log('📍 Location data:', location)

    const session = await Session.create({
      ip,
      sessionToken,
      userAgent,
      location,
    })
    console.log('💾 Session saved to DB:', session._id)

    const cookieStore = await cookies()
    console.log('🍪 Setting cookie...')
    cookieStore.set('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7,
      path: '/',
    })
    console.log('✅ Cookie set successfully')

    console.log('📤 Sending response...')
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
    console.error('❌ Session start error:', error.message)
    console.error('Stack:', error.stack)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to start session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

