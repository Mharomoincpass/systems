import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth-helpers'
import { deleteBlob } from '@/lib/azure-storage'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit

    const filter = auth.user.role === 'admin' ? {} : { userId: auth.user.userId }
    if (type && ['image', 'video', 'audio', 'transcription'].includes(type)) {
      filter.type = type
    } else {
      filter.type = { $ne: 'transcription' }
    }

    const [media, total] = await Promise.all([
      Media.find(filter)
        .populate('userId', 'email name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ])

    return Response.json({
      media,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    await connectDB()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return Response.json({ error: 'Missing media ID' }, { status: 400 })
    }

    const mediaQuery = auth.user.role === 'admin' ? { _id: id } : { _id: id, userId: auth.user.userId }
    const media = await Media.findOne(mediaQuery)
    if (!media) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    // Delete from Azure Blob
    if (media.blobPath) {
      try {
        await deleteBlob(media.blobPath)
      } catch {
        // Continue even if blob delete fails
      }
    }

    // Update user storage
    if (media.fileSize) {
      await User.findByIdAndUpdate(media.userId, {
        $inc: { storageUsed: -media.fileSize },
      })
    }

    await Media.deleteOne({ _id: id })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
