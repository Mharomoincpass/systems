import { z } from 'zod'
import { sendEmailWithZeptoMail } from '@/lib/smtp-service'

export const dynamic = 'force-dynamic'

const recipientSchema = z.object({
  address: z.string().email('Recipient address must be a valid email'),
  name: z.string().min(1).optional(),
})

const sendEmailSchema = z.object({
  to: z.array(recipientSchema).min(1, 'At least one recipient is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlbody: z.string().min(1, 'htmlbody is required'),
  fromAddress: z.string().email('fromAddress must be a valid email').optional(),
  fromName: z.string().min(1).optional(),
})

export async function POST(request) {
  try {
    const body = await request.json()
    const payload = sendEmailSchema.parse(body)

    const result = await sendEmailWithZeptoMail(payload)

    return Response.json(
      {
        success: true,
        provider: 'zeptomail',
        result,
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

    return Response.json(
      {
        error: error.message || 'Failed to send email',
      },
      { status: 500 }
    )
  }
}
