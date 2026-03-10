import connectDB from '@/lib/mongodb'
import Conversation from '@/models/Conversation'
import Message from '@/models/Message'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { rateLimitGenerate } from '@/lib/rate-limit'
import { getAgenticSystemPrompt, parseToolCall } from '@/lib/chat-tools'
import { generateImage, generateVideo, generateMusic, generateTTS, transcribeAudio } from '@/lib/generation-tools'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 min — video/music generation can be slow

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().or(z.string().optional()),
  model: z.string().optional().default('openai-fast'),
  attachments: z.array(z.string().url()).optional().default([]),
  audioAttachments: z.array(z.string().url()).optional().default([]),
})

const TOOL_EXECUTORS = {
  generate_image: generateImage,
  generate_video: generateVideo,
  generate_music: generateMusic,
  generate_tts: generateTTS,
  transcribe_audio: transcribeAudio,
}

const TOOL_MEDIA_TYPE = {
  generate_image: 'image',
  generate_video: 'video',
  generate_music: 'audio',
  generate_tts: 'audio',
  transcribe_audio: null, // text result, no media attachment
}

function buildConversationTitle(rawText) {
  const text = (rawText || '').replace(/\s+/g, ' ').trim()
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const timeLabel = `${hh}:${mm}`

  if (!text) return `Untitled ${timeLabel}`

  const maxBaseLength = 42
  const base = text.length > maxBaseLength ? `${text.slice(0, maxBaseLength).trim()}...` : text
  return `${base} - ${timeLabel}`
}

