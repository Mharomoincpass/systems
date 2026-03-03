import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob'
import { randomBytes } from 'crypto'

function getClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured')
  }
  return BlobServiceClient.fromConnectionString(connectionString)
}

function getContainerName() {
  return process.env.AZURE_STORAGE_CONTAINER || 'media'
}

export async function uploadBlob(buffer, mimeType, containerPath) {
  const client = getClient()
  const containerClient = client.getContainerClient(getContainerName())
  await containerClient.createIfNotExists()

  const blockBlobClient = containerClient.getBlockBlobClient(containerPath)

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
      blobCacheControl: 'public, max-age=86400',
    },
  })

  let url
  try {
    url = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse('r'),
      startsOn: new Date(Date.now() - 5 * 60 * 1000),
      expiresOn: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      protocol: 'https',
    })
  } catch {
    url = blockBlobClient.url
  }

  return { url, blobPath: containerPath, fileSize: buffer.byteLength }
}

export async function deleteBlob(blobPath) {
  try {
    const client = getClient()
    const containerClient = client.getContainerClient(getContainerName())
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath)
    await blockBlobClient.deleteIfExists()
    return true
  } catch (error) {
    console.error('Failed to delete blob:', error.message)
    return false
  }
}

export function generateBlobPath(userId, type, extension) {
  const hash = randomBytes(16).toString('hex')
  return `users/${userId}/${type}/${hash}.${extension}`
}

export function checkStorageQuota(storageUsed, storageLimit, newFileSize) {
  const remaining = storageLimit - storageUsed
  return {
    allowed: newFileSize <= remaining,
    used: storageUsed,
    limit: storageLimit,
    remaining,
  }
}
