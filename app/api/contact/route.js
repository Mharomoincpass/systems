import { z } from 'zod'
import { sendEmailWithZeptoMail } from '@/lib/smtp-service'

export const dynamic = 'force-dynamic'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  message: z.string().min(1, 'Message is required'),
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, serviceType, message } = contactSchema.parse(body)

    // 1. Send email to Admin
    const adminHtmlBody = `
      <div>
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service Type:</strong> ${serviceType}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
    `

    await sendEmailWithZeptoMail({
      to: [{ address: 'mharomezgs@gmail.com', name: 'MHAROMO Admin' }],
      subject: `New Lead Received: ${name} - ${serviceType}`,
      htmlbody: adminHtmlBody,
    })

    // 2. Send "Thank You" email to User
    const userHtmlBody = `
      <div>
        <h2>Thank you for contacting Mharomo Systems</h2>
        <p>Hi ${name},</p>
        <p>We have received your inquiry regarding <strong>${serviceType}</strong>.</p>
        <p>We will review your message and get back to you shortly.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>Mharomo Systems Team</strong></p>
      </div>
    `

    await sendEmailWithZeptoMail({
      to: [{ address: email, name: name }],
      subject: 'Thank you for contacting Mharomo Systems',
      htmlbody: userHtmlBody,
    })

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Contact form error:', error)
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
