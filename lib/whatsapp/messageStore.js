import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "storage", "whatsapp");
const MESSAGES_PATH = path.join(ROOT, "messages.jsonl");
const MAX_LINES = 5000;

function ensureDir() {
  fs.mkdirSync(ROOT, { recursive: true });
}

export function appendWhatsAppMessage(entry) {
  ensureDir();
  const line = JSON.stringify({
    at: Date.now(),
    ...entry,
  });
  fs.appendFileSync(MESSAGES_PATH, `${line}\n`, "utf8");
  try {
    const stat = fs.statSync(MESSAGES_PATH);
    if (stat.size > 2_000_000) {
      const lines = fs.readFileSync(MESSAGES_PATH, "utf8").split("\n").filter(Boolean);
      const tail = lines.slice(-MAX_LINES);
      fs.writeFileSync(MESSAGES_PATH, `${tail.join("\n")}\n`, "utf8");
    }
  } catch {
    /* ignore rotation errors */
  }
}
