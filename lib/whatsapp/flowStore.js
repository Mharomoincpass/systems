import fs from "node:fs";
import path from "node:path";
import { DEFAULT_WHATSAPP_FLOW } from "./flowDefaults";

const ROOT = path.join(process.cwd(), "storage", "whatsapp");
const FLOW_PATH = path.join(ROOT, "flow.json");
const SESSIONS_PATH = path.join(ROOT, "sessions.json");

function ensureDir() {
  fs.mkdirSync(ROOT, { recursive: true });
}

function readJson(filePath, fallback) {
  ensureDir();
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function getWhatsAppFlowConfig() {
  const stored = readJson(FLOW_PATH, null);
  if (!stored?.settings || !Array.isArray(stored?.rules)) {
    return structuredClone(DEFAULT_WHATSAPP_FLOW);
  }
  return {
    settings: { ...DEFAULT_WHATSAPP_FLOW.settings, ...stored.settings },
    rules: stored.rules.length ? stored.rules : DEFAULT_WHATSAPP_FLOW.rules,
  };
}

export function saveWhatsAppFlowConfig(config) {
  const next = {
    settings: { ...DEFAULT_WHATSAPP_FLOW.settings, ...config?.settings },
    rules: Array.isArray(config?.rules) ? config.rules : DEFAULT_WHATSAPP_FLOW.rules,
    updatedAt: Date.now(),
  };
  writeJson(FLOW_PATH, next);
  return next;
}

export function hasSeenContact(phone) {
  const key = String(phone || "").replace(/\D/g, "");
  if (!key) return true;
  const sessions = readJson(SESSIONS_PATH, {});
  return Boolean(sessions[key]?.welcomed);
}

export function markContactWelcomed(phone) {
  const key = String(phone || "").replace(/\D/g, "");
  if (!key) return;
  const sessions = readJson(SESSIONS_PATH, {});
  sessions[key] = { ...(sessions[key] || {}), welcomed: true, at: Date.now() };
  writeJson(SESSIONS_PATH, sessions);
}
