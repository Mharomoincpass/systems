import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import OTP from '@/models/OTP'
import User from '@/models/User'
import AuditLog from '@/models/AuditLog'
import { hashPassword, generateToken } from '@/lib/auth'
import { createAuthResponse, getClientIP } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const verifySchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  code: z.string().length(6),
  name: z.string().min(1, 'Name is required').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, code, name, password } = verifySchema.parse(body)

    await connectDB()

    const otp = await OTP.findOne({ email, type: 'signup' })
    if (!otp) {
      return Response.json({ error: 'No verification code found. Request a new one.' }, { status: 400 })
    }

    if (otp.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otp._id })
      return Response.json({ error: 'Verification code expired. Request a new one.' }, { status: 400 })
    }

    if (otp.attempts >= 5) {
      await OTP.deleteOne({ _id: otp._id })
      return Response.json({ error: 'Too many failed attempts. Request a new code.' }, { status: 400 })
    }

    if (otp.code !== code) {
      otp.attempts += 1
      await otp.save()
      return Response.json({ error: 'Invalid verification code.' }, { status: 400 })
    }

    // Check duplicate (race condition guard)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      await OTP.deleteOne({ _id: otp._id })
      return Response.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      emailVerified: true,
      lastLoginAt: new Date(),
    })

    await OTP.deleteOne({ _id: otp._id })

    const ip = getClientIP(request)
    await AuditLog.create({
      userId: user._id,
      action: 'signup',
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
        message: 'Account created successfully.',
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
    console.error('Verify OTP error:', error)
    return Response.json({ error: 'Verification failed.' }, { status: 500 })
  }
}
