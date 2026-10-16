import { sendWhatsAppText } from "./graph";
import { formatMetaSendError } from "./metaErrors";

/** Outbound text with logging and friendly Meta error mapping. */
export async function deliverWhatsAppText(to, text, phoneNumberId) {
  const res = await sendWhatsAppText(to, text, phoneNumberId);
  if (!res.success) {
    const mapped = formatMetaSendError(res);
    console.error("WhatsApp outbound failed:", mapped.metaCode, mapped.error);
    return { ...res, ...mapped };
  }
  return res;
}
