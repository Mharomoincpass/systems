import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'
import { requireAuth } from '@/lib/auth-helpers'
import { rateLimitGenerate } from '@/lib/rate-limit'
import { uploadBlob, generateBlobPath } from '@/lib/azure-storage'

export const dynamic = 'force-dynamic'

function parseAudioDataUrl(audioData) {
  const match = audioData.match(/^data:(audio\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) {
    throw new Error('Invalid audio data')
  }

  const mimeType = match[1]
  const base64Data = match[2]
  const extensionMap = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/flac': 'flac',
    'audio/x-flac': 'flac',
  }
  const extension = extensionMap[mimeType] || 'mp3'

  return {
    mimeType,
    extension,
    buffer: Buffer.from(base64Data, 'base64'),
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    const rl = rateLimitGenerate(auth.user.userId)
    if (!rl.allowed) {
      return Response.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
    }

    const { audioData } = await request.json()

    if (!audioData || !audioData.startsWith('data:audio/')) {
      return Response.json(
        { error: 'Invalid audio data' },
        { status: 400 }
      )
    }

    const { buffer, mimeType, extension } = parseAudioDataUrl(audioData)

    if (buffer.byteLength > 50 * 1024 * 1024) {
      return Response.json(
        { error: 'Audio file must be smaller than 50MB' },
        { status: 400 }
      )
    }

    try {
      const blobPath = generateBlobPath(auth.user.userId, 'temp-audio', extension)
      const uploaded = await uploadBlob(buffer, mimeType, blobPath)

      return Response.json(
        {
          success: true,
          url: uploaded.url,
          provider: 'azure',
          mimeType,
          fileSize: uploaded.fileSize,
        },
        { status: 200 }
      )
    } catch {
      const filename = `${randomBytes(16).toString('hex')}.${extension}`
      const publicDir = join(process.cwd(), 'public', 'temp')
      const filePath = join(publicDir, filename)

      await mkdir(publicDir, { recursive: true })
      await writeFile(filePath, buffer)

      const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/temp/${filename}`

      return Response.json(
        {
          success: true,
          url: publicUrl,
          provider: 'local',
          mimeType,
          fileSize: buffer.byteLength,
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('❌ Audio upload error:', error)
    return Response.json(
      {
        error: error.message || 'Failed to upload audio',
      },
      { status: 500 }
    )
  }
}
