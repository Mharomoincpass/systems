import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SUB_ROOT = path.join(process.cwd(), "storage", "studio-subscribers");
const SUB_PATH = path.join(SUB_ROOT, "emails.json");

function ensureDir() {
  fs.mkdirSync(SUB_ROOT, { recursive: true });
}

function readList() {
  ensureDir();
  if (!fs.existsSync(SUB_PATH)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(SUB_PATH, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(items) {
  ensureDir();
  fs.writeFileSync(SUB_PATH, JSON.stringify(items, null, 2), "utf8");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidSubscriberEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || normalized.length > 254) return false;
  return EMAIL_RE.test(normalized);
}

export function addStudioSubscriber(email, meta = {}) {
  const normalized = String(email).trim().toLowerCase();
  if (!isValidSubscriberEmail(normalized)) {
    throw new Error("Invalid email address");
  }

  const list = readList();
  const existing = list.find((e) => e.email === normalized);
  if (existing) {
    existing.updatedAt = Date.now();
    existing.visits = (existing.visits || 1) + 1;
    writeList(list);
    return { email: normalized, alreadySubscribed: true };
  }

  list.unshift({
    id: `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    email: normalized,
    createdAt: Date.now(),
    userAgent: String(meta.userAgent || "").slice(0, 240),
  });
  writeList(list);
  return { email: normalized, alreadySubscribed: false };
}

export function listStudioSubscribers() {
  return readList()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map((row) => ({
      id: row.id,
      email: row.email,
      createdAt: row.createdAt,
      createdAtLabel: row.createdAt
        ? new Date(row.createdAt).toLocaleString()
        : "—",
      updatedAt: row.updatedAt || null,
      visits: row.visits || 1,
    }));
}

export function deleteStudioSubscriber(id) {
  const targetId = String(id || "").trim();
  if (!targetId) return false;
  const list = readList();
  const next = list.filter((row) => row.id !== targetId);
  if (next.length === list.length) return false;
  writeList(next);
  return true;
}
