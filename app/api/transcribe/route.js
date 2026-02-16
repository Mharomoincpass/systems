import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minute timeout for transcription

const transcribeAudioSchema = z.object({
  audioUrl: z.string().url('Must be a valid audio URL or data URL'),
})

export async function POST(request) {
  try {
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

    // Build Pollinations API URL for transcription
    const apiUrl = `https://gen.pollinations.ai/audio/transcribe?model=whisper&url=${encodeURIComponent(audioUrlForApi)}`

    console.log(`📡 Calling Pollinations API...`)

    // Call Pollinations API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pollinationsKey}`,
      },
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

    // Get transcription result
    const data = await response.json()

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
