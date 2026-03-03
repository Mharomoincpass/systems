import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Media from '@/models/Media'
import { requireAdmin } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    await connectDB()

    const [totalUsers, totalMedia, totalImages, totalVideos, totalAudio] = await Promise.all([
      User.countDocuments(),
      Media.countDocuments(),
      Media.countDocuments({ type: 'image' }),
      Media.countDocuments({ type: 'video' }),
      Media.countDocuments({ type: 'audio' }),
    ])

    // Storage stats
    const storageAgg = await Media.aggregate([
      { $group: { _id: null, totalSize: { $sum: '$fileSize' } } },
    ])
    const totalStorage = storageAgg[0]?.totalSize || 0

    // Recent users
    const recentUsers = await User.find()
      .select('email name createdAt role isSuspended')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    return Response.json({
      totalUsers,
      totalMedia,
      totalImages,
      totalVideos,
      totalAudio,
      totalStorage,
      recentUsers,
    })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
