import { getWhatsAppConfig } from "./config";
import { handleWhatsAppTextMessage } from "./handleIncoming";

/**
 * Meta webhook body processor (Grocliq: processLeoWhatsappWebhookBody pattern).
 */
export async function processWhatsAppWebhookBody(body) {
  if (body?.object !== "whatsapp_business_account") return;

  const { phoneNumberId: configuredPnId } = getWhatsAppConfig();

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== "messages") continue;
      const value = change.value;
      const inboundPnId = String(value?.metadata?.phone_number_id || "");
      if (configuredPnId && inboundPnId && inboundPnId !== configuredPnId) {
        console.warn("WhatsApp webhook: phone_number_id mismatch", {
          inboundPnId,
          configuredPnId,
        });
        continue;
      }

      const messages = value?.messages || [];
      for (const message of messages) {
        if (message.type !== "text" || !message.text?.body) continue;
        await handleWhatsAppTextMessage({
          from: message.from,
          text: message.text.body,
          waMessageId: message.id,
          phoneNumberId: inboundPnId || configuredPnId,
        }).catch((err) => {
          console.error("WhatsApp handler error:", err);
        });
      }
    }
  }
}
