import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import OTP from '@/models/OTP'
import User from '@/models/User'
import AuditLog from '@/models/AuditLog'
import { hashPassword } from '@/lib/auth'
import { getClientIP } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const resetSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  code: z.string().length(6),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, code, password } = resetSchema.parse(body)

    await connectDB()

    const otp = await OTP.findOne({ email, type: 'password-reset' })
    if (!otp) {
      return Response.json({ error: 'No reset code found. Request a new one.' }, { status: 400 })
    }

    if (otp.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otp._id })
      return Response.json({ error: 'Reset code expired. Request a new one.' }, { status: 400 })
    }

    if (otp.attempts >= 5) {
      await OTP.deleteOne({ _id: otp._id })
      return Response.json({ error: 'Too many failed attempts. Request a new code.' }, { status: 400 })
    }

    if (otp.code !== code) {
      otp.attempts += 1
      await otp.save()
      return Response.json({ error: 'Invalid reset code.' }, { status: 400 })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return Response.json({ error: 'Account not found.' }, { status: 404 })
    }

    user.password = await hashPassword(password)
    await user.save()

    await OTP.deleteOne({ _id: otp._id })

    const ip = getClientIP(request)
    await AuditLog.create({
      userId: user._id,
      action: 'password_reset',
      ip,
      userAgent: request.headers.get('user-agent') || '',
    })

    return Response.json({ success: true, message: 'Password reset successfully. You can now log in.' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Reset password error:', error)
    return Response.json({ error: 'Failed to reset password.' }, { status: 500 })
  }
}
