import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import { z } from 'zod'
import { requireAuth, requireAdmin } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const createConversationSchema = z.object({
  userId: z.string().optional().nullable(),
})

export async function POST(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    await connectDB()

    const conversation = new Conversation({
      title: 'New Chat',
      userId: auth.user.userId,
      messages: [],
    })

    await conversation.save()

    return Response.json({
      success: true,
      conversationId: conversation._id.toString(),
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    return Response.json(
      { error: error.message || 'Failed to create conversation' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')
    const isAll = searchParams.get('all') === 'true'

    if (isAll && auth.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const query = isAll ? {} : { userId: auth.user.userId }

    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id title createdAt updatedAt')
      .exec()

    return Response.json({
      success: true,
      conversations,
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    return Response.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    await connectDB()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })

    const conversation = await Conversation.findOne({ _id: id, userId: auth.user.userId })
    if (!conversation) return Response.json({ error: 'Not found' }, { status: 404 })

    await Conversation.deleteOne({ _id: id })
    // Also delete associated messages (if necessary, or keep them orphaned, but ideally delete)
    const Message = (await import('@/models/Message')).default
    await Message.deleteMany({ conversationId: id })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete conversation error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
