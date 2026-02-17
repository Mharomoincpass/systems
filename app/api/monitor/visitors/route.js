import connectDB from '@/lib/mongodb'
import Visitor from '@/models/Visitor'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/adminToken=([^;]+)/)
    const adminToken = match ? match[1] : null
    const adminPayload = adminToken ? verifyToken(adminToken) : null

    if (!adminPayload || adminPayload.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    await connectDB()

    const visitors = await Visitor.find().sort({ lastSeen: -1 }).limit(1000).lean()

    return new Response(JSON.stringify({ visitors }), { status: 200 })
  } catch (error) {
    console.error('Visitor list error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), { status: 500 })
  }
}
