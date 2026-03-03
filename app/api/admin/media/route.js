import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { requireAdmin } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

// GET /api/admin/media?userId=xxx - Browse user media
export async function GET(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit

    const filter = {}
    if (userId) filter.userId = userId
    if (type && ['image', 'video', 'audio', 'transcription'].includes(type)) {
      filter.type = type
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
