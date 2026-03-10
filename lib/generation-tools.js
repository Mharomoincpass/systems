import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import User from '@/models/User'
import { uploadBlob, generateBlobPath, checkStorageQuota } from '@/lib/azure-storage'

/**
 * Shared generation utilities for the agentic chatbot.
 * Extracted from existing API routes to be callable from the chat stream handler.
 */

function getPollinationsKey() {
  const key = process.env.POLLINATIONS_API_KEY
  if (!key) throw new Error('POLLINATIONS_API_KEY not configured')
  return key
}

const IMG2IMG_SUPPORTED_MODELS = new Set(['klein', 'klein-large', 'gptimage'])

async function saveMedia(userId, { type, prompt, model, buffer, mimeType, extension, metadata }) {
  try {
    await connectDB()
    const user = await User.findById(userId)
    const quotaCheck = user?.role === 'admin'
      ? { allowed: true }
      : checkStorageQuota(user.storageUsed, user.storageLimit, buffer.length)

    if (!quotaCheck.allowed) {
      return { saved: false, reason: 'storage_quota_exceeded' }
    }

    const blobPath = generateBlobPath(userId, type, extension)
    const uploaded = await uploadBlob(buffer, mimeType, blobPath)
    await Media.create({
      userId,
      type,
      prompt: prompt?.substring(0, 500),
      model,
      blobUrl: uploaded.url,
      blobPath: uploaded.blobPath,
      fileSize: uploaded.fileSize,
      mimeType,
      metadata,
    })
    await User.findByIdAndUpdate(userId, { $inc: { storageUsed: uploaded.fileSize } })
    return { saved: true, url: uploaded.url, fileSize: uploaded.fileSize }
  } catch (err) {
    console.error('Media save error (chat tool):', err)
    return { saved: false, reason: 'save_error' }
  }
}

// ─── IMAGE GENERATION ────────────────────────────────────────────────
export async function generateImage(userId, { prompt, model = 'flux', width = 512, height = 512, imageUrl }) {
  const key = getPollinationsKey()
  const isImageToImage = Boolean(imageUrl)

  // Image-to-image only works reliably on these models.
  let effectiveModel = model
  if (isImageToImage && !IMG2IMG_SUPPORTED_MODELS.has(effectiveModel)) {
    effectiveModel = 'klein'
  }

  const encodedPrompt = encodeURIComponent(prompt)
  const params = new URLSearchParams({
    model: effectiveModel,
    width: String(width),
    height: String(height),
    nologo: 'true',
    seed: '-1',
  })

  if (isImageToImage) {
    params.set('image', imageUrl)
  }

  const apiUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${key}` },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Image generation failed (${response.status}): ${errorText.slice(0, 200)}`)
  }

  const blob = await response.blob()
  const buffer = Buffer.from(await blob.arrayBuffer())

  const saved = await saveMedia(userId, {
    type: 'image',
    prompt,
    model: effectiveModel,
    buffer,
    mimeType: 'image/png',
    extension: 'png',
    metadata: {
      width,
      height,
      mode: isImageToImage ? 'image-to-image' : 'text-to-image',
      sourceImage: isImageToImage ? imageUrl : null,
    },
  })

  return {
    url: saved.saved ? saved.url : `data:image/png;base64,${buffer.toString('base64')}`,
    prompt,
    model: effectiveModel,
    width,
    height,
    mode: isImageToImage ? 'image-to-image' : 'text-to-image',
    stored: saved.saved,
  }
}

