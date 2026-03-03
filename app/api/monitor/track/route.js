import connectDB from '@/lib/mongodb'
import { getAuthUser, getClientIP } from '@/lib/auth-helpers'
import { getIPLocation } from '@/lib/geolocation'
import Visitor from '@/models/Visitor'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    await connectDB()

    const user = await getAuthUser(request)
    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    let body = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const path = typeof body?.path === 'string' && body.path.trim() ? body.path.slice(0, 200) : '/'

    const now = new Date()
    const existing = await Visitor.findOne({ ip, path }).sort({ lastSeen: -1 })

    if (existing) {
      existing.lastSeen = now
      existing.visitCount += 1
      if (!existing.userId && user?.id) {
        existing.userId = user.id
      }
      if (!existing.userAgent && userAgent) {
        existing.userAgent = userAgent
      }
      await existing.save()
      return Response.json({ success: true, visitorId: existing._id })
    }

    const location = await getIPLocation(ip)

    const visitor = await Visitor.create({
      ip,
      userId: user?.id || null,
      userAgent,
      path,
      city: location?.city || 'Unknown',
      country: location?.country || 'Unknown',
      region: location?.region || 'Unknown',
      timezone: location?.timezone || 'UTC',
      lat: location?.lat || 0,
      lon: location?.lon || 0,
      isp: location?.isp || 'Unknown',
      firstSeen: now,
      lastSeen: now,
      visitCount: 1,
    })

    return Response.json({ success: true, visitorId: visitor._id })
  } catch {
    return Response.json({ error: 'Failed to track visitor' }, { status: 500 })
  }
}
