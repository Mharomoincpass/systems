import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  getZeptoMailConfigStatus,
  sendZeptoMail,
} from "@/lib/zeptomailClient";

const OUTBOX_PATH = path.join(
  process.cwd(),
  "storage",
  "studio-admin",
  "outbox.json"
);

function ensureOutboxDir() {
  fs.mkdirSync(path.dirname(OUTBOX_PATH), { recursive: true });
}

function appendOutbox(entry) {
  ensureOutboxDir();
  let list = [];
  if (fs.existsSync(OUTBOX_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(OUTBOX_PATH, "utf8"));
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      list = [];
    }
  }
  list.unshift(entry);
  fs.writeFileSync(OUTBOX_PATH, JSON.stringify(list.slice(0, 200), null, 2), "utf8");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getStudioMailConfigStatus() {
  return getZeptoMailConfigStatus();
}

export const WELCOME_SUBSCRIBER_SUBJECT =
  "Welcome — bomboclat pussywagon updates";

export function getWelcomeSubscriberBody() {
  return [
    "Welcome! You've opted in to bomboclat pussywagon updates from FrsionOS.",
    "",
    "We'll email you when a new feature drops. Coming soon.",
    "",
    "— FrsionOS",
  ].join("\n");
}

export async function sendWelcomeSubscriberEmail(email) {
  return broadcastStudioEmail({
    recipients: [email],
    subject: WELCOME_SUBSCRIBER_SUBJECT,
    body: getWelcomeSubscriberBody(),
  });
}

export async function broadcastStudioEmail({ recipients, subject, body }) {
  const emails = [...new Set(recipients.map((e) => String(e).trim().toLowerCase()))].filter(
    Boolean
  );
  if (!emails.length) {
    throw new Error("No recipients");
  }

  const subj = String(subject || "").trim();
  const rawBody = String(body || "").trim();
  if (!subj || !rawBody) {
    throw new Error("Subject and body are required");
  }

  const htmlBody = `<div style="font-family:monospace;line-height:1.5">${escapeHtml(rawBody).replace(/\n/g, "<br/>")}</div>`;
  const textBody = rawBody;
  const batchId = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  let deliveredLive = 0;
  let queuedOutbox = 0;
  let failed = 0;
  const errors = [];
  const zeptoRequestIds = [];

  for (const to of emails) {
    try {
      const zepto = await sendZeptoMail({
        to,
        subject: subj,
        htmlbody: htmlBody,
        textbody: textBody,
        fromName: "FrsionOS",
      });
      if (zepto.delivered) {
        deliveredLive += 1;
        if (zepto.requestId) zeptoRequestIds.push({ to, requestId: zepto.requestId });
      } else {
        queuedOutbox += 1;
        appendOutbox({
          id: `${batchId}-${to}`,
          batchId,
          at: Date.now(),
          to,
          subject: subj,
          body: rawBody,
          mode: "outbox",
          reason: zepto.reason,
        });
      }
    } catch (err) {
      failed += 1;
      errors.push({ to, error: err?.message || "send failed" });
      appendOutbox({
        id: `${batchId}-${to}`,
        batchId,
        at: Date.now(),
        to,
        subject: subj,
        body: rawBody,
        mode: "failed",
        error: err?.message,
      });
    }
  }

  const mailConfig = getStudioMailConfigStatus();

  return {
    batchId,
    total: emails.length,
    sent: deliveredLive + queuedOutbox,
    deliveredLive,
    queuedOutbox,
    failed,
    errors: errors.slice(0, 20),
    usedZepto: deliveredLive > 0,
    mailConfigOk: mailConfig.ok,
    mailConfigReason: mailConfig.ok ? null : mailConfig.reason,
    zeptoRequestIds,
    subject: subj,
  };
}
