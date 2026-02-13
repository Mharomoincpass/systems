import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export async function getAuthUser(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    return payload
  } catch (error) {
    return null
  }
}

export function createAuthResponse(data: any, token?: string) {
  const response = NextResponse.json(data)

  if (token) {
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  }

  return response
}
