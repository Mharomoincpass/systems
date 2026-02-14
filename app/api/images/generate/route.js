import { z } from 'zod'

export const dynamic = 'force-dynamic'

const generateImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(1000, 'Prompt too long'),
  model: z.string().optional().default('flux'),
  width: z.number().optional().default(512),
  height: z.number().optional().default(512),
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { prompt, model, width, height } = generateImageSchema.parse(body)

    const pollinationsKey = process.env.POLLINATIONS_API_KEY
    if (!pollinationsKey) {
      return Response.json(
        { error: 'API key not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    console.log(`📸 Generating image with model: ${model}`)
    console.log(`📝 Prompt: ${prompt.substring(0, 50)}...`)

    // Build Pollinations API URL
    const encodedPrompt = encodeURIComponent(prompt)
    const apiUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=${model}&width=${width}&height=${height}&nologo=true&seed=-1`

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
          error: `Image generation failed: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      )
    }

    // Get image blob from response
    const imageBlob = await response.blob()
    
    // Convert blob to base64
    const buffer = await imageBlob.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString('base64')
    const imageUrl = `data:image/png;base64,${base64Image}`

    console.log(`✅ Image generated successfully (${(buffer.byteLength / 1024).toFixed(2)}KB)`)

    return Response.json(
      {
        success: true,
        image: {
          url: imageUrl,
          prompt,
          model,
          width,
          height,
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

    console.error('❌ Image generation error:', error)
    return Response.json(
      {
        error: error.message || 'Failed to generate image',
      },
      { status: 500 }
    )
  }
}
