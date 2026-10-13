import crypto from "node:crypto";

export const STUDIO_ADMIN_COOKIE = "studio_admin_session";
const SESSION_MS = 8 * 60 * 60 * 1000;

function adminPassword() {
  return (
    process.env.STUDIO_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    "135678"
  );
}

function signingSecret() {
  return (
    process.env.STUDIO_ADMIN_SECRET ||
    process.env.JWT_SECRET ||
    `${adminPassword()}:frsion-studio-admin`
  );
}

export function verifyAdminPassword(password) {
  const expected = adminPassword();
  const given = String(password ?? "");
  const a = Buffer.from(given, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createAdminSessionToken() {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_MS });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", signingSecret())
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function isValidAdminSessionToken(token) {
  if (!token || typeof token !== "string") return false;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;

  const expectedSig = crypto
    .createHmac("sha256", signingSecret())
    .update(payloadB64)
    .digest("base64url");

  const sigBuf = Buffer.from(sig, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function adminSessionCookieOptions(token) {
  return {
    name: STUDIO_ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_MS / 1000),
  };
}

export function getAdminSessionFromRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${STUDIO_ADMIN_COOKIE}=([^;]+)`)
  );
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function isAdminRequest(request) {
  const token = getAdminSessionFromRequest(request);
  return isValidAdminSessionToken(token);
}
