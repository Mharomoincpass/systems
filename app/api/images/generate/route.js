import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth-helpers'
import { rateLimitGenerate } from '@/lib/rate-limit'
import { uploadBlob, generateBlobPath, checkStorageQuota } from '@/lib/azure-storage'

export const dynamic = 'force-dynamic'

const generateImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(1000, 'Prompt too long'),
  model: z.string().optional().default('flux'),
  width: z.number().optional().default(512),
  height: z.number().optional().default(512),
  mode: z.enum(['text-to-image', 'image-to-image']).optional().default('text-to-image'),
})

const IMG2IMG_SUPPORTED_MODELS = new Set(['klein', 'klein-large', 'gptimage'])

export async function POST(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    const rl = rateLimitGenerate(auth.user.userId)
    if (!rl.allowed) {
      return Response.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
    }

    const contentType = request.headers.get('content-type') || ''
    let parsedBody
    let referenceImageFile = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      referenceImageFile = formData.get('referenceImage') || null
      parsedBody = {
        prompt: formData.get('prompt'),
        model: formData.get('model') || 'flux',
        width: Number(formData.get('width') || 512),
        height: Number(formData.get('height') || 512),
        mode: formData.get('mode') || 'text-to-image',
      }
    } else {
      parsedBody = await request.json()
    }

    const { prompt, model, width, height, mode } = generateImageSchema.parse(parsedBody)

    const pollinationsKey = process.env.POLLINATIONS_API_KEY
    if (!pollinationsKey) {
      return Response.json(
        { error: 'API key not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    console.log(`📸 Generating image with model: ${model}`)
    console.log(`📝 Prompt: ${prompt.substring(0, 50)}...`)

    let referenceImageUrl = ''
    if (mode === 'image-to-image') {
      if (!IMG2IMG_SUPPORTED_MODELS.has(model)) {
        return Response.json(
          { error: `Model '${model}' does not support image-to-image. Use klein, klein-large, or gptimage.` },
          { status: 400 }
        )
      }

      if (!referenceImageFile || typeof referenceImageFile === 'string') {
        return Response.json(
          { error: 'Reference image is required for image-to-image mode.' },
          { status: 400 }
        )
      }

      const maxBytes = 10 * 1024 * 1024
      if (referenceImageFile.size > maxBytes) {
        return Response.json(
          { error: 'Reference image must be 10MB or smaller.' },
          { status: 400 }
        )
      }

      const uploadFormData = new FormData()
      uploadFormData.append('file', referenceImageFile)

      const uploadResponse = await fetch('https://media.pollinations.ai/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pollinationsKey}`,
        },
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text()
        console.error(`❌ Pollinations media upload error: ${uploadResponse.status} ${uploadError}`)
        return Response.json(
          { error: 'Failed to upload reference image for image-to-image generation.' },
          { status: uploadResponse.status || 500 }
        )
      }

      const uploadResult = await uploadResponse.json()
      referenceImageUrl = uploadResult?.url || ''

      if (!referenceImageUrl) {
        return Response.json(
          { error: 'Reference image upload did not return a usable URL.' },
          { status: 500 }
        )
      }
    }

    // Build Pollinations API URL
    const encodedPrompt = encodeURIComponent(prompt)
    const params = new URLSearchParams({
      model,
      width: String(width),
      height: String(height),
      nologo: 'true',
      seed: '-1',
    })

    if (referenceImageUrl) {
      params.set('image', referenceImageUrl)
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

      let parsedError = null
      try {
        parsedError = JSON.parse(errorText)
      } catch (_) {
        parsedError = null
      }

      const nestedMessage =
        parsedError?.error?.message ||
        parsedError?.message ||
        errorText ||
        response.statusText

      const isContentPolicyBlock =
        response.status === 403 &&
        (
          String(nestedMessage).toLowerCase().includes('content policy') ||
          String(nestedMessage).toLowerCase().includes('temporarily blocked') ||
          String(nestedMessage).toLowerCase().includes('forbidden')
        )
      
      if (response.status === 402) {
        return Response.json(
          { error: 'Insufficient credits. Please add more credits.' },
          { status: 402 }
        )
      }

      if (isContentPolicyBlock) {
        const modelAdvice = mode === 'image-to-image'
          ? 'Try model `klein` or `klein-large`, and use a more specific edit prompt.'
          : 'Try rephrasing the prompt to be more specific and policy-safe.'

        return Response.json(
          {
            error: 'Request blocked by provider content policy for this prompt/model.',
            details: modelAdvice,
          },
          { status: 403 }
        )
      }

      return Response.json(
        {
          error: `Image generation failed: ${response.statusText || 'Provider error'}`,
          details: typeof nestedMessage === 'string' ? nestedMessage.slice(0, 300) : 'Upstream error',
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

    // Save to Azure Blob + Media record
    let savedMedia = null
    try {
      await connectDB()
      const user = await User.findById(auth.user.userId)
      const bufferNode = Buffer.from(buffer)
      const quotaCheck = user?.role === 'admin'
        ? { allowed: true }
        : checkStorageQuota(user.storageUsed, user.storageLimit, bufferNode.length)
      if (quotaCheck.allowed) {
        const blobPath = generateBlobPath(auth.user.userId, 'image', 'png')
        const uploaded = await uploadBlob(bufferNode, 'image/png', blobPath)
        savedMedia = await Media.create({
          userId: auth.user.userId,
          type: 'image',
          prompt,
          model,
          blobUrl: uploaded.url,
          blobPath: uploaded.blobPath,
          fileSize: uploaded.fileSize,
          mimeType: 'image/png',
          metadata: { width, height },
        })
        await User.findByIdAndUpdate(auth.user.userId, { $inc: { storageUsed: uploaded.fileSize } })
      }
    } catch (saveErr) {
      console.error('Media save error:', saveErr)
    }

    console.log(`✅ Image generated successfully (${(buffer.byteLength / 1024).toFixed(2)}KB)`)

    return Response.json(
      {
        success: true,
        image: {
          url: imageUrl,
          prompt,
          model,
          mode,
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
