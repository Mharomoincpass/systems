import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const getMessagesSchema = z.object({
  conversationId: z.string(),
})

export async function GET(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    await connectDB()

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    const { conversationId: validatedId } = getMessagesSchema.parse({
      conversationId,
    })

    const messages = await Message.find({
      conversationId: validatedId,
    })
      .sort({ createdAt: 1 })
      .exec()

    return Response.json({
      success: true,
      messages: messages.map((msg) => ({
        _id: msg._id.toString(),
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt,
        ...(msg.media?.length > 0 ? { media: msg.media } : {}),
      })),
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return Response.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
