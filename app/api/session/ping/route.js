import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/sessionToken=([^;]+)/)
    const sessionToken = match ? decodeURIComponent(match[1]) : null

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Session cookie required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    await connectDB()

    const session = await Session.findOneAndUpdate(
      { sessionToken },
      { lastAccessed: new Date() },
      { new: true }
    )

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔄 Session ping - IP: ${session.ip}, Updated: ${new Date().toLocaleTimeString()}`)

    return new Response(
      JSON.stringify({
        message: 'Session updated',
        lastAccessed: session.lastAccessed,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Session ping error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to ping session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
