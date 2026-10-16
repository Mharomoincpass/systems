/** Human-readable Meta WhatsApp Cloud API send errors (Grocliq Leo pattern). */
export function formatMetaSendError(sendRes, { isTemplateSend = false } = {}) {
  const metaCode = sendRes?.raw?.error?.code ?? sendRes?.metaCode;
  let error = sendRes?.error || "Send failed";

  if (metaCode === 131030) {
    error =
      "Recipient not allowed (dev/test mode). Use production System User token + real WABA, or add them as a test recipient in Meta API Setup.";
  } else if (metaCode === 131010) {
    error =
      "Phone not registered on Cloud API. Run: npm run whatsapp -- register <6-digit PIN>";
  } else if (metaCode === 131047) {
    error =
      "24-hour messaging window expired. Send an approved template message to re-open the conversation.";
  } else if (metaCode === 131049) {
    error = "Meta frequency cap — too many marketing messages to this user. Try later.";
  } else if (metaCode === 130472 || metaCode === 131056) {
    error = "Meta declined delivery (recipient experiment / restriction).";
  } else if (metaCode === 132001 && isTemplateSend) {
    error = "Template name or language does not match Meta. Check Message templates in WhatsApp Manager.";
  }

  return { error, metaCode: metaCode ?? null };
}
