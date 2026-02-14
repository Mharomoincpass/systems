import { cookies } from 'next/headers'
import { generateToken } from '@/lib/auth'

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

    const adminPassword = process.env.ADMIN_PASSWORD || '123456'

    if (password !== adminPassword) {
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
        adminToken,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Admin auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
