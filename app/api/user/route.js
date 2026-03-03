import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { getAuthUser } from '@/lib/auth-helpers'

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
        role: user.role,
        avatar: user.avatar,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    await connectDB()

    const authUser = await getAuthUser(request)
    if (!authUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const user = await User.findById(authUser.userId)
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Update name
    if (body.name !== undefined) {
      user.name = body.name.trim().slice(0, 100)
    }

    // Change password
    if (body.currentPassword && body.newPassword) {
      const valid = await bcrypt.compare(body.currentPassword, user.password)
      if (!valid) {
        return Response.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
      if (body.newPassword.length < 6) {
        return Response.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
      }
      user.password = await bcrypt.hash(body.newPassword, 12)
    }

    await user.save()

    return Response.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
