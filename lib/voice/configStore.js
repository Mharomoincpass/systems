import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "storage", "voice");
const CONFIG_PATH = path.join(ROOT, "config.json");

const DEFAULTS = {
  agentId: "",
  systemPrompt:
    "You are a helpful voice assistant for FrsionOS. Keep replies short and conversational — one or two sentences unless the user asks for detail.",
  voiceId: "",
};

function ensureDir() {
  fs.mkdirSync(ROOT, { recursive: true });
}

export function getVoiceConfig() {
  ensureDir();
  if (!fs.existsSync(CONFIG_PATH)) {
    return { ...DEFAULTS };
  }
  try {
    const stored = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    return {
      agentId: stored.agentId ?? DEFAULTS.agentId,
      systemPrompt: stored.systemPrompt ?? DEFAULTS.systemPrompt,
      voiceId: stored.voiceId ?? DEFAULTS.voiceId,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveVoiceConfig(partial) {
  const current = getVoiceConfig();
  const next = {
    agentId:
      typeof partial?.agentId === "string" ? partial.agentId.trim() : current.agentId,
    systemPrompt:
      typeof partial?.systemPrompt === "string"
        ? partial.systemPrompt.trim() || DEFAULTS.systemPrompt
        : current.systemPrompt,
    voiceId:
      typeof partial?.voiceId === "string" ? partial.voiceId.trim() : current.voiceId,
    updatedAt: Date.now(),
  };
  ensureDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2), "utf8");
  return next;
}
