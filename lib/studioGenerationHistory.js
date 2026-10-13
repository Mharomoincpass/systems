import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const GENERATION_LOG_TTL_MS = 24 * 60 * 60 * 1000;

const LOG_ROOT = path.join(process.cwd(), "storage", "studio-generation-log");
const LOG_PATH = path.join(LOG_ROOT, "history.json");
const MAX_ENTRIES = 500;

function ensureDir() {
  fs.mkdirSync(LOG_ROOT, { recursive: true });
}

function readEntries() {
  ensureDir();
  if (!fs.existsSync(LOG_PATH)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(entries) {
  ensureDir();
  fs.writeFileSync(LOG_PATH, JSON.stringify(entries, null, 2), "utf8");
}

export function purgeExpiredGenerationLogs(now = Date.now()) {
  const entries = readEntries();
  const kept = entries.filter((e) => now - e.at <= GENERATION_LOG_TTL_MS);
  if (kept.length !== entries.length) writeEntries(kept);
  return entries.length - kept.length;
}

export function appendGenerationLog(entry) {
  purgeExpiredGenerationLogs();
  const entries = readEntries();
  const record = {
    id: `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    at: Date.now(),
    status: entry.status === "error" ? "error" : "success",
    prompt: String(entry.prompt || "").slice(0, 4000),
    provider: String(entry.provider || "Studio").slice(0, 200),
    model: entry.model ? String(entry.model).slice(0, 120) : "",
    aspectRatio: entry.aspectRatio ? String(entry.aspectRatio).slice(0, 16) : "",
    error: entry.error ? String(entry.error).slice(0, 500) : "",
    mediaId: entry.mediaId ? String(entry.mediaId) : "",
  };
  entries.unshift(record);
  writeEntries(entries.slice(0, MAX_ENTRIES));
  return record;
}

export function listGenerationLogs() {
  purgeExpiredGenerationLogs();
  return readEntries().sort((a, b) => b.at - a.at);
}

export function toClientGenerationLog(record) {
  return {
    id: record.id,
    at: record.at,
    atLabel: new Date(record.at).toLocaleString(),
    status: record.status,
    prompt: record.prompt,
    provider: record.provider,
    model: record.model,
    aspectRatio: record.aspectRatio,
    error: record.error,
    mediaId: record.mediaId,
    mediaUrl: record.mediaId
      ? `/api/studio/gallery/${record.mediaId}/media`
      : "",
  };
}
