import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import Message from '@/models/Message'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1, 'Message cannot be empty'),
  model: z.string().optional().default('openai-fast'),
})

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { conversationId, content, model = 'openai-fast' } = sendMessageSchema.parse(body)

    const pollinationsKey = process.env.POLLINATIONS_API_KEY
    if (!pollinationsKey) {
      return Response.json(
        { error: 'Pollinations API key not configured' },
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

          console.log(`Calling Pollinations Gateway with model: ${model || 'openai'}`)

          const pollinationsResponse = await fetch(
            'https://gen.pollinations.ai/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${pollinationsKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: model || 'openai',
                messages: [
                  { role: 'system', content: 'You are a helpful AI assistant. Provide concise and accurate responses.' },
                  ...messages
                ],
                max_tokens: 1000,
                temperature: 0.7,
                stream: true,
              }),
            }
          )

          if (!pollinationsResponse.ok) {
            const errorText = await pollinationsResponse.text()
            console.error('Pollinations API error:', errorText)
            let errorMessage = errorText
            try {
              const errorData = JSON.parse(errorText)
              errorMessage = errorData.error?.message || errorData.error || errorText
            } catch (e) {}
            
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: `Pollinations API error: ${errorMessage}` })}\n\n`
              )
            )
            controller.close()
            return
          }

          const reader = pollinationsResponse.body.getReader()
          let assistantText = ''
          let streamBuffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            streamBuffer += new TextDecoder().decode(value, { stream: true })
            const lines = streamBuffer.split('\n')
            streamBuffer = lines.pop() || ''

            for (const line of lines) {
              const trimmedLine = line.trim()
              if (!trimmedLine || trimmedLine === 'data: [DONE]') continue
              
              if (trimmedLine.startsWith('data: ')) {
                try {
                  const data = trimmedLine.slice(6)
                  if (data === '[DONE]') continue
                  
                  const parsed = JSON.parse(data)
                  const delta = parsed.choices?.[0]?.delta?.content
                  if (delta) {
                    assistantText += delta
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
                    )
                  }
                } catch (e) {
                  // Partial JSON, will be handled in next chunk or ignored if invalid
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
