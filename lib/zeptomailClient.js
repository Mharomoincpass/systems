const DEFAULT_ZEPTO_BASE = "https://api.zeptomail.in/v1.1";

function getZeptoApiBase() {
  const raw = process.env.ZEPTOMAIL_API_BASE?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return DEFAULT_ZEPTO_BASE;
}

export function getZeptoFromAddress() {
  return (
    process.env.ZEPTOMAIL_FROM?.trim() ||
    process.env.ZEPTOMAIL_FROM_ADDRESS?.trim() ||
    process.env.STUDIO_MAIL_FROM?.trim() ||
    ""
  );
}

export function getZeptoMailConfigStatus() {
  const apiKey = process.env.ZEPTOMAIL_API_KEY?.trim();
  const fromAddress = getZeptoFromAddress();
  if (!apiKey && !fromAddress) return { ok: false, reason: "missing_zeptomail_key_and_from" };
  if (!apiKey) return { ok: false, reason: "missing_zeptomail_api_key" };
  if (!fromAddress) return { ok: false, reason: "missing_zeptomail_from" };
  return { ok: true, fromAddress, apiBase: getZeptoApiBase() };
}

function buildAuthHeader(apiKey) {
  return apiKey.startsWith("Zoho-enczapikey") ? apiKey : `Zoho-enczapikey ${apiKey}`;
}

function formatZeptoError(data, status) {
  const nested =
    data?.error?.message ||
    data?.error?.details?.[0]?.message ||
    data?.message;
  if (nested) return nested;
  if (data && Object.keys(data).length) return JSON.stringify(data).slice(0, 240);
  return `HTTP ${status}`;
}

/**
 * @param {{ to: string, subject: string, htmlbody: string, textbody?: string, fromAddress?: string, fromName?: string }} opts
 */
export async function sendZeptoMail({
  to,
  subject,
  htmlbody,
  textbody,
  fromAddress,
  fromName,
}) {
  const apiKey = process.env.ZEPTOMAIL_API_KEY?.trim();
  const from = fromAddress || getZeptoFromAddress();
  if (!apiKey) {
    return { delivered: false, reason: "missing_zeptomail_api_key" };
  }
  if (!from) {
    return { delivered: false, reason: "missing_zeptomail_from" };
  }

  const payload = {
    from: {
      address: from,
      ...(fromName ? { name: fromName } : {}),
    },
    to: [{ email_address: { address: to } }],
    subject,
    htmlbody,
  };
  if (textbody) payload.textbody = textbody;

  const res = await fetch(`${getZeptoApiBase()}/email`, {
    method: "POST",
    headers: {
      Authorization: buildAuthHeader(apiKey),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(formatZeptoError(data, res.status));
  }
  return { delivered: true, requestId: data?.request_id || null, raw: data };
}

/** @deprecated alias for auth/signup routes */
export async function sendEmailWithZeptoMail({
  to,
  subject,
  htmlbody,
  fromAddress,
  fromName,
}) {
  if (!to?.length) throw new Error("Recipient list is required");
  if (!subject) throw new Error("Email subject is required");
  if (!htmlbody) throw new Error("Email htmlbody is required");

  let last;
  for (const recipient of to) {
    last = await sendZeptoMail({
      to: recipient.address,
      subject,
      htmlbody,
      fromAddress,
      fromName,
    });
    if (!last.delivered) {
      throw new Error(last.reason || "ZeptoMail send failed");
    }
  }
  return last?.raw ?? { ok: true };
}
