const PRODUCTION_DEFAULT = "https://mharomo.systems";
const DEV_HTTPS_DEFAULT = "https://localhost:3000";

/** Public site origin (no trailing slash). Used for webhooks, emails, and absolute links. */
export function getPublicAppUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (process.env.NODE_ENV === "development") {
    return DEV_HTTPS_DEFAULT;
  }
  return PRODUCTION_DEFAULT;
}

/** When the WhatsApp bot runs locally, call this app's API over HTTPS (next dev --experimental-https). */
export function getLocalDevApiOrigin() {
  const base = getPublicAppUrl();
  if (process.env.NODE_ENV !== "development") return base;
  if (/localhost|127\.0\.0\.1/i.test(base)) return base;
  return DEV_HTTPS_DEFAULT;
}
