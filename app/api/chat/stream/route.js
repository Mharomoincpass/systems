import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import Message from '@/models/Message'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1, 'Message cannot be empty'),
})

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { conversationId, content } = sendMessageSchema.parse(body)

    const hfToken = process.env.NEXT_PUBLIC_HF_TOKEN
    if (!hfToken) {
      return Response.json(
        { error: 'Hugging Face API token not configured' },
        { status: 500 }
      )
    }

    // Verify conversation exists
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return Response.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Save user message
    const userMessage = new Message({
      conversationId,
      content,
      role: 'user',
    })
    await userMessage.save()

    // Add to conversation
    conversation.messages.push(userMessage._id)
    await conversation.save()

    // Stream response from Hugging Face
    const encoder = new TextEncoder()
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          // Build conversation context
          const messageHistory = await Message.find({
            conversationId,
          })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('content role')
            .exec()

          const messages = messageHistory
            .reverse()
            .map((msg) => ({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content,
            }))

          // Add the current message if it's not already in history (though it should be)
          if (messages.length === 0 || messages[messages.length - 1].content !== content) {
             messages.push({ role: 'user', content })
          }

          console.log('Calling HF Router API (OpenAI Compatible)')

          const hfResponse = await fetch(
            'https://router.huggingface.co/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${hfToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'meta-llama/Llama-3.1-8B-Instruct',
                messages: [
                  { role: 'system', content: 'You are a helpful AI assistant. Provide concise and accurate responses.' },
                  ...messages
                ],
                max_tokens: 500,
                temperature: 0.7,
                stream: true,
              }),
            }
          )

          if (!hfResponse.ok) {
            const errorText = await hfResponse.text()
            console.error('HF API error:', errorText)
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: `HF API error: ${errorText}` })}\n\n`
              )
            )
            controller.close()
            return
          }

          const reader = hfResponse.body.getReader()
          let assistantText = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.trim() === 'data: [DONE]') {
                continue
              }
              if (line.startsWith('data: ')) {
                try {
                  const parsed = JSON.parse(line.slice(6))
                  const delta = parsed.choices?.[0]?.delta?.content
                  if (delta) {
                    assistantText += delta
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ content: delta })}\n\n`
                      )
                    )
                  }
                } catch (e) {
                  // Ignore parse errors for partial chunks
                }
              }
            }
          }

          // Save assistant message to database
          if (assistantText) {
            const assistantMessage = new Message({
              conversationId,
              content: assistantText,
              role: 'assistant',
            })
            await assistantMessage.save()
            conversation.messages.push(assistantMessage._id)
            await conversation.save()
          }

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Stream API error:', error)
    return Response.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    )
  }
}
