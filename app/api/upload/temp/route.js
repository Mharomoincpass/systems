import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { imageData } = await request.json()

    if (!imageData || !imageData.startsWith('data:')) {
      return Response.json(
        { error: 'Invalid image data' },
        { status: 400 }
      )
    }

    // Extract base64 data
    const base64Data = imageData.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename
    const filename = `${randomBytes(16).toString('hex')}.jpg`
    const publicDir = join(process.cwd(), 'public', 'temp')
    const filePath = join(publicDir, filename)

    // Ensure temp directory exists
    try {
      await mkdir(publicDir, { recursive: true })
    } catch (err) {
      // Directory already exists
    }

    // Write file
    await writeFile(filePath, buffer)

    // Return public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/temp/${filename}`

    return Response.json(
      {
        success: true,
        url: publicUrl,
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
