import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getAuthUser } from '@/lib/auth-helpers'
import { hashPassword, comparePasswords } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    await connectDB()
    
    const authUser = await getAuthUser(request)

    if (!authUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findById(authUser.userId).select('-password')

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({ 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    await connectDB()
    
    const authUser = await getAuthUser(request)

    if (!authUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, currentPassword, newPassword } = body

    const user = await User.findById(authUser.userId)

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Update name if provided
    if (name !== undefined) {
      user.name = name
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return Response.json({ error: 'Current password is required to set a new password' }, { status: 400 })
      }

      const isPasswordValid = await comparePasswords(currentPassword, user.password)
      if (!isPasswordValid) {
        return Response.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return Response.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
      }

      user.password = await hashPassword(newPassword)
    }

    await user.save()

    return Response.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Update error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
