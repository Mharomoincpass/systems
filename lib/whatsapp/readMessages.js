import fs from "node:fs";
import path from "node:path";

const MESSAGES_PATH = path.join(process.cwd(), "storage", "whatsapp", "messages.jsonl");

export function readRecentWhatsAppMessages(limit = 80) {
  if (!fs.existsSync(MESSAGES_PATH)) return [];
  try {
    const lines = fs.readFileSync(MESSAGES_PATH, "utf8").split("\n").filter(Boolean);
    const tail = lines.slice(-limit);
    return tail
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();
  } catch {
    return [];
  }
}
