const ZEPTOMAIL_ENDPOINT = 'https://api.zeptomail.in/v1.1/email'

function getRequiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

export async function sendEmailWithZeptoMail({ to, subject, htmlbody, fromAddress, fromName }) {
  const apiKey = getRequiredEnv('ZEPTOMAIL_API_KEY')
  const senderAddress = fromAddress || 'noreply@mharomo.systems'

  if (!to || !Array.isArray(to) || to.length === 0) {
    throw new Error('Recipient list is required')
  }

  if (!subject) {
    throw new Error('Email subject is required')
  }

  if (!htmlbody) {
    throw new Error('Email htmlbody is required')
  }

  const payload = {
    from: {
      address: senderAddress,
      ...(fromName ? { name: fromName } : {}),
    },
    to: to.map((recipient) => ({
      email_address: {
        address: recipient.address,
        ...(recipient.name ? { name: recipient.name } : {}),
      },
    })),
    subject,
    htmlbody,
  }

  const response = await fetch(ZEPTOMAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Zoho-enczapikey ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  const responseText = await response.text()
  let responseData

  try {
    responseData = responseText ? JSON.parse(responseText) : null
  } catch {
    responseData = { raw: responseText }
  }

  if (!response.ok) {
    const message = responseData?.message || response.statusText || 'Failed to send email'
    throw new Error(`ZeptoMail error: ${message}`)
  }

  return responseData
}
