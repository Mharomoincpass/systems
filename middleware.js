import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const authPages = ['/login', '/signup', '/forgot-password', '/verify']

async function verifyJWT(token) {
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Allow API routes, static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/temp/') ||
    pathname.startsWith('/images/') ||
    pathname.match(/\.\w+$/)
  ) {
    return NextResponse.next()
  }

  const user = await verifyJWT(token)
  const isAuthenticated = Boolean(user)

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authPages.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  // Protect dashboard/admin routes - admin only
  if (pathname.startsWith('/dashboard/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/chat', request.url))
    }
    return NextResponse.next()
  }

  // Redirect all other /dashboard routes to /chat
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|ads.txt|llms.txt).*)'],
}
