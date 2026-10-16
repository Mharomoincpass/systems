/**
 * WhatsApp Cloud API text formatting (*bold*, not **markdown**).
 * Adapted from Grocliq whatsappOutboundText (read-only reference).
 */

export function normalizeWhatsAppOutboundText(text) {
  let s = String(text ?? "");
  let prev;
  for (let i = 0; i < 5 && s !== prev; i++) {
    prev = s;
    s = s.replace(/\*\*([^*]+)\*\*/g, "*$1*");
  }
  s = s.replace(/\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi, "$2");
  return s.trim();
}
