import { getWhatsAppConfig } from "./config";
import { formatMetaSendError } from "./metaErrors";

function graphUrl(path) {
  const { apiVersion } = getWhatsAppConfig();
  return `https://graph.facebook.com/${apiVersion}${path}`;
}

function normalizeDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeLanguageCode(s) {
  if (s == null || s === "") return "en";
  return String(s).trim().replace(/-/g, "_");
}

/**
 * List WABA message templates (production outbound / re-engage).
 */
export async function listWhatsAppTemplates({ limit = 100, search = "" } = {}) {
  const { accessToken, wabaId } = getWhatsAppConfig();
  const token = String(accessToken || "").trim();
  const waba = String(wabaId || "").trim();
  if (!token || !waba) {
    return { success: false, error: "Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_BUSINESS_ACCOUNT_ID" };
  }

  const cap = Math.min(200, Math.max(1, Number(limit) || 100));
  const url = new URL(graphUrl(`/${waba}/message_templates`));
  url.searchParams.set("limit", String(cap));
  url.searchParams.set("fields", "name,status,category,language,components");
  if (search) url.searchParams.set("name", String(search).trim());

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data?.error?.message || `HTTP ${res.status}`,
        raw: data,
      };
    }
    const templates = (Array.isArray(data?.data) ? data.data : []).map((t) => ({
      name: String(t.name || ""),
      status: String(t.status || "").toUpperCase(),
      category: String(t.category || "").toLowerCase(),
      language: String(t.language || "en"),
    }));
    return { success: true, templates };
  } catch (e) {
    return { success: false, error: e?.message || "Network error" };
  }
}

/**
 * Send approved template to any E.164 digits (business-initiated / outside 24h window).
 */
export async function sendWhatsAppTemplate(
  to,
  {
    templateName,
    languageCode = "en",
    bodyParameters = [],
    headerParameters = [],
  },
  phoneNumberIdOverride
) {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();
  const pnId = String(phoneNumberIdOverride || phoneNumberId || "").trim();
  const token = String(accessToken || "").trim();
  const toNumber = normalizeDigits(to);
  const name = String(templateName || "").trim();
  const lang = normalizeLanguageCode(languageCode);

  if (!token || !pnId) {
    return { success: false, error: "Missing access token or phone number id" };
  }
  if (!toNumber || !name) {
    return { success: false, error: "Missing recipient or templateName" };
  }

  const components = [];
  if (Array.isArray(headerParameters) && headerParameters.length) {
    components.push({
      type: "header",
      parameters: headerParameters.map((h) => {
        if (h?.type === "image" && h.image?.link) {
          return { type: "image", image: { link: String(h.image.link).slice(0, 2048) } };
        }
        return { type: "text", text: String(h?.text ?? h).slice(0, 1024) };
      }),
    });
  }
  if (Array.isArray(bodyParameters) && bodyParameters.length) {
    components.push({
      type: "body",
      parameters: bodyParameters.map((p) => ({
        type: "text",
        text: String(typeof p === "object" ? p.text : p).slice(0, 1024),
      })),
    });
  }

  const payload = {
    messaging_product: "whatsapp",
    to: toNumber,
    type: "template",
    template: {
      name,
      language: { code: lang },
      ...(components.length ? { components } : {}),
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
      const base = {
        success: false,
        error: data?.error?.message || `HTTP ${res.status}`,
        raw: data,
        metaCode: data?.error?.code,
      };
      return { ...base, ...formatMetaSendError(base, { isTemplateSend: true }) };
    }
    return { success: true, messageId: data?.messages?.[0]?.id, raw: data };
  } catch (e) {
    return { success: false, error: e?.message || "Network error" };
  }
}
