import { cookies } from 'next/headers'
import { generateToken, comparePasswords } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ADMIN_PASSWORD must be set as a bcrypt hash in environment variables
    const adminPasswordHash = process.env.ADMIN_PASSWORD
    
    if (!adminPasswordHash) {
      console.error('ADMIN_PASSWORD environment variable is not set')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Use bcrypt compare for timing-safe password comparison
    const isValid = await comparePasswords(password, adminPasswordHash)
    
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const adminToken = generateToken({ role: 'admin', timestamp: Date.now() })

    const cookieStore = await cookies()
    cookieStore.set('adminToken', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    })

    return new Response(
      JSON.stringify({
        message: 'Admin authenticated',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    // Log error details only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin auth error:', error)
    }
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
