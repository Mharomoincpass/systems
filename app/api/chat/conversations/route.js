import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createConversationSchema = z.object({
  userId: z.string().optional().nullable(),
})

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { userId } = createConversationSchema.parse(body)

    const conversation = new Conversation({
      title: 'New Chat',
      userId: userId || null,
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
    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = parseInt(searchParams.get('skip') || '0')

    const conversations = await Conversation.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id title createdAt')
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
