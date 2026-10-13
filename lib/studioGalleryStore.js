import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const GALLERY_TTL_MS = 24 * 60 * 60 * 1000;

const GALLERY_ROOT = path.join(process.cwd(), "storage", "studio-gallery");
const FILES_DIR = path.join(GALLERY_ROOT, "files");
const INDEX_PATH = path.join(GALLERY_ROOT, "index.json");

function ensureDirs() {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

function readIndex() {
  ensureDirs();
  if (!fs.existsSync(INDEX_PATH)) {
    return { items: [] };
  }
  try {
    const raw = fs.readFileSync(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { items: [] };
  }
}

function writeIndex(items) {
  ensureDirs();
  fs.writeFileSync(INDEX_PATH, JSON.stringify({ items }, null, 2), "utf8");
}

function mimeToExt(mime) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/webm": "webm",
  };
  return map[mime] || "bin";
}

export function parseDataUrl(dataUrl) {
  const m = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], buffer: Buffer.from(m[2], "base64") };
}

export function galleryMediaPath(id, ext) {
  return path.join(FILES_DIR, `${id}.${ext}`);
}

export function formatGalleryCreatedAt(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function toClientGalleryItem(record) {
  return {
    id: record.id,
    type: record.type,
    url: `/api/studio/gallery/${record.id}/media`,
    prompt: record.prompt,
    provider: record.provider,
    createdAt: formatGalleryCreatedAt(record.createdAt),
    createdAtMs: record.createdAt,
    ...(record.meta || {}),
  };
}

export function purgeExpiredGallery(now = Date.now()) {
  const { items } = readIndex();
  const kept = [];
  let removed = 0;

  for (const item of items) {
    if (!item?.createdAt || now - item.createdAt > GALLERY_TTL_MS) {
      const filePath = galleryMediaPath(item.id, item.ext);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch {
        // ignore
      }
      removed += 1;
    } else {
      kept.push(item);
    }
  }

  if (removed > 0) writeIndex(kept);
  return removed;
}

export function listGalleryItems() {
  purgeExpiredGallery();
  const { items } = readIndex();
  return items
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(toClientGalleryItem);
}

export function getGalleryRecord(id) {
  purgeExpiredGallery();
  const { items } = readIndex();
  return items.find((i) => i.id === id) || null;
}

export function deleteGalleryItem(id) {
  const { items } = readIndex();
  const target = items.find((i) => i.id === id);
  if (!target) return false;
  const filePath = galleryMediaPath(id, target.ext);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
  writeIndex(items.filter((i) => i.id !== id));
  return true;
}

export function saveGalleryFromDataUrl({
  type,
  prompt,
  provider,
  dataUrl,
  meta = {},
}) {
  purgeExpiredGallery();
  const parsed = parseDataUrl(dataUrl);
  if (!parsed || parsed.buffer.length < 32) {
    throw new Error("Invalid or empty media data");
  }

  const id = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const ext = mimeToExt(parsed.mime);
  const createdAt = Date.now();
  ensureDirs();
  fs.writeFileSync(galleryMediaPath(id, ext), parsed.buffer);

  const record = {
    id,
    type,
    prompt: String(prompt || "").slice(0, 4000),
    provider: String(provider || "Studio").slice(0, 200),
    mime: parsed.mime,
    ext,
    createdAt,
    meta,
  };

  const { items } = readIndex();
  items.push(record);
  writeIndex(items);

  return toClientGalleryItem(record);
}
