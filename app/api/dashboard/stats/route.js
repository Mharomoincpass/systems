import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { requireAuth } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    await connectDB()

    const userId = auth.user.userId
    const [images, videos, audio, transcriptions] = await Promise.all([
      Media.countDocuments({ userId, type: 'image' }),
      Media.countDocuments({ userId, type: 'video' }),
      Media.countDocuments({ userId, type: 'audio' }),
      Media.countDocuments({ userId, type: 'transcription' }),
    ])

    return Response.json({
      images,
      videos,
      audio,
      transcriptions,
      total: images + videos + audio + transcriptions,
    })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
