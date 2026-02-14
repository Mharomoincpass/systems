import { NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

// Paths that require authentication
const protectedPaths = ['/dashboard', '/profile']

// Paths that should redirect authenticated users
const authPaths = ['/login', '/register']

export function middleware(request) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Check if user is authenticated
  const user = token ? verifyToken(token) : null

  // Redirect authenticated users away from auth pages
  if (user && authPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users from protected pages
  if (!user && protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
