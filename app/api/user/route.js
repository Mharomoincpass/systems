import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getAuthUser } from '@/lib/auth-helpers'

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
