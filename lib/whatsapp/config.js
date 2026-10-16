import { loadWhatsAppConnection } from "./connectionStore";

export function getWhatsAppConfig() {
  const conn = loadWhatsAppConnection();
  const accessToken =
    conn?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId =
    conn?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
  const wabaId =
    conn?.wabaId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";

  return {
    accessToken,
    phoneNumberId,
    verifyToken,
    appSecret,
    wabaId,
    apiVersion,
    connectionSource: conn ? conn.source || "embedded" : "env",
    isConfigured: Boolean(accessToken && phoneNumberId),
  };
}
