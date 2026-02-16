import { z } from 'zod'
import { unlink } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minute timeout for video generation

const generateVideoSchema = z.object({
  imageUrl: z.string().url('Must be a valid image URL or data URL'),
  prompt: z.string().min(1, 'Prompt is required for video generation'),
  model: z.string().optional().default('LTX-2'),
  duration: z.number().min(2).max(10).optional().default(5),
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { imageUrl, prompt, model, duration } = generateVideoSchema.parse(body)

    const pollinationsKey = process.env.POLLINATIONS_API_KEY
    if (!pollinationsKey) {
      return Response.json(
        { error: 'API key not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    console.log(`🎬 Generating video from image with model: ${model}`)
    console.log(`📝 Prompt: ${prompt.substring(0, 50)}...`)

    // For Pollinations API, we need the image as a publicly accessible URL
    let imageUrlForApi = imageUrl
    let tempFilePath = null // Track temp file for cleanup
    
    if (imageUrl.startsWith('data:')) {
      // Upload base64 image to temporary storage and get public URL
      console.log('📤 Uploading base64 image to temporary storage...')
      
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/upload/temp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: imageUrl }),
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to temporary storage')
      }

      const uploadData = await uploadResponse.json()
      imageUrlForApi = uploadData.url
      
      // Extract filename from URL for cleanup
      const filename = uploadData.url.split('/').pop()
      tempFilePath = join(process.cwd(), 'public', 'temp', filename)
      
      console.log(`✅ Image uploaded: ${imageUrlForApi}`)
    }

    // Build Pollinations API URL
    const encodedPrompt = encodeURIComponent(prompt)
    const apiUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=${model}&image=${encodeURIComponent(imageUrlForApi)}&duration=${duration}&aspectRatio=16:9&seed=-1`

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
      
      // Cleanup temp file even on error
      if (tempFilePath) {
        try {
          await unlink(tempFilePath)
          console.log('🗑️ Cleaned up temporary image')
        } catch (cleanupError) {
          console.error('Failed to cleanup temp file:', cleanupError)
        }
      }
      
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

    // Cleanup temp file after successful generation
    if (tempFilePath) {
      try {
        await unlink(tempFilePath)
        console.log('🗑️ Cleaned up temporary image')
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError)
      }
    }

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
