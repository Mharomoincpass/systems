import { config } from "dotenv";
import { readFileSync } from "node:fs";

config({ path: ".env" });

const to = process.argv[2]?.trim();
if (!to) {
  console.error("Usage: npm run test:mail -- you@example.com");
  process.exit(1);
}

const apiKey = process.env.ZEPTOMAIL_API_KEY?.trim();
const from =
  process.env.ZEPTOMAIL_FROM?.trim() ||
  process.env.ZEPTOMAIL_FROM_ADDRESS?.trim() ||
  "";
const apiBase = (process.env.ZEPTOMAIL_API_BASE?.trim() || "https://api.zeptomail.in/v1.1").replace(
  /\/$/,
  ""
);

if (!apiKey || !from) {
  console.error("Missing ZEPTOMAIL_API_KEY or ZEPTOMAIL_FROM in .env");
  process.exit(1);
}

const auth = apiKey.startsWith("Zoho-enczapikey") ? apiKey : `Zoho-enczapikey ${apiKey}`;

const res = await fetch(`${apiBase}/email`, {
  method: "POST",
  headers: {
    Authorization: auth,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: { address: from },
    to: [{ email_address: { address: to } }],
    subject: "FrsionOS — npm test:mail",
    htmlbody: "<p>Studio ZeptoMail test from scripts/test-mail.mjs</p>",
    textbody: "Studio ZeptoMail test from scripts/test-mail.mjs",
  }),
});

const text = await res.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  data = { raw: text };
}

console.log({ apiBase, from, to, status: res.status, data });

if (!res.ok) process.exit(1);
