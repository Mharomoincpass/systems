import { NextRequest } from 'next/server'
import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { hashPassword, generateToken } from '@/lib/auth'
import { createAuthResponse } from '@/lib/auth-helpers'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return Response.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    })

    // Generate JWT token
    const token = generateToken({ userId: user._id.toString(), email: user.email })

    return createAuthResponse(
      {
        message: 'User registered successfully',
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
