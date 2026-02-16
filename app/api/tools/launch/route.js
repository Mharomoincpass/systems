import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import { generateToken } from '@/lib/auth'
import { getIPLocation } from '@/lib/geolocation'

export const dynamic = 'force-dynamic'

function getClientIP(request) {
  const headers = request.headers
  const ip = headers.get('cf-connecting-ip') ||
             headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             headers.get('x-real-ip') ||
             headers.get('x-client-ip') ||
             headers.get('true-client-ip') ||
             'unknown'

  let cleanIp = ip
  if (ip.includes(':') && ip.includes('.')) {
    cleanIp = ip.split(':').pop()
  } else if (ip === '::1') {
    cleanIp = '127.0.0.1'
  }
  return cleanIp
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') || '/systems'

  const cookieStore = cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value

  if (sessionToken) {
    redirect(path)
  }

  try {
    await connectDB()

    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    
    const newToken = generateToken({ ip, timestamp: Date.now() })
    const location = await getIPLocation(ip)

    await Session.create({
      ip,
      sessionToken: newToken,
      userAgent,
      location,
    })

    cookieStore.set('sessionToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7,
      path: '/',
    })

    redirect(path)
  } catch (error) {
    console.error('Launch error:', error)
    // Fallback redirect even if session creation fails (allow access, maybe limited)
    redirect(path)
  }
}
