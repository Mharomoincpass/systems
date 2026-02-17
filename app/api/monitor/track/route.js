import connectDB from '@/lib/mongodb'
import Visitor from '@/models/Visitor'
import { getIPLocation } from '@/lib/geolocation'

export const dynamic = 'force-dynamic'

function getClientIP(headers) {
  const ip = headers.get('cf-connecting-ip') ||
             headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             headers.get('x-real-ip') ||
             'unknown'

  let cleanIp = ip
  if (ip.includes(':') && ip.includes('.')) {
    cleanIp = ip.split(':').pop()
  } else if (ip === '::1') {
    cleanIp = '127.0.0.1'
  }
  return cleanIp
}

export async function POST(request) {
  try {
    const { path, referrer } = await request.json()
    const ip = getClientIP(request.headers)
    const userAgent = request.headers.get('user-agent') || ''

    await connectDB()

    // Find and update or create visitor
    const location = await getIPLocation(ip)
    
    await Visitor.findOneAndUpdate(
      { ip, path },
      { 
        userAgent, 
        referrer, 
        location,
        lastSeen: new Date()
      },
      { upsert: true, new: true }
    )

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Visitor track error:', error)
    return new Response(JSON.stringify({ error: 'Failed to track' }), { status: 500 })
  }
}
