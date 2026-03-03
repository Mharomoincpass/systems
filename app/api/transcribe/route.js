import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { rateLimitGenerate } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minute timeout for transcription

const transcribeAudioSchema = z.object({
  audioUrl: z.string().url('Must be a valid audio URL or data URL'),
})

export async function POST(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    const rl = rateLimitGenerate(auth.user.userId)
    if (!rl.allowed) {
      return Response.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const { audioUrl } = transcribeAudioSchema.parse(body)

    const pollinationsKey = process.env.POLLINATIONS_API_KEY
    if (!pollinationsKey) {
      return Response.json(
        { error: 'API key not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    console.log(`🎙️ Transcribing audio...`)

    // For Pollinations API, we need the audio as a publicly accessible URL
    // If it's a data URL, we need to handle it differently
    let audioUrlForApi = audioUrl
    
    if (audioUrl.startsWith('data:')) {
      // For base64 audio, we'll need to upload them to a temporary storage
      // For now, return an error asking for URL instead
      return Response.json(
        {
          error: 'Please provide a publicly accessible audio URL. Base64 audio not yet supported.',
          details: 'The API requires public audio URLs for transcription.',
        },
        { status: 400 }
      )
    }

    console.log(`📡 Downloading source audio...`)

    const sourceAudioResponse = await fetch(audioUrlForApi)
    if (!sourceAudioResponse.ok) {
      return Response.json(
        { error: 'Failed to fetch source audio from URL.' },
        { status: 400 }
      )
    }

    const sourceContentType = sourceAudioResponse.headers.get('content-type') || 'audio/mpeg'
    const sourceBuffer = await sourceAudioResponse.arrayBuffer()

    const blob = new Blob([sourceBuffer], { type: sourceContentType })
    const formData = new FormData()
    formData.append('file', blob, 'audio-input.mp3')
    formData.append('model', 'whisper-1')

    console.log(`📡 Calling Pollinations transcription API...`)

    const response = await fetch('https://gen.pollinations.ai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pollinationsKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Pollinations API error: ${response.status} ${errorText}`)
      
      if (response.status === 402) {
        return Response.json(
          { error: 'Insufficient credits. Please add more credits.' },
          { status: 402 }
        )
      }
      
      return Response.json(
        {
          error: `Transcription failed: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      )
    }

    // Get transcription result (log raw response for debugging)
    const contentType = response.headers.get('content-type') || 'unknown'
    const rawBody = await response.text()

    console.log('🧪 Transcribe provider response:', {
      status: response.status,
      contentType,
      preview: rawBody.slice(0, 500),
    })

    let data = null
    try {
      data = JSON.parse(rawBody)
    } catch {
      return Response.json(
        {
          error: 'Unexpected transcription response format from provider.',
          details: rawBody.slice(0, 200),
        },
        { status: 502 }
      )
    }

    console.log(`✅ Transcription completed successfully`)

    return Response.json(
      {
        success: true,
        transcription: {
          text: data.text || data.transcription || '',
          language: data.language || 'auto',
          generatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('❌ Transcription error:', error)
    return Response.json(
      {
        error: error.message || 'Failed to transcribe audio',
      },
      { status: 500 }
    )
  }
}
