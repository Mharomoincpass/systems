import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth-helpers'
import { rateLimitGenerate } from '@/lib/rate-limit'
import { uploadBlob, generateBlobPath, checkStorageQuota } from '@/lib/azure-storage'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minute timeout for video generation

const generateVideoSchema = z
  .object({
    prompt: z.string().trim().optional(),
    imageUrl: z.string().url().optional(),
    model: z.string().optional().default('grok-video'),
    duration: z.number().min(2).max(10).optional().default(5),
    aspectRatio: z.enum(['16:9', '9:16']).optional().default('16:9'),
  })
  .refine((data) => (data.prompt && data.prompt.length > 0) || Boolean(data.imageUrl), {
    message: 'Provide a prompt or an image URL for video generation',
    path: ['prompt'],
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
    const { prompt, imageUrl, model, duration, aspectRatio } = generateVideoSchema.parse(body)

    if (imageUrl) {
      try {
        const parsed = new URL(imageUrl)
        const host = parsed.hostname.toLowerCase()
        if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
          return Response.json(
            {
              error: 'Image URL must be publicly accessible. Localhost URLs cannot be reached by video providers.',
            },
            { status: 400 }
          )
        }
      } catch (_urlErr) {
      }
    }

    const pollinationsKey = process.env.POLLINATIONS_API_KEY
    if (!pollinationsKey) {
      return Response.json(
        { error: 'API key not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    const effectivePrompt = prompt?.trim() || 'Cinematic motion'

    console.log(`🎬 Generating video with model: ${model}`)
    if (prompt) {
      console.log(`📝 Prompt: ${effectivePrompt.substring(0, 50)}...`)
    }
    if (imageUrl) {
      console.log(`🖼️ Image input: ${imageUrl.substring(0, 80)}...`)
    }

    // Build Pollinations API URL
    const encodedPrompt = encodeURIComponent(effectivePrompt)
    const params = new URLSearchParams({
      model,
      duration: String(duration),
      aspectRatio,
      seed: '-1',
    })

    if (imageUrl) {
      params.set('image', imageUrl)
    }

    const apiUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`

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

    // Save to Azure Blob + Media record
    try {
      await connectDB()
      const user = await User.findById(auth.user.userId)
      const bufferNode = Buffer.from(buffer)
      const quotaCheck = user?.role === 'admin'
        ? { allowed: true }
        : checkStorageQuota(user.storageUsed, user.storageLimit, bufferNode.length)
      if (quotaCheck.allowed) {
        const blobPath = generateBlobPath(auth.user.userId, 'video', 'mp4')
        const uploaded = await uploadBlob(bufferNode, 'video/mp4', blobPath)
        await Media.create({
          userId: auth.user.userId,
          type: 'video',
          prompt: effectivePrompt,
          model,
          blobUrl: uploaded.url,
          blobPath: uploaded.blobPath,
          fileSize: uploaded.fileSize,
          mimeType: 'video/mp4',
          metadata: { duration, aspectRatio, imageUrl: imageUrl || null },
        })
        await User.findByIdAndUpdate(auth.user.userId, { $inc: { storageUsed: uploaded.fileSize } })
      }
    } catch (saveErr) {
      console.error('Media save error:', saveErr)
    }

    console.log(`✅ Video generated successfully (${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB)`)

    return Response.json(
      {
        success: true,
        video: {
          url: videoDataUrl,
          prompt: effectivePrompt,
          imageUrl: imageUrl || null,
          model,
          duration,
          aspectRatio,
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