function inferDirectToolCall(userText, attachments = [], audioAttachments = []) {
  const text = (userText || '').trim()
  const q = text.toLowerCase()
  if (!text && audioAttachments.length > 0) {
    return {
      tool: 'transcribe_audio',
      params: { audioUrl: audioAttachments[0] },
      preface: 'Transcribing your uploaded audio now.',
    }
  }
  if (!text) return null

  const hasDirectGenerateVerb = /\b(generate|create|make|draw|render|compose)\b/.test(q)
  if (!hasDirectGenerateVerb) return null

  const imageIntent = /\b(image|photo|picture|art|illustration)\b/.test(q)
  const videoIntent = /\b(video|clip|animation|movie|reel)\b/.test(q)
  const musicIntent = /\b(music|song|beat|instrumental|audio track)\b/.test(q)
  const ttsIntent = /\b(text to speech|tts|voiceover|voice over|read this aloud|narrate)\b/.test(q)
  const transcribeIntent = /\b(transcribe|transcription|speech to text|audio to text|stt)\b/.test(q)

  if (imageIntent) {
    const oneToOne = /\b1:1\b|\bsquare\b/.test(q)
    return {
      tool: 'generate_image',
      params: {
        prompt: text,
        width: oneToOne ? 1024 : 1024,
        height: oneToOne ? 1024 : 768,
        ...(attachments.length > 0 ? { imageUrl: attachments[0] } : {}),
      },
      preface: attachments.length > 0
        ? 'Applying your uploaded image and generating a new variation now.'
        : 'Generating your image now.',
    }
  }

  if (videoIntent) {
    return {
      tool: 'generate_video',
      params: {
        prompt: text,
        ...(attachments.length > 0 ? { imageUrl: attachments[0] } : {}),
      },
      preface: 'Generating your video now.',
    }
  }

  if (musicIntent) {
    const durationMatch = q.match(/(\d{1,3})\s*(sec|second|seconds|s)\b/)
    const duration = durationMatch ? Number(durationMatch[1]) : 30
    return {
      tool: 'generate_music',
      params: { prompt: text, duration: Math.max(5, Math.min(duration, 60)) },
      preface: 'Composing your music now.',
    }
  }

  if (ttsIntent) {
    return {
      tool: 'generate_tts',
      params: { text },
      preface: 'Converting your text to speech now.',
    }
  }

  if (transcribeIntent && audioAttachments.length > 0) {
    return {
      tool: 'transcribe_audio',
      params: { audioUrl: audioAttachments[0] },
      preface: 'Transcribing your uploaded audio now.',
    }
  }

  return null
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    await connectDB()

    const body = await request.json()
    const { conversationId, content, model = 'openai-fast', attachments, audioAttachments } = sendMessageSchema.parse(body)

    if (!content?.trim() && attachments.length === 0 && audioAttachments.length === 0) {
      return Response.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    const pollinationsKey = process.env.POLLINATIONS_API_KEY
    if (!pollinationsKey) {
      return Response.json(
        { error: 'Pollinations API key not configured' },
        { status: 500 }
      )
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return Response.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Build user media attachments for the database
    const userMedia = [
      ...attachments.map((url) => ({
        type: 'image',
        url,
        prompt: 'User uploaded image',
        model: 'user',
        metadata: { source: 'upload' },
      })),
      ...audioAttachments.map((url) => ({
        type: 'audio',
        url,
        prompt: 'User uploaded audio',
        model: 'user',
        metadata: { source: 'upload' },
      })),
    ]

    const shouldAutoTitle = !conversation.title || conversation.title === 'New Chat'

    // Save user message
    const userMessage = new Message({ 
      conversationId, 
      content: content || '', 
      role: 'user',
      ...(userMedia.length > 0 ? { media: userMedia } : {})
    })
    await userMessage.save()
    conversation.messages.push(userMessage._id)

    // Give the conversation a unique, meaningful title from the first prompt.
    if (shouldAutoTitle) {
      conversation.title = buildConversationTitle(content)
    }

    await conversation.save()

    const encoder = new TextEncoder()
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          // Build conversation context with media awareness
          const messageHistory = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('content role media')
            .exec()

          const messages = messageHistory.reverse().map((msg) => {
            let msgContent = msg.content
            
            // Format for vision models if the user attached images
            if (msg.role === 'user' && msg.media && msg.media.length > 0) {
              const contentArray = [{ type: 'text', text: msgContent || 'Here is an image.' }]
              msg.media.forEach(m => {
                if (m.type === 'image') {
                  contentArray.push({ type: 'image_url', image_url: { url: m.url } })
                }
              })
              return { role: 'user', content: contentArray }
            }

            // Add media context so LLM knows what was previously generated
            if (msg.role === 'assistant' && msg.media && msg.media.length > 0) {
              const mediaSummaries = msg.media.map((m) => {
                if (m.type === 'image') return `[Generated image: "${m.prompt}" URL: ${m.url}]`
                if (m.type === 'video') return `[Generated video: "${m.prompt}"]`
                if (m.type === 'audio') return `[Generated audio: "${m.prompt}"]`
                return ''
              }).filter(Boolean).join(' ')
              if (mediaSummaries) {
                msgContent = msgContent + '\n' + mediaSummaries
              }
            }
            return { role: msg.role === 'user' ? 'user' : 'assistant', content: msgContent }
          })

          // Ensure current message is at the end
          const isCurrentMsgVision = attachments.length > 0
          const currentMsgObj = isCurrentMsgVision 
            ? { 
                role: 'user', 
                content: [
                  { type: 'text', text: content || 'Here is an image.' },
                  ...attachments.map(url => ({ type: 'image_url', image_url: { url } }))
                ] 
              }
            : { role: 'user', content: content || '' }

          // If the last history message matches our current content exactly, pop it to replace
          if (messages.length > 0 && typeof messages[messages.length - 1].content === 'string' && messages[messages.length - 1].content === content && !isCurrentMsgVision) {
             messages.pop()
          }
          messages.push(currentMsgObj)

          console.log(`🤖 Agentic chat — model: ${model || 'openai'} (Vision: ${isCurrentMsgVision})`)

          // Call LLM with agentic system prompt
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
                  { role: 'system', content: getAgenticSystemPrompt() },
                  ...messages,
                ],
                max_tokens: 2000,
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
            } catch {}
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: `AI error: ${errorMessage}` })}\n\n`)
            )
            controller.close()
            return
          }

          // ── Stream the LLM response ──
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
                    // Stream text to client but suppress <tool_call> tags from display
                    // We'll send the clean text; tool execution happens after stream ends
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
                    )
                  }
                } catch { /* partial JSON */ }
              }
            }
          }

          // ── Check if the LLM wants to call a tool ──
          const toolResult = parseToolCall(assistantText)
          let mediaAttachments = []
          let cleanContent = assistantText
          let resolvedToolCall = null

          if (toolResult) {
            const { textBefore, toolCall } = toolResult
            cleanContent = textBefore
            resolvedToolCall = toolCall

            // Re-send the clean text (without tool_call tags) to replace streamed content
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'replace_content', content: cleanContent })}\n\n`)
            )
          } else {
            // Fallback: if the model forgot the tool-call format but user intent is clear, execute directly.
            const inferredTool = inferDirectToolCall(content, attachments, audioAttachments)
            if (inferredTool) {
              resolvedToolCall = { tool: inferredTool.tool, params: inferredTool.params }
              cleanContent = inferredTool.preface
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'replace_content', content: cleanContent })}\n\n`)
              )
            }
          }

          if (resolvedToolCall) {

            // Notify client: tool execution starting
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'tool_start', tool: resolvedToolCall.tool, params: resolvedToolCall.params })}\n\n`)
            )

            // Rate limit check for generation
            const rl = rateLimitGenerate(auth.user.userId)
            if (!rl.allowed) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'tool_error',
                  tool: resolvedToolCall.tool,
                  error: 'Rate limit exceeded. Please wait before generating more content.',
                })}\n\n`)
              )
            } else {
              // Execute the tool
              const executor = TOOL_EXECUTORS[resolvedToolCall.tool]
              if (executor) {
                try {
                  // If video/image tool and user uploaded an image, auto-inject it if not specified.
                  if (resolvedToolCall.tool === 'generate_image' && attachments.length > 0 && !resolvedToolCall.params.imageUrl) {
                     resolvedToolCall.params.imageUrl = attachments[0]
                  }

                  // If video tool and user uploaded an image, auto-inject it if not specified
                  if (resolvedToolCall.tool === 'generate_video' && attachments.length > 0 && !resolvedToolCall.params.imageUrl) {
                     resolvedToolCall.params.imageUrl = attachments[0]
                  }

                  if (resolvedToolCall.tool === 'transcribe_audio' && audioAttachments.length > 0 && !resolvedToolCall.params.audioUrl) {
                    resolvedToolCall.params.audioUrl = audioAttachments[0]
                  }

                  console.log(`🔧 Executing tool: ${resolvedToolCall.tool}`, resolvedToolCall.params)
                  const result = await executor(auth.user.userId, resolvedToolCall.params)

                  const mediaType = TOOL_MEDIA_TYPE[resolvedToolCall.tool]
                  if (mediaType) {
                    mediaAttachments.push({
                      type: mediaType,
                      url: result.url,
                      prompt: result.prompt || result.text || '',
                      model: result.model || resolvedToolCall.tool,
                      metadata: result,
                    })
                  }

                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({
                      type: 'tool_result',
                      tool: resolvedToolCall.tool,
                      result,
                    })}\n\n`)
                  )
                  console.log(`✅ Tool ${resolvedToolCall.tool} completed successfully`)
                } catch (toolError) {
                  console.error(`❌ Tool ${resolvedToolCall.tool} failed:`, toolError.message)
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({
                      type: 'tool_error',
                      tool: resolvedToolCall.tool,
                      error: toolError.message,
                    })}\n\n`)
                  )
                }
              }
            }
          }

          // ── Save assistant message with media attachments ──
          const assistantContent = (cleanContent || '').trim() || (mediaAttachments.length > 0 ? 'Generated media attached.' : '')

          if (assistantContent || mediaAttachments.length > 0) {
            const assistantMessage = new Message({
              conversationId,
              content: assistantContent,
              role: 'assistant',
              ...(mediaAttachments.length > 0 ? { media: mediaAttachments } : {}),
            })
            await assistantMessage.save()
            conversation.messages.push(assistantMessage._id)
            await conversation.save()
          }

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`)
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
