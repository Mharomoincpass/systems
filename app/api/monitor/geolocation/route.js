import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'
import { getIPLocation } from '@/lib/geolocation'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request) {
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

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    await connectDB()

    const session = await Session.findById(sessionId)
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔄 Fetching geolocation for session IP: ${session.ip}`)
    
    const location = await getIPLocation(session.ip)
    
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      { location },
      { new: true }
    )

    return new Response(
      JSON.stringify({
        message: 'Geolocation updated',
        session: updatedSession,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Update geolocation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update geolocation' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
