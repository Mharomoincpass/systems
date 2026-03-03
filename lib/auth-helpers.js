import { NextResponse } from 'next/server'
import { verifyToken } from './auth'

export async function getAuthUser(request) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return null
    const payload = verifyToken(token)
    return payload
  } catch {
    return null
  }
}

export async function requireAuth(request) {
  const user = await getAuthUser(request)
  if (!user) {
    return { user: null, error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { user, error: null }
}

export async function requireAdmin(request) {
  const user = await getAuthUser(request)
  if (!user) {
    return { user: null, error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (user.role !== 'admin') {
    return { user: null, error: Response.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user, error: null }
}

export function createAuthResponse(data, token) {
  const response = NextResponse.json(data)
  if (token) {
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
  }
  return response
}

export function getClientIP(request) {
  const headers = request.headers
  const ip =
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('x-client-ip') ||
    'unknown'
  let cleanIp = ip
  if (ip.includes(':') && ip.includes('.')) {
    cleanIp = ip.split(':').pop()
  } else if (ip === '::1') {
    cleanIp = '127.0.0.1'
  }
  return cleanIp
}
