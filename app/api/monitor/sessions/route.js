import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import { getIPLocation } from '@/lib/geolocation'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/adminToken=([^;]+)/)
    const adminToken = match ? match[1] : null
    const adminPayload = adminToken ? verifyToken(adminToken) : null

    if (!adminPayload || adminPayload.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    await connectDB()

    const url = new URL(request.url)
    const resolveLocation = url.searchParams.get('resolveLocation') === '1'

    let sessions = await Session.find().sort({ createdAt: -1 }).limit(1000)

    if (resolveLocation) {
      const missing = sessions
        .filter((s) => !s.location || !s.location.city)
        .slice(0, 5)

      for (const session of missing) {
        if (!session.ip) continue;
        
        console.log(`📡 Resolving missing location for: ${session.ip}`)
        const location = await getIPLocation(session.ip)
        
        if (location && location.city) {
          const result = await Session.updateOne(
            { _id: session._id },
            { $set: { location: location } }
          )
          console.log(`✅ DB Update result for ${session.ip}:`, result.modifiedCount > 0 ? 'SAVED' : 'NO CHANGE')
        }
      }

      // Re-fetch to get updated data
      sessions = await Session.find().sort({ createdAt: -1 }).limit(1000).lean()
    }

    return new Response(
      JSON.stringify({ sessions }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Monitor error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch sessions' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
