import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const authPages = ['/login', '/signup', '/forgot-password', '/verify']

const publicPages = ['/chat']

const toolRedirects = {
  '/images': '/dashboard/images',
  '/videos': '/dashboard/videos',
  '/music': '/dashboard/music',
  '/tts': '/dashboard/tts',
  '/transcribe': '/dashboard/transcribe',
  '/MCM': '/chat',
  '/systems': '/dashboard',
}

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
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect old tool routes
  for (const [oldPath, newPath] of Object.entries(toolRedirects)) {
    if (pathname === oldPath || pathname.startsWith(oldPath + '/')) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL(newPath, request.url))
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (pathname.startsWith('/dashboard/admin') && user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|ads.txt|llms.txt).*)'],
}
