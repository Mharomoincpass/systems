import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Paths that require session authentication
const sessionProtectedPaths = ['/systems']

// Public routes within /systems that should remain crawlable
const publicSystemsPaths = ['/systems/documentation']

// Paths that require admin authentication
const adminProtectedPaths = ['/monitor']

async function verifyToken(token) {
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

export async function proxy(request) {
  const sessionToken = request.cookies.get('sessionToken')?.value
  const adminToken = request.cookies.get('adminToken')?.value
  const { pathname } = request.nextUrl

  console.log(`🚦 Middleware: ${request.method} ${pathname}`)

  // Protect admin routes
  if (adminProtectedPaths.some((path) => pathname.startsWith(path))) {
    const payload = await verifyToken(adminToken)
    if (!payload || payload.role !== 'admin') {
      console.log(`   ❌ Invalid or missing admin token for monitor, redirecting to /admin`)
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    console.log(`   ✅ Valid admin token present`)
  }

  // Protect session routes
  const isSessionProtectedPath = sessionProtectedPaths.some((path) => pathname.startsWith(path))
  const isPublicSystemsPath = publicSystemsPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (isSessionProtectedPath && !isPublicSystemsPath) {
    const payload = await verifyToken(sessionToken)
    if (!payload) {
      console.log(`   ❌ Invalid or missing session token for systems, redirecting to /`)
      const response = NextResponse.redirect(new URL('/', request.url))
      // Clear invalid cookie
      response.cookies.delete('sessionToken')
      return response
    }
    console.log(`   ✅ Valid session token present`)
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
