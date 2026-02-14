import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minute timeout for music generation

const generateMusicSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters'),
  duration: z.number().min(5).max(60).optional().default(30),
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { prompt, duration } = generateMusicSchema.parse(body)

    const pollinationsKey = process.env.POLLINATIONS_API_KEY
    if (!pollinationsKey) {
      return Response.json(
        { error: 'API key not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    console.log(`🎵 Generating music with prompt: ${prompt.substring(0, 50)}...`)
    console.log(`⏱️ Duration: ${duration}s`)

    // Build Pollinations API URL for music generation
    const encodedPrompt = encodeURIComponent(prompt)
    const apiUrl = `https://gen.pollinations.ai/audio/${encodedPrompt}?model=elevenmusic&duration=${duration}&seed=-1`

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
          error: `Music generation failed: ${response.statusText}`,
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

    console.log(`✅ Music generated successfully (${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB)`)

    return Response.json(
      {
        success: true,
        audio: {
          url: audioDataUrl,
          prompt,
          duration,
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

    console.error('❌ Music generation error:', error)
    return Response.json(
      {
        error: error.message || 'Failed to generate music',
      },
      { status: 500 }
    )
  }
}
