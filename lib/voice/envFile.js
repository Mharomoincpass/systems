import fs from "node:fs";
import path from "node:path";

function envPath() {
  return path.join(process.cwd(), ".env");
}

/** Set or replace one KEY=value line in .env (no quotes unless value has spaces). */
export function upsertEnvLine(key, value) {
  const file = envPath();
  if (!fs.existsSync(file)) {
    throw new Error(".env file not found on server");
  }
  const raw = String(value ?? "").trim();
  if (!raw) return;
  const safe = /[\s#"']/.test(raw) ? `"${raw.replace(/"/g, '\\"')}"` : raw;
  const line = `${key}=${safe}`;
  let content = fs.readFileSync(file, "utf8");
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, line);
  } else {
    content = `${content.replace(/\s*$/, "")}\n${line}\n`;
  }
  fs.writeFileSync(file, content, "utf8");
}
