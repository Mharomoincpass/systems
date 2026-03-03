import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth-helpers'
import Visitor from '@/models/Visitor'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

    const now = Date.now()
    const onlineThreshold = new Date(now - 5 * 60 * 1000)

    const [recentVisitors, totalVisitors, onlineVisitors, topCountries] = await Promise.all([
      Visitor.find()
        .sort({ lastSeen: -1 })
        .limit(limit)
        .select('ip city country region timezone lat lon isp path userAgent visitCount firstSeen lastSeen')
        .lean(),
      Visitor.countDocuments(),
      Visitor.countDocuments({ lastSeen: { $gte: onlineThreshold } }),
      Visitor.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ])

    return Response.json({
      totalVisitors,
      onlineVisitors,
      topCountries: topCountries.map((item) => ({ country: item._id || 'Unknown', count: item.count })),
      visitors: recentVisitors,
    })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
