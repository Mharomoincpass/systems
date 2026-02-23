import { z } from 'zod'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minute timeout for video generation

const generateVideoSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required for video generation'),
  model: z.string().optional().default('seedance'),
  duration: z.number().min(2).max(10).optional().default(5),
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { prompt, model, duration } = generateVideoSchema.parse(body)

    const pollinationsKey = process.env.POLLINATIONS_API_KEY
    if (!pollinationsKey) {
      return Response.json(
        { error: 'API key not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    console.log(`🎬 Generating video from text with model: ${model}`)
    console.log(`📝 Prompt: ${prompt.substring(0, 50)}...`)

    // Build Pollinations API URL
    const encodedPrompt = encodeURIComponent(prompt)
    const apiUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=${model}&duration=${duration}&aspectRatio=16:9&seed=-1`

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
          error: `Video generation failed: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      )
    }

    // Get video blob from response
    const videoBlob = await response.blob()
    
    // Convert to base64 for frontend
    const buffer = await videoBlob.arrayBuffer()
    const base64Video = Buffer.from(buffer).toString('base64')
    const videoDataUrl = `data:video/mp4;base64,${base64Video}`

    console.log(`✅ Video generated successfully (${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB)`)

    return Response.json(
      {
        success: true,
        video: {
          url: videoDataUrl,
          prompt,
          model,
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

    console.error('❌ Video generation error:', error)
    return Response.json(
      {
        error: error.message || 'Failed to generate video',
      },
      { status: 500 }
    )
  }
}
