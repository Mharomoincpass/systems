import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 1 minute timeout

const generateSpeechSchema = z.object({
  text: z.string().min(1, 'Text is required').max(5000, 'Text must be less than 5000 characters'),
  voice: z.string().optional().default('rachel'),
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { text, voice } = generateSpeechSchema.parse(body)

    const pollinationsKey = process.env.POLLINATIONS_API_KEY
    if (!pollinationsKey) {
      return Response.json(
        { error: 'API key not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    console.log(`🔊 Generating speech for ${text.length} characters with voice: ${voice}`)

    // Build Pollinations API URL for TTS
    const encodedText = encodeURIComponent(text)
    const apiUrl = `https://gen.pollinations.ai/audio/${encodedText}?model=elevenlabs&voice=${voice}&seed=-1`

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
          error: `Speech generation failed: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      )
    }

    // Get audio blob from response
    const audioBlob = await response.blob()
    
    // Convert to base64 for frontend
    const buffer = await audioBlob.arrayBuffer()
    const base64Audio = Buffer.from(buffer).toString('base64')
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`

    console.log(`✅ Speech generated successfully (${(buffer.byteLength / 1024).toFixed(2)}KB)`)

    return Response.json(
      {
        success: true,
        audio: {
          url: audioDataUrl,
          text,
          voice,
          characterCount: text.length,
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

    console.error('❌ Speech generation error:', error)
    return Response.json(
      {
        error: error.message || 'Failed to generate speech',
      },
      { status: 500 }
    )
  }
}