// ─── VIDEO GENERATION ────────────────────────────────────────────────
export async function generateVideo(userId, { prompt, imageUrl, duration = 5, aspectRatio = '16:9' }) {
  const key = getPollinationsKey()
  const model = 'grok-video'
  const encodedPrompt = encodeURIComponent(prompt || 'Cinematic motion')
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

  const controller = new AbortController()
  const timeoutMs = Number(process.env.VIDEO_PROVIDER_TIMEOUT_MS || 150000)
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response
  try {
    response = await fetch(apiUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Video generation failed (${response.status}): ${errorText.slice(0, 200)}`)
  }

  const blob = await response.blob()
  const buffer = Buffer.from(await blob.arrayBuffer())

  const saved = await saveMedia(userId, {
    type: 'video',
    prompt,
    model,
    buffer,
    mimeType: 'video/mp4',
    extension: 'mp4',
    metadata: { duration, aspectRatio },
  })

  return {
    url: saved.saved ? saved.url : `data:video/mp4;base64,${buffer.toString('base64')}`,
    prompt,
    model,
    duration,
    aspectRatio,
    stored: saved.saved,
  }
}

// ─── MUSIC GENERATION ────────────────────────────────────────────────
export async function generateMusic(userId, { prompt, duration = 30 }) {
  const key = getPollinationsKey()
  const model = 'elevenmusic'
  const encodedPrompt = encodeURIComponent(prompt)
  const apiUrl = `https://gen.pollinations.ai/audio/${encodedPrompt}?model=${model}&duration=${duration}&seed=-1`

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${key}` },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Music generation failed (${response.status}): ${errorText.slice(0, 200)}`)
  }

  const blob = await response.blob()
  const buffer = Buffer.from(await blob.arrayBuffer())

  const saved = await saveMedia(userId, {
    type: 'audio',
    prompt,
    model,
    buffer,
    mimeType: 'audio/mpeg',
    extension: 'mp3',
    metadata: { duration, generationType: 'music' },
  })

  return {
    url: saved.saved ? saved.url : `data:audio/mpeg;base64,${buffer.toString('base64')}`,
    prompt,
    model,
    duration,
    stored: saved.saved,
  }
}

// ─── TEXT-TO-SPEECH ──────────────────────────────────────────────────
export async function generateTTS(userId, { text, voice = 'rachel' }) {
  const key = getPollinationsKey()
  const model = 'elevenlabs'
  const encodedText = encodeURIComponent(text)
  const apiUrl = `https://gen.pollinations.ai/audio/${encodedText}?model=${model}&voice=${voice}&seed=-1`

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${key}` },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`TTS generation failed (${response.status}): ${errorText.slice(0, 200)}`)
  }

  const blob = await response.blob()
  const buffer = Buffer.from(await blob.arrayBuffer())

  const saved = await saveMedia(userId, {
    type: 'audio',
    prompt: text.substring(0, 200),
    model,
    buffer,
    mimeType: 'audio/mpeg',
    extension: 'mp3',
    metadata: { voice, characterCount: text.length, generationType: 'tts' },
  })

  return {
    url: saved.saved ? saved.url : `data:audio/mpeg;base64,${buffer.toString('base64')}`,
    text: text.substring(0, 100),
    voice,
    stored: saved.saved,
  }
}

// ─── AUDIO TRANSCRIPTION ────────────────────────────────────────────
export async function transcribeAudio(userId, { audioUrl }) {
  const key = getPollinationsKey()

  if (audioUrl.startsWith('data:')) {
    throw new Error('Base64 audio not supported. Please provide a publicly accessible audio URL.')
  }

  const sourceResponse = await fetch(audioUrl)
  if (!sourceResponse.ok) {
    throw new Error('Failed to fetch audio from the provided URL.')
  }

  const contentType = sourceResponse.headers.get('content-type') || 'audio/mpeg'
  const sourceBuffer = await sourceResponse.arrayBuffer()
  const blob = new Blob([sourceBuffer], { type: contentType })

  const formData = new FormData()
  formData.append('file', blob, 'audio-input.mp3')
  formData.append('model', 'whisper-1')

  const response = await fetch('https://gen.pollinations.ai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Transcription failed (${response.status}): ${errorText.slice(0, 200)}`)
  }

  const result = await response.json()
  const transcription = result.text || result.transcription || JSON.stringify(result)

  return { transcription, audioUrl }
}
