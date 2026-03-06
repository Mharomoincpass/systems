import { z } from 'zod'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth-helpers'
import { rateLimitGenerate } from '@/lib/rate-limit'
import { uploadBlob, generateBlobPath, checkStorageQuota } from '@/lib/azure-storage'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minute timeout for video generation
const VIDEO_PROVIDER_TIMEOUT_MS = Number(process.env.VIDEO_PROVIDER_TIMEOUT_MS || 150000)

const generateVideoSchema = z
  .object({
    prompt: z.string().trim().optional(),
    imageUrl: z.string().url().optional(),
    model: z.string().optional().default('grok-video'),
    duration: z.number().min(2).max(10).optional().default(5),
    aspectRatio: z.enum(['16:9', '9:16']).optional(),
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
    const effectiveAspectRatio = aspectRatio || (imageUrl ? '9:16' : '16:9')

    console.log(`🎬 Generating video with model: ${model}`)
    if (prompt) {
      console.log(`📝 Prompt: ${effectivePrompt.substring(0, 50)}...`)
    }
    if (imageUrl) {
      console.log(`🖼️ Image input: ${imageUrl.substring(0, 80)}...`)
    }

    const callPollinationsVideo = async (candidateModel, candidateImageUrl = null, candidatePrompt = effectivePrompt) => {
      const encodedPrompt = encodeURIComponent(candidatePrompt)
      const params = new URLSearchParams({
        model: candidateModel,
        duration: String(duration),
        aspectRatio: effectiveAspectRatio,
        seed: '-1',
      })

      if (candidateImageUrl) {
        params.set('image', candidateImageUrl)
      }

      const apiUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`

      if (VIDEO_PROVIDER_TIMEOUT_MS > 0) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), VIDEO_PROVIDER_TIMEOUT_MS)

        try {
          return await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${pollinationsKey}`,
            },
            signal: controller.signal,
          })
        } finally {
          clearTimeout(timeoutId)
        }
      }

      return fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${pollinationsKey}`,
        },
      })
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    const tryVideoAttempt = async ({ candidateModel, candidateImageUrl, candidatePrompt }) => {
      try {
        const response = await callPollinationsVideo(candidateModel, candidateImageUrl, candidatePrompt)
        return { ok: response.ok, response, errorText: response.ok ? null : await response.text(), modelUsed: candidateModel }
      } catch (err) {
        const isTimeout = err?.name === 'AbortError'
        const causeCode = err?.cause?.code || err?.code || null
        const causeMessage = err?.cause?.message || err?.message || 'Unknown fetch error'
        const transientNetworkCodes = new Set(['ECONNRESET', 'UND_ERR_CONNECT_TIMEOUT', 'ETIMEDOUT', 'ECONNREFUSED', 'EAI_AGAIN'])

        if (!isTimeout && causeCode && transientNetworkCodes.has(causeCode)) {
          try {
            await sleep(1200)
            const retryResponse = await callPollinationsVideo(candidateModel, candidateImageUrl, candidatePrompt)
            return {
              ok: retryResponse.ok,
              response: retryResponse,
              errorText: retryResponse.ok ? null : await retryResponse.text(),
              modelUsed: candidateModel,
            }
          } catch (retryErr) {
            const retryCode = retryErr?.cause?.code || retryErr?.code || 'UNKNOWN'
            const retryMessage = retryErr?.cause?.message || retryErr?.message || 'Unknown retry fetch error'
            return {
              ok: false,
              response: null,
              errorText: `Network failure (${causeCode}): ${causeMessage}. Retry failed (${retryCode}): ${retryMessage}`,
              modelUsed: candidateModel,
            }
          }
        }

        return {
          ok: false,
          response: null,
          errorText: isTimeout
            ? `Provider timeout after ${Math.floor(VIDEO_PROVIDER_TIMEOUT_MS / 1000)}s`
            : (causeCode ? `Network failure (${causeCode}): ${causeMessage}` : causeMessage),
          modelUsed: candidateModel,
        }
      }
    }

    const buildModelCandidates = () => ['grok-video']

    const isProviderInternalVideoError = (status, text) => {
      const payload = String(text || '').toLowerCase()
      return status === 500 && (payload.includes('grok-imagine-video') || payload.includes('provider error (400 bad request)'))
    }

    console.log(`📡 Calling Pollinations API...`)

    const modelCandidates = buildModelCandidates()
    const attemptErrors = []
    let finalResponse = null
    let usedPromptOnlyFallback = false
    let usedModel = 'grok-video'

    for (const candidateModel of modelCandidates) {
      const primaryAttempt = await tryVideoAttempt({
        candidateModel,
        candidateImageUrl: imageUrl || null,
        candidatePrompt: effectivePrompt,
      })

      if (primaryAttempt.ok) {
        finalResponse = primaryAttempt.response
        usedModel = candidateModel
        break
      }

      const primaryStatus = primaryAttempt.response?.status
      attemptErrors.push({
        model: candidateModel,
        mode: imageUrl ? 'image-conditioned' : 'prompt-only',
        status: primaryStatus || 500,
        details: primaryAttempt.errorText,
      })

      if (primaryStatus === 402) {
        return Response.json(
          { error: 'Insufficient credits. Please add more credits.' },
          { status: 402 }
        )
      }

      const shouldRetryPromptOnly = Boolean(imageUrl) && (!primaryStatus || primaryStatus >= 400)
      if (shouldRetryPromptOnly) {
        const fallbackPrompt = `${effectivePrompt} vertical cinematic social video`
        console.log(`↩️ Retrying ${candidateModel} without image conditioning...`)
        const promptOnlyAttempt = await tryVideoAttempt({
          candidateModel,
          candidateImageUrl: null,
          candidatePrompt: fallbackPrompt,
        })

        if (promptOnlyAttempt.ok) {
          finalResponse = promptOnlyAttempt.response
          usedPromptOnlyFallback = true
          usedModel = candidateModel
          break
        }

        const promptOnlyStatus = promptOnlyAttempt.response?.status
        attemptErrors.push({
          model: candidateModel,
          mode: 'prompt-only',
          status: promptOnlyStatus || 500,
          details: promptOnlyAttempt.errorText,
        })

        if (promptOnlyStatus === 402) {
          return Response.json(
            { error: 'Insufficient credits. Please add more credits.' },
            { status: 402 }
          )
        }

        if (!imageUrl && isProviderInternalVideoError(promptOnlyStatus, promptOnlyAttempt.errorText)) {
          continue
        }
      }
    }

    if (!finalResponse) {
      const lastError = attemptErrors[attemptErrors.length - 1]
      console.error('❌ Video provider attempts failed:', JSON.stringify(attemptErrors, null, 2))
      return Response.json(
        {
          error: 'Video generation failed across all provider attempts.',
          details: attemptErrors,
          hint: VIDEO_PROVIDER_TIMEOUT_MS > 0
            ? `Upstream video provider did not complete in time. Try a shorter prompt, retry later, or increase VIDEO_PROVIDER_TIMEOUT_MS (current: ${VIDEO_PROVIDER_TIMEOUT_MS}ms).`
            : 'Upstream video provider is currently rejecting requests. Try again later or use a different prompt.',
        },
        { status: lastError?.status || 500 }
      )
    }

    const response = finalResponse

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
          model: usedModel,
          blobUrl: uploaded.url,
          blobPath: uploaded.blobPath,
          fileSize: uploaded.fileSize,
          mimeType: 'video/mp4',
          metadata: {
            duration,
            aspectRatio: effectiveAspectRatio,
            imageUrl: usedPromptOnlyFallback ? null : (imageUrl || null),
            retryMode: usedPromptOnlyFallback ? 'prompt-only' : null,
          },
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
          imageUrl: usedPromptOnlyFallback ? null : (imageUrl || null),
          model: usedModel,
          duration,
          aspectRatio: effectiveAspectRatio,
          retryMode: usedPromptOnlyFallback ? 'prompt-only' : null,
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
