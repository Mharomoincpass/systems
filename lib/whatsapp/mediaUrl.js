/**
 * Meta WhatsApp image links prefer JPEG/PNG over WebP.
 * Adapted from Grocliq ensureJpgImageUrl (read-only reference).
 */

export function ensureJpgImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  let cleanUrl = url.trim();
  if (!cleanUrl) return "";

  if (cleanUrl.includes("images.unsplash.com")) {
    cleanUrl = cleanUrl.replace(/auto=format/gi, "fm=jpg");
    if (!cleanUrl.includes("fm=jpg")) {
      cleanUrl += cleanUrl.includes("?") ? "&fm=jpg" : "?fm=jpg";
    }
    return cleanUrl;
  }

  cleanUrl = cleanUrl.replace(/\.webp(\?|$)/gi, ".jpg$1");
  return cleanUrl;
}
