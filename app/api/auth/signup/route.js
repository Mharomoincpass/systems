import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import OTP from '@/models/OTP'
import User from '@/models/User'
import { sendEmailWithZeptoMail } from '@/lib/smtp-service'
import { rateLimitSignup } from '@/lib/rate-limit'
import { getClientIP } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const signupSchema = z.object({
  email: z.string().email('Valid email required').toLowerCase().trim(),
})

function generateOTPCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(request) {
  try {
    const ip = getClientIP(request)
    const limit = rateLimitSignup(ip)
    if (!limit.success) {
      return Response.json(
        { error: 'Too many signup attempts. Try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = signupSchema.parse(body)

    await connectDB()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return Response.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // Delete old OTPs for this email
    await OTP.deleteMany({ email, type: 'signup' })

    const code = generateOTPCode()
    await OTP.create({
      email,
      code,
      type: 'signup',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    })

    await sendEmailWithZeptoMail({
      to: [{ address: email }],
      subject: 'Your verification code — Mharomo Systems',
      htmlbody: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#ffffff;color:#000000;border-radius:8px">
          <h2 style="margin:0 0 16px">Welcome to Mharomo Systems</h2>
          <p style="margin:0 0 24px;color:#666666;font-size:14px">Use the code below to complete your signup. It expires in 10 minutes.</p>
          <div style="background:#f4f4f4;border:1px solid #eaeaea;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700">${code}</div>
          <p style="margin:24px 0 0;color:#666666;font-size:12px">If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    return Response.json({ success: true, message: 'Verification code sent to your email.' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    console.error('Signup error:', error)
    return Response.json({ error: 'Failed to send verification code.' }, { status: 500 })
  }
}
