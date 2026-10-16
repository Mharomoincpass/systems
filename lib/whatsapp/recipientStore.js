import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "storage", "whatsapp");
const FILE = path.join(ROOT, "recipients.json");

function ensureDir() {
  fs.mkdirSync(ROOT, { recursive: true });
}

export function loadRecipients() {
  ensureDir();
  if (!fs.existsSync(FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}

export function saveRecipients(list) {
  ensureDir();
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2), "utf8");
}

export function addRecipient({ phone, name }) {
  const clean = String(phone || "").replace(/\D/g, "");
  if (!clean) throw new Error("Invalid phone number");
  const list = loadRecipients();
  if (list.find((r) => r.phone === clean)) return list;
  list.push({ phone: clean, name: name || "", addedAt: Date.now() });
  saveRecipients(list);
  return list;
}

export function removeRecipient(phone) {
  const clean = String(phone || "").replace(/\D/g, "");
  const list = loadRecipients().filter((r) => r.phone !== clean);
  saveRecipients(list);
  return list;
}
