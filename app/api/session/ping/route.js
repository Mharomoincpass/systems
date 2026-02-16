import connectDB from '@/lib/mongodb'
import Session from '@/models/Session'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { sessionToken } = body

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Session token required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

    return new Response(
      JSON.stringify({
        message: 'Session updated',
        lastAccessed: session.lastAccessed,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Session ping error:', error)
    }
    return new Response(
      JSON.stringify({ error: 'Failed to ping session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
