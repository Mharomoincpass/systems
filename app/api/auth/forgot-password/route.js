import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import OTP from '@/models/OTP'
import User from '@/models/User'
import { sendEmailWithZeptoMail } from '@/lib/smtp-service'
import { rateLimitOTP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const forgotSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
})

function generateOTPCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { email } = forgotSchema.parse(body)

    const limit = rateLimitOTP(email)
    if (!limit.success) {
      return Response.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    await connectDB()

    const user = await User.findOne({ email })
    // Always return success even if user doesn't exist (prevent email enumeration)
    if (!user) {
      return Response.json({ success: true, message: 'If an account exists, a reset code has been sent.' })
    }

    await OTP.deleteMany({ email, type: 'password-reset' })

    const code = generateOTPCode()
    await OTP.create({
      email,
      code,
      type: 'password-reset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })

    await sendEmailWithZeptoMail({
      to: [{ address: email }],
      subject: 'Password reset code — Mharomo Systems',
      htmlbody: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#000;color:#fff;border-radius:8px">
          <h2 style="margin:0 0 16px;font-size:20px">Reset your password</h2>
          <p style="margin:0 0 24px;color:#aaa;font-size:14px">Use the code below to reset your password. It expires in 10 minutes.</p>
          <div style="background:#111;border:1px solid #333;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700">${code}</div>
          <p style="margin:24px 0 0;color:#666;font-size:12px">If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    return Response.json({ success: true, message: 'If an account exists, a reset code has been sent.' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    console.error('Forgot password error:', error)
    return Response.json({ error: 'Failed to process request.' }, { status: 500 })
  }
}
