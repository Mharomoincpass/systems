import { NextResponse } from 'next/server'

// Paths that require session authentication
const sessionProtectedPaths = ['/systems']

// Paths that require admin authentication
const adminProtectedPaths = ['/monitor']

export function middleware(request) {
  const sessionToken = request.cookies.get('sessionToken')?.value
  const adminToken = request.cookies.get('adminToken')?.value
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (adminProtectedPaths.some((path) => pathname.startsWith(path))) {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Protect session routes
  if (sessionProtectedPaths.some((path) => pathname.startsWith(path))) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/', request.url))
    }
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
