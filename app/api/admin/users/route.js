import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Media from '@/models/Media'
import AuditLog from '@/models/AuditLog'
import { requireAdmin } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

// GET /api/admin/users - List/search users
export async function GET(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '25', 10), 100)
    const skip = (page - 1) * limit

    const filter = {}
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ])

    return Response.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/users - Suspend/unsuspend user
export async function PATCH(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    await connectDB()

    const body = await request.json()
    const { userId, action, reason } = body

    if (!userId || !action) {
      return Response.json({ error: 'Missing userId or action' }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'admin') {
      return Response.json({ error: 'Cannot modify admin accounts' }, { status: 403 })
    }

    if (action === 'suspend') {
      user.isSuspended = true
      user.suspendedReason = reason || 'Suspended by administrator'
      await user.save()

      await AuditLog.create({
        userId: auth.user.userId,
        action: 'admin_suspend_user',
        details: { targetUserId: userId, reason },
      })
    } else if (action === 'unsuspend') {
      user.isSuspended = false
      user.suspendedReason = ''
      await user.save()

      await AuditLog.create({
        userId: auth.user.userId,
        action: 'admin_unsuspend_user',
        details: { targetUserId: userId },
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/users - Delete user and their media
export async function DELETE(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'admin') {
      return Response.json({ error: 'Cannot delete admin accounts' }, { status: 403 })
    }

    // Delete user's media from Azure
    const { deleteBlob } = await import('@/lib/azure-storage')
    const mediaItems = await Media.find({ userId })
    for (const item of mediaItems) {
      if (item.blobPath) {
        try { await deleteBlob(item.blobPath) } catch {}
      }
    }

    // Delete user's media records
    await Media.deleteMany({ userId })

    // Log before deletion
    await AuditLog.create({
      userId: auth.user.userId,
      action: 'admin_delete_user',
      details: { targetEmail: user.email, mediaDeleted: mediaItems.length },
    })

    // Delete user
    await User.deleteOne({ _id: userId })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
