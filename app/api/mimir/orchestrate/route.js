import { requireAuth } from '@/lib/auth-helpers'
import { rateLimit } from '@/lib/rate-limit'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import User from '@/models/User'
import { uploadBlob, generateBlobPath, checkStorageQuota } from '@/lib/azure-storage'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// ─── SSE helper ───────────────────────────────────────────────
function sseEvent(encoder, type, data) {
  return encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`)
}

function cleanText(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function normalizePlan(plan, topic) {
  const safeTopic = cleanText(topic) || 'your topic'

  const normalized = {
    hook: cleanText(plan?.hook),
    script: cleanText(plan?.script),
    imagePrompt: cleanText(plan?.imagePrompt || plan?.visualDescription || plan?.visualPrompt),
    videoPrompt: cleanText(plan?.videoPrompt || plan?.videoDirection),
    musicPrompt: cleanText(plan?.musicPrompt || plan?.musicMood),
    narrationText: cleanText(plan?.narrationText || plan?.script),
    voice: cleanText(plan?.voice) || 'rachel',
  }

  if (!normalized.hook) normalized.hook = `The surprising truth about ${safeTopic}`
  if (!normalized.script) {
    normalized.script = `Here is a quick, practical take on ${safeTopic}. Start with the biggest misconception, show one clear example, then give one actionable takeaway viewers can use today.`
  }
  if (!normalized.imagePrompt) {
    normalized.imagePrompt = `UGC Instagram reel influencer portrait about ${safeTopic}, confident expression, modern lifestyle setting, cinematic natural lighting, shallow depth of field, realistic skin texture, vertical 9:16 composition.`
  }
  if (!normalized.videoPrompt) {
    normalized.videoPrompt = `Vertical 9:16 cinematic motion for a UGC reel about ${safeTopic}, smooth push-in, subtle handheld feel, dynamic cut points, natural transitions, social-ready pacing.`
  }
  if (!normalized.musicPrompt) {
    normalized.musicPrompt = `Upbeat motivational background music for ${safeTopic} reel`
  }
  if (normalized.musicPrompt.length < 5) {
    normalized.musicPrompt = `${normalized.musicPrompt} background music for reel`
  }
  if (!normalized.narrationText) normalized.narrationText = normalized.script

  return normalized
}

function parsePlanFromSections(rawText) {
  const sectionMap = {
    hook: 'hook',
    script: 'script',
    'visual description': 'imagePrompt',
    'image prompt': 'imagePrompt',
    'visual prompt': 'imagePrompt',
    'video direction': 'videoPrompt',
    'video prompt': 'videoPrompt',
    'music mood': 'musicPrompt',
    'music prompt': 'musicPrompt',
    narration: 'narrationText',
    'narration text': 'narrationText',
    voice: 'voice',
  }

  const lines = rawText.split('\n')
  const collected = {}
  let currentKey = null

  for (const line of lines) {
    const headerMatch = line.match(/^\s*(?:\*\*)?\s*([a-zA-Z ]+?)\s*(?:\*\*)?\s*:\s*(.*)$/)
    if (headerMatch) {
      const rawHeader = headerMatch[1].toLowerCase().trim()
      const mappedKey = sectionMap[rawHeader]
      if (mappedKey) {
        currentKey = mappedKey
        collected[currentKey] = (collected[currentKey] || '') + (headerMatch[2] || '')
        continue
      }
    }

    if (currentKey) {
      collected[currentKey] = `${collected[currentKey] || ''}\n${line}`
    }
  }

  return collected
}

function parsePlan(rawText, topic) {
  const trimmed = (rawText || '').trim()
  if (!trimmed) return null

  let parsed = null

  try {
    parsed = JSON.parse(trimmed)
  } catch {
    parsed = null
  }

  if (!parsed) {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    if (fenced?.[1]) {
      try {
        parsed = JSON.parse(fenced[1].trim())
      } catch {
        parsed = null
      }
    }
  }

  if (!parsed) {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (jsonMatch?.[0]) {
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch {
        parsed = null
      }
    }
  }

  if (!parsed) {
    parsed = parsePlanFromSections(trimmed)
  }

  return normalizePlan(parsed, topic)
}

function buildFallbackPlan(topic) {
  return normalizePlan({}, topic)
}

// ─── Pollinations chat (non-streaming, returns full text) ─────
async function llmPlan(apiKey, topic) {
  const systemPrompt = `You are a UGC Instagram Reels planner. Given a topic, output ONLY valid JSON (no markdown, no explanation) with this exact shape:
{
  "hook": "attention-grabbing first 3 seconds text",
  "script": "full spoken script under 150 words for 30-60s reel",
  "imagePrompt": "specific visual description for AI image generation - appearance, setting, lighting, style, vertical 9:16",
  "videoPrompt": "camera movement and visual transition description for video generation",
  "musicPrompt": "background music mood, genre, tempo description (min 5 chars)",
  "narrationText": "clean narration text for TTS, no stage directions",
  "voice": "rachel"
}
Keep everything concise and production-ready. The imagePrompt should be a single-paragraph visual scene description.`

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Create a complete Instagram Reel plan for: "${topic}"` },
  ]

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const res = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai',
        messages,
        max_tokens: 800,
        temperature: attempt === 0 ? 0.3 : 0,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      if (attempt === 1) {
        throw new Error(`LLM planning failed (${res.status}): ${errText.slice(0, 200)}`)
      }
      continue
    }

    const json = await res.json()
    const raw = json.choices?.[0]?.message?.content || ''
    const parsedPlan = parsePlan(raw, topic)

    if (parsedPlan) {
      return parsedPlan
    }

    messages.push({
      role: 'assistant',
      content: raw,
    })
    messages.push({
      role: 'user',
      content: 'Convert your previous answer into ONLY valid JSON with exactly these keys: hook, script, imagePrompt, videoPrompt, musicPrompt, narrationText, voice. Do not include markdown.',
    })
  }

  return buildFallbackPlan(topic)
}

