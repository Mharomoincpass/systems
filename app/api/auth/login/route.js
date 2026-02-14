import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { comparePasswords, generateToken } from '@/lib/auth'
import { createAuthResponse } from '@/lib/auth-helpers'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(request) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user
    const user = await User.findOne({ email })

    if (!user) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await comparePasswords(password, user.password)

    if (!isValidPassword) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({ userId: user._id.toString(), email: user.email })

    return createAuthResponse(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
      token
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
