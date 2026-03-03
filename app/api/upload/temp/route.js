import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob'

export const dynamic = 'force-dynamic'

function parseDataUrl(imageData) {
  const match = imageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) {
    throw new Error('Invalid image data')
  }

  const mimeType = match[1]
  const base64Data = match[2]
  const extensionMap = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  const extension = extensionMap[mimeType] || 'jpg'

  return {
    mimeType,
    extension,
    buffer: Buffer.from(base64Data, 'base64'),
  }
}

async function uploadToAzureTemp(buffer, mimeType, extension) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  const containerName = process.env.AZURE_STORAGE_CONTAINER || 'media'

  if (!connectionString) {
    return null
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  const containerClient = blobServiceClient.getContainerClient(containerName)
  await containerClient.createIfNotExists()

  const filename = `temp/${randomBytes(16).toString('hex')}.${extension}`
  const blockBlobClient = containerClient.getBlockBlobClient(filename)

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
      blobCacheControl: 'public, max-age=3600',
    },
  })

  try {
    const startsOn = new Date(Date.now() - 5 * 60 * 1000)
    const expiresOn = new Date(Date.now() + 60 * 60 * 1000)

    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse('r'),
      startsOn,
      expiresOn,
      protocol: 'https',
    })

    return sasUrl
  } catch (_error) {
    return blockBlobClient.url
  }
}

export async function POST(request) {
  try {
    const { imageData } = await request.json()

    if (!imageData || !imageData.startsWith('data:')) {
      return Response.json(
        { error: 'Invalid image data' },
        { status: 400 }
      )
    }

    const { buffer, mimeType, extension } = parseDataUrl(imageData)

    const azureUrl = await uploadToAzureTemp(buffer, mimeType, extension)
    if (azureUrl) {
      return Response.json(
        {
          success: true,
          url: azureUrl,
          provider: 'azure',
        },
        { status: 200 }
      )
    }

    const filename = `${randomBytes(16).toString('hex')}.${extension}`
    const publicDir = join(process.cwd(), 'public', 'temp')
    const filePath = join(publicDir, filename)

    try {
      await mkdir(publicDir, { recursive: true })
    } catch (_err) {
    }

    await writeFile(filePath, buffer)

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/temp/${filename}`

    return Response.json(
      {
        success: true,
        url: publicUrl,
        provider: 'local',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Upload error:', error)
    return Response.json(
      {
        error: error.message || 'Failed to upload image',
      },
      { status: 500 }
    )
  }
}
