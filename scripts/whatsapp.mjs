/**
 * Meta WhatsApp Cloud API — terminal CLI (no MCP).
 * Uses Graph API over HTTPS; same credentials as production webhook.
 *
 * Usage:
 *   npm run whatsapp -- help
 *   npm run whatsapp -- check
 *   npm run whatsapp -- phone
 *   npm run whatsapp -- send 919876543210 "Hello from CLI"
 *   npm run whatsapp -- subscribe
 *   npm run whatsapp -- webhook
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile();

const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";
const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim();
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://mharomo.systems";

function graphUrl(path) {
  return `https://graph.facebook.com/${apiVersion}${path}`;
}

async function graphRequest(path, { method = "GET", body } = {}) {
  if (!token) {
    console.error("Missing WHATSAPP_ACCESS_TOKEN in .env");
    process.exit(1);
  }
  const res = await fetch(graphUrl(path), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

function help() {
  console.log(`
WhatsApp Cloud API CLI (Meta Graph — not MCP)

Dev/test (API Setup):
  Meta test number + temporary token + test recipients on "To" list.

Production Option B (see docs/WHATSAPP_PRODUCTION.md):
  Business System User long-lived token, real WABA phone, WHATSAPP_APP_SECRET,
  npm run whatsapp -- subscribe && register <PIN>
  Templates for messaging any number outside the 24h window.

Required .env:
  WHATSAPP_ACCESS_TOKEN=
  WHATSAPP_PHONE_NUMBER_ID=
  WHATSAPP_VERIFY_TOKEN=        (you invent this string)
  WHATSAPP_APP_SECRET=          (recommended, for webhook signatures)

Optional:
  WHATSAPP_BUSINESS_ACCOUNT_ID= (WABA id, for subscribe command)
  WHATSAPP_API_VERSION=v21.0
  NEXT_PUBLIC_APP_URL=https://mharomo.systems

Commands:
  check              Show which env vars are set
  phone              GET phone number metadata from Graph API
  send <to> <text>   Send a test text (to = country code + number, no +)
  send-image <to> <url> [caption]
  register <pin>     Register Meta test number with Cloud API (6-digit PIN)
  voice <text>       Test ElevenLabs TTS locally (writes /tmp not sent)
  subscribe          POST subscribed_apps on WABA (needs WHATSAPP_BUSINESS_ACCOUNT_ID)
  phones             List phone numbers on your WABA (copy Phone number ID into .env)
  templates [search] List approved WABA message templates
  send-template <to> <name> [language] [body1 body2…]
  webhook            Print callback URL + verify token for Meta Configuration UI

Webhook URL to paste in Meta (WhatsApp → Configuration):
  ${appUrl.replace(/\/$/, "")}/api/whatsapp/webhook

Test verification locally (dev server running):
  curl "${appUrl.replace(/\/$/, "")}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test123"
`);
}

function check() {
  const keys = [
    "WHATSAPP_ACCESS_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_VERIFY_TOKEN",
    "WHATSAPP_APP_SECRET",
    "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "NEXT_PUBLIC_APP_URL",
  ];
  for (const k of keys) {
    const v = process.env[k]?.trim();
    console.log(`${v ? "OK" : "—"} ${k}${v ? ` (${k.includes("TOKEN") || k.includes("SECRET") ? "***" : v})` : ""}`);
  }
}

async function phone() {
  if (!phoneNumberId) {
    console.error("Set WHATSAPP_PHONE_NUMBER_ID");
    process.exit(1);
  }
  const data = await graphRequest(`/${phoneNumberId}`);
  console.log(JSON.stringify(data, null, 2));
}

async function sendImage(to, imageUrl, ...captionParts) {
  const caption = captionParts.join(" ").trim();
  if (!to || !imageUrl) {
    console.error("Usage: npm run whatsapp -- send-image 919876543210 https://… \"caption\"");
    process.exit(1);
  }
  if (!phoneNumberId) {
    console.error("Set WHATSAPP_PHONE_NUMBER_ID");
    process.exit(1);
  }
  let link = imageUrl.trim();
  link = link.replace(/\.webp(\?|$)/gi, ".jpg$1");
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: String(to).replace(/\D/g, ""),
    type: "image",
    image: {
      link: link.slice(0, 2048),
      ...(caption ? { caption: caption.slice(0, 1024) } : {}),
    },
  };
  const data = await graphRequest(`/${phoneNumberId}/messages`, {
    method: "POST",
    body: payload,
  });
  console.log(JSON.stringify(data, null, 2));
}

async function registerPhone(pin) {
  const pinDigits = String(pin || "").replace(/\D/g, "");
  if (pinDigits.length < 6) {
    console.error("Usage: npm run whatsapp -- register 123456");
    process.exit(1);
  }
  const data = await graphRequest(`/${phoneNumberId}/register`, {
    method: "POST",
    body: { messaging_product: "whatsapp", pin: pinDigits },
  });
  console.log(JSON.stringify(data, null, 2));
}

async function send(to, ...textParts) {
  const text = textParts.join(" ").trim();
  if (!to || !text) {
    console.error("Usage: npm run whatsapp -- send 919876543210 \"Hello\"");
    process.exit(1);
  }
  if (!phoneNumberId) {
    console.error("Set WHATSAPP_PHONE_NUMBER_ID");
    process.exit(1);
  }
  const data = await graphRequest(`/${phoneNumberId}/messages`, {
    method: "POST",
    body: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: String(to).replace(/\D/g, ""),
      type: "text",
      text: { body: text.slice(0, 4096) },
    },
  });
  console.log(JSON.stringify(data, null, 2));
}

async function subscribe() {
  if (!wabaId) {
    console.error("Set WHATSAPP_BUSINESS_ACCOUNT_ID (WABA id from API Setup)");
    process.exit(1);
  }
  const data = await graphRequest(`/${wabaId}/subscribed_apps`, {
    method: "POST",
  });
  console.log(JSON.stringify(data, null, 2));
}

async function phones() {
  if (!wabaId) {
    console.error("Set WHATSAPP_BUSINESS_ACCOUNT_ID (WABA id from API Setup)");
    process.exit(1);
  }
  const data = await graphRequest(
    `/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating`
  );
  console.log(JSON.stringify(data, null, 2));
}

async function templates(search = "") {
  if (!wabaId) {
    console.error("Set WHATSAPP_BUSINESS_ACCOUNT_ID");
    process.exit(1);
  }
  let path = `/${wabaId}/message_templates?limit=100&fields=name,status,language,category`;
  if (search) path += `&name=${encodeURIComponent(search)}`;
  const data = await graphRequest(path);
  console.log(JSON.stringify(data, null, 2));
}

async function sendTemplate(to, templateName, languageCode, ...bodyParts) {
  if (!to || !templateName) {
    console.error("Usage: npm run whatsapp -- send-template 919876543210 hello_world en");
    process.exit(1);
  }
  if (!phoneNumberId) {
    console.error("Set WHATSAPP_PHONE_NUMBER_ID");
    process.exit(1);
  }
  const lang = (languageCode || "en").replace(/-/g, "_");
  const components = [];
  if (bodyParts.length) {
    components.push({
      type: "body",
      parameters: bodyParts.map((text) => ({ type: "text", text: String(text).slice(0, 1024) })),
    });
  }
  const payload = {
    messaging_product: "whatsapp",
    to: String(to).replace(/\D/g, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: lang },
      ...(components.length ? { components } : {}),
    },
  };
  const data = await graphRequest(`/${phoneNumberId}/messages`, {
    method: "POST",
    body: payload,
  });
  console.log(JSON.stringify(data, null, 2));
}

function webhookInfo() {
  console.log("Callback URL:");
  console.log(`  ${appUrl.replace(/\/$/, "")}/api/whatsapp/webhook`);
  console.log("\nVerify token (must match WHATSAPP_VERIFY_TOKEN in .env):");
  console.log(`  ${verifyToken || "(not set)"}`);
  console.log("\nMeta path: App → WhatsApp → Configuration → Webhook → Edit");
  console.log("Subscribe to: messages");
}

const [cmd, ...rest] = process.argv.slice(2);

try {
  switch (cmd) {
    case undefined:
    case "help":
      help();
      break;
    case "check":
      check();
      break;
    case "phone":
      await phone();
      break;
    case "send":
      await send(...rest);
      break;
    case "send-image":
      await sendImage(...rest);
      break;
    case "register":
      await registerPhone(rest[0]);
      break;
    case "subscribe":
      await subscribe();
      break;
    case "phones":
      await phones();
      break;
    case "templates":
      await templates(rest[0] || "");
      break;
    case "send-template":
      await sendTemplate(rest[0], rest[1], rest[2], ...rest.slice(3));
      break;
    case "webhook":
      webhookInfo();
      break;
    default:
      console.error(`Unknown command: ${cmd}\n`);
      help();
      process.exit(1);
  }
} catch (err) {
  console.error(err?.message || err);
  process.exit(1);
}
