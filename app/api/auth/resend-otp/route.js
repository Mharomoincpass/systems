import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import OTP from '@/models/OTP'
import User from '@/models/User'
import { sendEmailWithZeptoMail } from '@/lib/smtp-service'
import { rateLimitOTP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const resendSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  type: z.enum(['signup', 'password-reset']).default('signup'),
})

function generateOTPCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, type } = resendSchema.parse(body)

    const limit = rateLimitOTP(email)
    if (!limit.success) {
      return Response.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    await connectDB()

    if (type === 'signup') {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return Response.json({ error: 'Account already exists.' }, { status: 409 })
      }
    }

    await OTP.deleteMany({ email, type })

    const code = generateOTPCode()
    await OTP.create({
      email,
      code,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })

    const subject = type === 'signup'
      ? 'Your verification code — Mharomo Systems'
      : 'Password reset code — Mharomo Systems'

    const heading = type === 'signup' ? 'Verify your email' : 'Reset your password'

    await sendEmailWithZeptoMail({
      to: [{ address: email }],
      subject,
      htmlbody: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#ffffff;color:#000000;border-radius:8px">
          <h2 style="margin:0 0 16px">Your Verification Code</h2>
          <p style="margin:0 0 24px;color:#666666;font-size:14px">Use the code below. It expires in 10 minutes.</p>
          <div style="background:#f4f4f4;border:1px solid #eaeaea;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700">${code}</div>
          <p style="margin:24px 0 0;color:#666666;font-size:12px">If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    return Response.json({ success: true, message: 'Code resent.' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation error.' }, { status: 400 })
    }
    console.error('Resend OTP error:', error)
    return Response.json({ error: 'Failed to resend code.' }, { status: 500 })
  }
}
