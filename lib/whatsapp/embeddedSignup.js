import { getPublicAppUrl } from "@/lib/publicAppUrl";
import { registerWhatsAppPhone } from "./graph";

export const WHATSAPP_EMBEDDED_OAUTH_STATE = "mha_wa_embedded_v1";

export function getEmbeddedSignupRedirectUri() {
  return `${getPublicAppUrl()}/studio/whatsapp/embedded-callback`;
}

function graphBase(apiVersion) {
  return `https://graph.facebook.com/${apiVersion || "v21.0"}`;
}

function embeddedAppCredentials() {
  const appId =
    process.env.WHATSAPP_FB_APP_ID?.trim() ||
    process.env.NEXT_PUBLIC_WHATSAPP_FB_APP_ID?.trim();
  const appSecret =
    process.env.WHATSAPP_FB_APP_SECRET?.trim() ||
    process.env.WHATSAPP_APP_SECRET?.trim();
  return { appId, appSecret };
}

/**
 * WhatsApp Embedded Signup — exchange SDK code, long-lived token, resolve Meta-assigned phone.
 * @see Grocliq runLeoEmbeddedSignupFlow
 */
export async function runWhatsAppEmbeddedSignup({
  code,
  wabaId,
  phoneNumberId,
  businessId,
  registerPin,
  redirectUri,
}) {
  const { appId, appSecret } = embeddedAppCredentials();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";
  const base = graphBase(apiVersion);

  if (!appId || !appSecret) {
    throw new Error(
      "Set WHATSAPP_FB_APP_ID and WHATSAPP_FB_APP_SECRET (or WHATSAPP_APP_SECRET) for Embedded Signup"
    );
  }
  if (!code) throw new Error("Missing authorization code from Embedded Signup");
  if (!wabaId || !phoneNumberId) {
    throw new Error(
      "Embedded Signup did not return waba_id / phone_number_id. Finish the Meta popup until the end."
    );
  }

  const oauthRedirect =
    redirectUri?.trim() || getEmbeddedSignupRedirectUri();

  let shortToken;
  let lastErr;
  for (const params of [
    { client_id: appId, client_secret: appSecret, code, redirect_uri: oauthRedirect },
    { client_id: appId, client_secret: appSecret, code, redirect_uri: "" },
    { client_id: appId, client_secret: appSecret, code },
  ]) {
    try {
      const url = new URL(`${base}/oauth/access_token`);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      const res = await fetch(url.toString());
      const data = await res.json().catch(() => ({}));
      if (data?.access_token) {
        shortToken = data.access_token;
        break;
      }
      lastErr = new Error(data?.error?.message || "Token exchange failed");
    } catch (e) {
      lastErr = e;
    }
  }
  if (!shortToken) {
    throw new Error(
      `Embedded Signup code exchange failed: ${lastErr?.message || "unknown"}`
    );
  }

  const longUrl = new URL(`${base}/oauth/access_token`);
  longUrl.searchParams.set("grant_type", "fb_exchange_token");
  longUrl.searchParams.set("client_id", appId);
  longUrl.searchParams.set("client_secret", appSecret);
  longUrl.searchParams.set("fb_exchange_token", shortToken);
  const longRes = await fetch(longUrl.toString());
  const longData = await longRes.json().catch(() => ({}));
  const accessToken = longData?.access_token || shortToken;
  const expiresIn = longData?.expires_in || 5184000;

  const wabaRes = await fetch(
    `${base}/${wabaId}?fields=id,name,phone_numbers{id,display_phone_number,verified_name}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const wabaData = await wabaRes.json().catch(() => ({}));
  if (!wabaRes.ok) {
    throw new Error(wabaData?.error?.message || "Could not load WABA phone numbers");
  }
  const phones = wabaData?.phone_numbers?.data || [];
  const phone =
    phones.find((p) => String(p.id) === String(phoneNumberId)) || phones[0];
  if (!phone) {
    throw new Error("Could not load phone numbers for this WABA with the new token.");
  }

  let subscriptionWorked = false;
  try {
    const subRes = await fetch(`${base}/${wabaId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const subData = await subRes.json().catch(() => ({}));
    subscriptionWorked = Boolean(subData?.success);
  } catch {
    subscriptionWorked = false;
  }

  const allowWithout =
    process.env.WHATSAPP_ALLOW_CONNECT_WITHOUT_SUBSCRIBED_APPS?.trim() === "true";
  if (!subscriptionWorked && !allowWithout) {
    throw new Error(
      "Meta rejected webhook subscription for this WABA. Check app + WABA in Business Manager, or set WHATSAPP_ALLOW_CONNECT_WITHOUT_SUBSCRIBED_APPS=true."
    );
  }

  const pnId = String(phone.id);
  const pinDigits = String(registerPin || process.env.WHATSAPP_PHONE_REGISTER_PIN || "")
    .replace(/\D/g, "");
  if (pinDigits.length >= 6) {
    const reg = await registerWhatsAppPhone(pinDigits, {
      accessToken,
      phoneNumberId: pnId,
    });
    if (!reg.ok && !reg.alreadyRegistered) {
      throw new Error(reg.error || "Cloud API phone register failed");
    }
  }

  return {
    accessToken,
    tokenExpiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    wabaId: String(wabaId),
    phoneNumberId: pnId,
    displayPhoneNumber: phone.display_phone_number || pnId,
    verifiedName: phone.verified_name || null,
    businessId: businessId ? String(businessId) : null,
  };
}

export function getEmbeddedSignupPublicMeta() {
  const appId =
    process.env.WHATSAPP_FB_APP_ID?.trim() ||
    process.env.NEXT_PUBLIC_WHATSAPP_FB_APP_ID?.trim();
  const configId = process.env.WHATSAPP_EMBEDDED_CONFIG_ID?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";
  if (!appId || !configId) {
    return { enabled: false };
  }
  return {
    enabled: true,
    appId,
    configId,
    graphVersion: apiVersion,
    redirectUri: getEmbeddedSignupRedirectUri(),
    oauthState: WHATSAPP_EMBEDDED_OAUTH_STATE,
  };
}
