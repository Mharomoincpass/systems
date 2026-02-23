import { NextResponse } from 'next/server'

// Paths that require session authentication
const sessionProtectedPaths = ['/systems']

// Public routes within /systems that should remain crawlable
const publicSystemsPaths = ['/systems/documentation']

// Paths that require admin authentication
const adminProtectedPaths = ['/monitor']

export function middleware(request) {
  const sessionToken = request.cookies.get('sessionToken')?.value
  const adminToken = request.cookies.get('adminToken')?.value
  const { pathname } = request.nextUrl

  console.log(`🚦 Middleware: ${request.method} ${pathname}`)

  // Protect admin routes
  if (adminProtectedPaths.some((path) => pathname.startsWith(path))) {
    if (!adminToken) {
      console.log(`   ❌ No admin token for monitor, redirecting to /admin`)
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    console.log(`   ✅ Admin token present`)
  }

  // Protect session routes
  const isSessionProtectedPath = sessionProtectedPaths.some((path) => pathname.startsWith(path))
  const isPublicSystemsPath = publicSystemsPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (isSessionProtectedPath && !isPublicSystemsPath) {
    if (!sessionToken) {
      console.log(`   ❌ No session token for systems, redirecting to /`)
      return NextResponse.redirect(new URL('/', request.url))
    }
    console.log(`   ✅ Session token present`)
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
