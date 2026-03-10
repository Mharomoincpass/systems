import { getAuthUser } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const FREE_MODELS = [
  'openai',
  'openai-fast',
  'openai-large',
  'mistral',
  'gemini',
  'gemini-search',
  'qwen-coder',
]

const PREMIUM_FEATURES = ['image-gen', 'video-gen', 'audio-gen', 'image-to-video']

function isMediaGenerationRequest(text = '') {
  const q = text.toLowerCase()
  const patterns = [
    /\b(generate|create|make|produce|render)\b.*\b(image|photo|picture|art|illustration)\b/,
    /\b(generate|create|make|produce|render)\b.*\b(video|clip|animation|movie|reel)\b/,
    /\b(generate|create|make|compose|produce)\b.*\b(audio|music|song|beat|voiceover|voice over|speech)\b/,
    /\btext\s*to\s*speech\b|\btts\b/,
    /\btranscribe\b.*\b(audio|voice|speech)\b/,
    /\bimage\s*to\s*video\b|\banimate\b.*\bimage\b/,
  ]
  return patterns.some((re) => re.test(q))
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { content, model = 'openai-fast', messages: clientMessages = [], feature, attachments = [], audioAttachments = [] } = body
    const authUser = await getAuthUser(request)

    if (feature && PREMIUM_FEATURES.includes(feature)) {
      if (!authUser) {
        return Response.json(
          { error: 'signup_required', message: 'Sign up to use this feature' },
          { status: 401 }
        )
      }
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return Response.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    // Public chat supports text chat only. Media generation requires login.
    if (!authUser && (isMediaGenerationRequest(content) || (Array.isArray(attachments) && attachments.length > 0) || (Array.isArray(audioAttachments) && audioAttachments.length > 0))) {
      return Response.json(
        {
          error: 'signup_required',
          message: 'Image, video, and audio generation are available only for logged-in users.',
        },
        { status: 401 }
      )
    }

    if (content.length > 4000) {
      return Response.json({ error: 'Message too long (max 4000 characters)' }, { status: 400 })
    }

    const selectedModel = FREE_MODELS.includes(model) ? model : 'openai-fast'

    const contextMessages = (clientMessages || [])
      .slice(-10)
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({ role: msg.role, content: typeof msg.content === 'string' ? msg.content.slice(0, 2000) : '' }))

    contextMessages.push({ role: 'user', content: content.trim() })

    const pollinationsKey = process.env.POLLINATIONS_API_KEY
    const headers = { 'Content-Type': 'application/json' }
    if (pollinationsKey) {
      headers['Authorization'] = `Bearer ${pollinationsKey}`
    }

    const encoder = new TextEncoder()
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          const pollinationsResponse = await fetch(
            'https://gen.pollinations.ai/v1/chat/completions',
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                model: selectedModel,
                messages: [
                  {
                    role: 'system',
                    content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses. Format your responses using markdown when appropriate for readability.',
                  },
                  ...contextMessages,
                ],
                max_tokens: 2000,
                temperature: 0.7,
                stream: true,
              }),
            }
          )

          if (!pollinationsResponse.ok) {
            const errorText = await pollinationsResponse.text()
            let errorMessage = 'AI service temporarily unavailable'
            try {
              const errorData = JSON.parse(errorText)
              errorMessage = errorData.error?.message || errorData.error || errorMessage
            } catch {}

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
            )
            controller.close()
            return
          }

          const reader = pollinationsResponse.body.getReader()
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
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
                    )
                  }
                } catch {}
              }
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          controller.close()
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message || 'Something went wrong' })}\n\n`
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
    return Response.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
