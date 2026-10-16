import crypto from "node:crypto";
import { getWhatsAppConfig } from "./config";
import { ensureJpgImageUrl } from "./mediaUrl";
import { normalizeWhatsAppOutboundText } from "./outboundText";

function normalizeDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function graphUrl(path) {
  const { apiVersion } = getWhatsAppConfig();
  return `https://graph.facebook.com/${apiVersion}${path}`;
}

export async function graphRequest(path, { method = "GET", body } = {}) {
  const { accessToken } = getWhatsAppConfig();
  if (!accessToken) {
    throw new Error("WHATSAPP_ACCESS_TOKEN is not set");
  }

  const res = await fetch(graphUrl(path), {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText || "Graph API error";
    throw new Error(`${msg} (${res.status})`);
  }
  return data;
}

/**
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, raw?: object }>}
 */
export async function sendWhatsAppText(to, text, phoneNumberIdOverride) {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();
  const pnId = String(phoneNumberIdOverride || phoneNumberId || "").trim();
  const token = String(accessToken || "").trim();
  if (!token || !pnId) {
    return { success: false, error: "Missing access token or phone number id" };
  }
  const toNumber = normalizeDigits(to);
  if (!toNumber) {
    return { success: false, error: "Invalid recipient number" };
  }

  const body = normalizeWhatsAppOutboundText(String(text || "")).slice(0, 4096);
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toNumber,
    type: "text",
    text: { body },
  };

  try {
    const res = await fetch(graphUrl(`/${pnId}/messages`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data?.error?.message || `HTTP ${res.status}`,
        metaCode: data?.error?.code,
        raw: data,
      };
    }
    return { success: true, messageId: data?.messages?.[0]?.id, raw: data };
  } catch (e) {
    return { success: false, error: e?.message || "Network error" };
  }
}

/**
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, raw?: object }>}
 */
export async function sendWhatsAppImage(to, imageUrl, caption, phoneNumberIdOverride) {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();
  const pnId = String(phoneNumberIdOverride || phoneNumberId || "").trim();
  const token = String(accessToken || "").trim();
  if (!token || !pnId) {
    return { success: false, error: "Missing access token or phone number id" };
  }
  const toNumber = normalizeDigits(to);
  if (!toNumber) {
    return { success: false, error: "Invalid recipient number" };
  }
  const imgUrl = ensureJpgImageUrl(imageUrl);
  if (!imgUrl) {
    return { success: false, error: "Missing image URL" };
  }

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toNumber,
    type: "image",
    image: {
      link: imgUrl.slice(0, 2048),
      ...(caption
        ? { caption: normalizeWhatsAppOutboundText(caption).slice(0, 1024) }
        : {}),
    },
  };

  try {
    const res = await fetch(graphUrl(`/${pnId}/messages`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data?.error?.message || `HTTP ${res.status}`,
        raw: data,
      };
    }
    return { success: true, messageId: data?.messages?.[0]?.id, raw: data };
  } catch (e) {
    return { success: false, error: e?.message || "Network error" };
  }
}

export async function uploadWhatsAppMedia(buffer, mimeType, phoneNumberIdOverride) {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();
  const pnId = String(phoneNumberIdOverride || phoneNumberId || "").trim();
  const token = String(accessToken || "").trim();
  if (!token || !pnId) {
    return { success: false, error: "Missing access token or phone number id" };
  }
  if (!Buffer.isBuffer(buffer) || !buffer.length) {
    return { success: false, error: "Empty media buffer" };
  }

  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", mimeType || "audio/mpeg");
  form.append(
    "file",
    new Blob([buffer], { type: mimeType || "audio/mpeg" }),
    "voice.mp3"
  );

  try {
    const res = await fetch(graphUrl(`/${pnId}/media`), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data?.error?.message || `HTTP ${res.status}`,
        raw: data,
      };
    }
    const mediaId = data?.id;
    if (!mediaId) {
      return { success: false, error: "No media id returned", raw: data };
    }
    return { success: true, mediaId, raw: data };
  } catch (e) {
    return { success: false, error: e?.message || "Media upload failed" };
  }
}

export async function sendWhatsAppAudio(to, mediaId, phoneNumberIdOverride) {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();
  const pnId = String(phoneNumberIdOverride || phoneNumberId || "").trim();
  const token = String(accessToken || "").trim();
  if (!token || !pnId) {
    return { success: false, error: "Missing access token or phone number id" };
  }
  const toNumber = normalizeDigits(to);
  if (!toNumber || !mediaId) {
    return { success: false, error: "Invalid recipient or media id" };
  }

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toNumber,
    type: "audio",
    audio: { id: String(mediaId) },
  };

  try {
    const res = await fetch(graphUrl(`/${pnId}/messages`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data?.error?.message || `HTTP ${res.status}`,
        raw: data,
      };
    }
    return { success: true, messageId: data?.messages?.[0]?.id, raw: data };
  } catch (e) {
    return { success: false, error: e?.message || "Network error" };
  }
}

export async function registerWhatsAppPhone(pin, { accessToken, phoneNumberId } = {}) {
  const cfg = getWhatsAppConfig();
  const token = accessToken || cfg.accessToken;
  const pnId = phoneNumberId || cfg.phoneNumberId;
  const pinDigits = String(pin || "").replace(/\D/g, "");
  if (!token || !pnId || pinDigits.length < 6) {
    return { ok: false, error: "Missing token, phone number id, or 6-digit PIN" };
  }
  const { apiVersion } = cfg;
  const url = `https://graph.facebook.com/${apiVersion}/${pnId}/register`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        pin: pinDigits,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || "Register failed";
      if (/already\s+registered|already\s+linked|duplicate/i.test(msg)) {
        return { ok: true, alreadyRegistered: true };
      }
      return { ok: false, error: msg };
    }
    return { ok: true, raw: data };
  } catch (e) {
    const msg = e?.message || "Register failed";
    if (/already\s+registered|already\s+linked|duplicate/i.test(msg)) {
      return { ok: true, alreadyRegistered: true };
    }
    return { ok: false, error: msg };
  }
}

export function verifyWebhookSignature(rawBody, signatureHeader) {
  const { appSecret } = getWhatsAppConfig();
  if (!appSecret || !signatureHeader?.startsWith("sha256=")) {
    return !appSecret;
  }
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  const received = signatureHeader.slice("sha256=".length);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(received, "hex")
    );
  } catch {
    return false;
  }
}
