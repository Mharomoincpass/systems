import connectDB from '@/lib/mongodb'
import AuditLog from '@/models/AuditLog'
import { requireAdmin } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit
    const action = searchParams.get('action')

    const filter = {}
    if (action) filter.action = action

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'email name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ])

    return Response.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
