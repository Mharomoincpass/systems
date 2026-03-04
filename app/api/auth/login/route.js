import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import AuditLog from '@/models/AuditLog'
import { comparePasswords, generateToken } from '@/lib/auth'
import { createAuthResponse, getClientIP } from '@/lib/auth-helpers'
import { rateLimitAuth } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const loginSchema = z.object({
  email: z.string().email('Valid email required').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request) {
  try {
    const ip = getClientIP(request)
    const limit = rateLimitAuth(ip)
    if (!limit.success) {
      return Response.json(
        { error: 'Too many login attempts. Try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    if (!user.emailVerified) {
      return Response.json({ error: 'Email not verified. Please sign up again.' }, { status: 401 })
    }

    if (user.isSuspended) {
      return Response.json(
        { error: `Account suspended${user.suspendedReason ? ': ' + user.suspendedReason : '.'}` },
        { status: 403 }
      )
    }

    const isValid = await comparePasswords(password, user.password)
    if (!isValid) {
      return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    user.lastLoginAt = new Date()
    await user.save()

    await AuditLog.create({
      userId: user._id,
      action: 'login',
      ip,
      userAgent: request.headers.get('user-agent') || '',
    })

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    return createAuthResponse(
      {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      token
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 })
    }

    const isDbUnavailable =
      error?.name === 'MongooseServerSelectionError' ||
      (error?.code === 'ECONNREFUSED' && error?.syscall === 'querySrv')

    if (isDbUnavailable) {
      console.error('Login DB connectivity error:', error)
      return Response.json(
        {
          error: 'Database is temporarily unreachable. Check MONGODB_URI/network and try again.',
        },
        { status: 503 }
      )
    }

    console.error('Login error:', error)
    return Response.json({ error: 'Login failed.' }, { status: 500 })
  }
}
