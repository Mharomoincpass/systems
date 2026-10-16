import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "storage", "whatsapp");
const CONNECTION_PATH = path.join(ROOT, "connection.json");

function ensureDir() {
  fs.mkdirSync(ROOT, { recursive: true });
}

export function loadWhatsAppConnection() {
  ensureDir();
  if (!fs.existsSync(CONNECTION_PATH)) return null;
  try {
    const row = JSON.parse(fs.readFileSync(CONNECTION_PATH, "utf8"));
    if (!row?.accessToken || !row?.phoneNumberId) return null;
    return row;
  } catch {
    return null;
  }
}

export function saveWhatsAppConnection(data) {
  ensureDir();
  const next = {
    source: "embedded",
    accessToken: String(data.accessToken || "").trim(),
    phoneNumberId: String(data.phoneNumberId || "").trim(),
    wabaId: String(data.wabaId || "").trim(),
    displayPhoneNumber: data.displayPhoneNumber || null,
    verifiedName: data.verifiedName || null,
    tokenExpiresAt: data.tokenExpiresAt || null,
    connectedAt: Date.now(),
  };
  fs.writeFileSync(CONNECTION_PATH, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function clearWhatsAppConnection() {
  ensureDir();
  if (fs.existsSync(CONNECTION_PATH)) fs.unlinkSync(CONNECTION_PATH);
}

/** Safe for API responses — no access token. */
export function getWhatsAppConnectionStatus() {
  const conn = loadWhatsAppConnection();
  if (!conn) {
    return { connected: false, source: null };
  }
  return {
    connected: true,
    source: conn.source || "embedded",
    phoneNumberId: conn.phoneNumberId,
    wabaId: conn.wabaId,
    displayPhoneNumber: conn.displayPhoneNumber,
    verifiedName: conn.verifiedName,
    tokenExpiresAt: conn.tokenExpiresAt,
    connectedAt: conn.connectedAt,
  };
}