// ─── Tool runners (call Pollinations directly, skip auth/rate-limit layer) ───

async function runImageGeneration(apiKey, prompt) {
  const encodedPrompt = encodeURIComponent(prompt)
  const params = new URLSearchParams({
    model: 'flux',
    width: '576',
    height: '1024',
    nologo: 'true',
    seed: '-1',
  })

  const res = await fetch(
    `https://gen.pollinations.ai/image/${encodedPrompt}?${params}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Image generation failed (${res.status}): ${errText.slice(0, 200)}`)
  }

  const blob = await res.blob()
  const buffer = await blob.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return {
    url: `data:image/png;base64,${base64}`,
    buffer: Buffer.from(buffer),
    model: 'flux',
    width: 576,
    height: 1024,
  }
}

async function runVideoGeneration(apiKey, prompt, imageUrl) {
  const effectivePrompt = cleanText(prompt || 'Cinematic motion, smooth camera movement').slice(0, 260)
  const uniqueCandidates = ['grok-video']

  for (const candidateModel of uniqueCandidates) {
    const encodedPrompt = encodeURIComponent(effectivePrompt)
    const params = new URLSearchParams({
      model: candidateModel,
      duration: '5',
      aspectRatio: '9:16',
      seed: '-1',
    })

    if (imageUrl && !imageUrl.startsWith('data:')) {
      params.set('image', imageUrl)
    }

    const res = await fetch(
      `https://gen.pollinations.ai/image/${encodedPrompt}?${params}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    )

    if (res.ok) {
      const blob = await res.blob()
      const buffer = await blob.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      return {
        url: `data:video/mp4;base64,${base64}`,
        buffer: Buffer.from(buffer),
        model: candidateModel,
        duration: 5,
        aspectRatio: '9:16',
      }
    }

    const errText = await res.text()
    const shouldTryNextModel = res.status === 400 || res.status === 500
    if (!shouldTryNextModel || candidateModel === uniqueCandidates[uniqueCandidates.length - 1]) {
      throw new Error(`Video generation failed (${res.status}): ${errText.slice(0, 250)}`)
    }
  }

  throw new Error('Video generation failed across all fallback models')
}

async function runMusicGeneration(apiKey, prompt, duration = 15) {
  const encodedPrompt = encodeURIComponent(prompt)
  const res = await fetch(
    `https://gen.pollinations.ai/audio/${encodedPrompt}?model=elevenmusic&duration=${duration}&seed=-1`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Music generation failed (${res.status}): ${errText.slice(0, 200)}`)
  }

  const blob = await res.blob()
  const buffer = await blob.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return {
    url: `data:audio/mpeg;base64,${base64}`,
    buffer: Buffer.from(buffer),
    duration,
  }
}

async function runVoiceover(apiKey, text, voice = 'rachel') {
  const encodedText = encodeURIComponent(text)
  const res = await fetch(
    `https://gen.pollinations.ai/audio/${encodedText}?model=elevenlabs&voice=${voice}&seed=-1`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Voiceover generation failed (${res.status}): ${errText.slice(0, 200)}`)
  }

  const blob = await res.blob()
  const buffer = await blob.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return {
    url: `data:audio/mpeg;base64,${base64}`,
    buffer: Buffer.from(buffer),
    characterCount: text.length,
    voice,
  }
}

// ─── Save media to Azure + DB ────────────────────────────────
async function saveMedia(userId, type, ext, mime, bufferNode, prompt, model, metadata) {
  try {
    await connectDB()
    const user = await User.findById(userId)
    const quotaCheck =
      user?.role === 'admin'
        ? { allowed: true }
        : checkStorageQuota(user.storageUsed, user.storageLimit, bufferNode.length)

    if (quotaCheck.allowed) {
      const blobPath = generateBlobPath(userId, type, ext)
      const uploaded = await uploadBlob(bufferNode, mime, blobPath)
      await Media.create({
        userId,
        type,
        prompt: typeof prompt === 'string' ? prompt.substring(0, 500) : '',
        model: model || 'mimir-mcp',
        blobUrl: uploaded.url,
        blobPath: uploaded.blobPath,
        fileSize: uploaded.fileSize,
        mimeType: mime,
        metadata: { ...metadata, source: 'mimir-mcp' },
      })
      await User.findByIdAndUpdate(userId, { $inc: { storageUsed: uploaded.fileSize } })
      return uploaded.url
    }
  } catch (err) {
    console.error('Mimir media save error:', err)
  }
  return null
}

// ─── Main orchestrator ────────────────────────────────────────
export async function POST(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    const rl = rateLimit(`mimir:${auth.user.userId}`, 60 * 60 * 1000, 10)
    if (!rl.allowed) {
      return Response.json(
        { error: 'Rate limit exceeded. Maximum 10 Mimir runs per hour.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const topic = body?.topic?.trim()
    if (!topic || topic.length < 2) {
      return Response.json({ error: 'Please provide a topic (at least 2 characters).' }, { status: 400 })
    }

    const apiKey = process.env.POLLINATIONS_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'API key not configured.' }, { status: 500 })
    }

    const encoder = new TextEncoder()
    const userId = auth.user.userId

    const stream = new ReadableStream({
      async start(controller) {
        const emit = (type, data = {}) =>
          controller.enqueue(sseEvent(encoder, type, data))

        try {
          // ── Step 1: Plan ─────────────────────────────────
          emit('step', { step: 'plan', status: 'running', message: 'Agent is analyzing your topic and creating a production plan...' })

          let plan
          try {
            plan = await llmPlan(apiKey, topic)
            emit('step', { step: 'plan', status: 'done', message: 'Plan created successfully', plan })
          } catch (err) {
            emit('step', { step: 'plan', status: 'error', message: `Planning failed: ${err.message}` })
            emit('done', { success: false, error: err.message })
            return
          }

          // ── Step 2: Image ────────────────────────────────
          emit('step', {
            step: 'image',
            status: 'running',
            message: `Generating influencer image: "${plan.imagePrompt.substring(0, 60)}..."`,
          })

          let image
          try {
            image = await runImageGeneration(apiKey, plan.imagePrompt)
            const savedUrl = await saveMedia(
              userId, 'image', 'png', 'image/png', image.buffer,
              plan.imagePrompt, 'flux', { width: 576, height: 1024 }
            )
            image.savedUrl = savedUrl || null
            emit('step', {
              step: 'image',
              status: 'done',
              message: `Image generated (${image.width}×${image.height})`,
              asset: { url: savedUrl || image.url, width: image.width, height: image.height },
            })
          } catch (err) {
            emit('step', { step: 'image', status: 'error', message: `Image failed: ${err.message}` })
            // Continue — video can still be prompt-only
            image = null
          }

          // ── Step 3: Video ────────────────────────────────
          emit('step', {
            step: 'video',
            status: 'running',
            message: 'Generating video clip (this may take 1-3 minutes)...',
          })

          let video
          try {
            video = await runVideoGeneration(apiKey, plan.videoPrompt, image?.savedUrl)
            const savedUrl = await saveMedia(
              userId, 'video', 'mp4', 'video/mp4', video.buffer,
              plan.videoPrompt, 'grok-video', { duration: 5, aspectRatio: '9:16' }
            )
            emit('step', {
              step: 'video',
              status: 'done',
              message: `Video generated (${video.duration}s, ${video.aspectRatio})`,
              asset: { url: savedUrl || video.url, duration: video.duration, aspectRatio: video.aspectRatio },
            })
          } catch (err) {
            const firstError = err.message || 'Unknown video error'

            emit('step', {
              step: 'video',
              status: 'running',
              message: 'Primary video attempt failed; retrying with safer prompt-only mode...',
            })

            try {
              const fallbackPrompt = `Cinematic vertical UGC reel about ${topic}, smooth motion, social media style, high quality, 9:16`
              video = await runVideoGeneration(apiKey, fallbackPrompt, null)

              const savedUrl = await saveMedia(
                userId, 'video', 'mp4', 'video/mp4', video.buffer,
                fallbackPrompt, 'grok-video', { duration: 5, aspectRatio: '9:16', retryMode: 'prompt-only' }
              )

              emit('step', {
                step: 'video',
                status: 'done',
                message: `Video generated on retry (${video.duration}s, ${video.aspectRatio})`,
                asset: { url: savedUrl || video.url, duration: video.duration, aspectRatio: video.aspectRatio },
              })
            } catch (retryErr) {
              emit('step', {
                step: 'video',
                status: 'error',
                message: `Video failed after retry. First error: ${firstError}. Retry error: ${retryErr.message || 'Unknown retry error'}`,
              })
              video = null
            }
          }

          // ── Step 4 & 5: Music + Voiceover (parallel) ────
          emit('step', { step: 'music', status: 'running', message: `Generating background music: "${plan.musicPrompt.substring(0, 50)}..."` })
          emit('step', { step: 'voiceover', status: 'running', message: 'Generating voiceover narration...' })

          const [musicResult, voiceResult] = await Promise.allSettled([
            runMusicGeneration(apiKey, plan.musicPrompt, 15),
            runVoiceover(apiKey, plan.narrationText, plan.voice || 'rachel'),
          ])

          let music = null
          if (musicResult.status === 'fulfilled') {
            music = musicResult.value
            const savedUrl = await saveMedia(
              userId, 'audio', 'mp3', 'audio/mpeg', music.buffer,
              plan.musicPrompt, 'elevenmusic', { duration: 15, generationType: 'music' }
            )
            emit('step', {
              step: 'music',
              status: 'done',
              message: `Background music generated (${music.duration}s)`,
              asset: { url: savedUrl || music.url, duration: music.duration },
            })
          } else {
            emit('step', { step: 'music', status: 'error', message: `Music failed: ${musicResult.reason?.message}` })
          }

          let voiceover = null
          if (voiceResult.status === 'fulfilled') {
            voiceover = voiceResult.value
            const savedUrl = await saveMedia(
              userId, 'audio', 'mp3', 'audio/mpeg', voiceover.buffer,
              plan.narrationText.substring(0, 200), 'elevenlabs',
              { voice: voiceover.voice, characterCount: voiceover.characterCount, generationType: 'tts' }
            )
            emit('step', {
              step: 'voiceover',
              status: 'done',
              message: `Voiceover generated (${voiceover.characterCount} chars, voice: ${voiceover.voice})`,
              asset: { url: savedUrl || voiceover.url, voice: voiceover.voice, characterCount: voiceover.characterCount },
            })
          } else {
            emit('step', { step: 'voiceover', status: 'error', message: `Voiceover failed: ${voiceResult.reason?.message}` })
          }

          // ── Final result ─────────────────────────────────
          const assets = {
            plan,
            image: image ? { url: image.url, width: image.width, height: image.height } : null,
            video: video ? { url: video.url, duration: video.duration, aspectRatio: video.aspectRatio } : null,
            music: music ? { url: music.url, duration: music.duration } : null,
            voiceover: voiceover ? { url: voiceover.url, voice: voiceover.voice, characterCount: voiceover.characterCount } : null,
          }

          const completedSteps = [assets.image, assets.video, assets.music, assets.voiceover].filter(Boolean).length

          emit('done', {
            success: completedSteps >= 2,
            message: `Reel generation complete: ${completedSteps}/4 assets created successfully.`,
            assets,
          })
        } catch (err) {
          console.error('Mimir orchestrator error:', err)
          try {
            controller.enqueue(
              sseEvent(encoder, 'done', { success: false, error: err.message || 'Unexpected error' })
            )
          } catch {
            // controller may already be errored
          }
        } finally {
          try {
            controller.close()
          } catch {
            // already closed
          }
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Mimir route error:', err)
    return Response.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
