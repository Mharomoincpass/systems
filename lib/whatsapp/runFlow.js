import { synthesizeSpeech } from "@/lib/elevenlabs/tts";
import {
  getWhatsAppFlowConfig,
  hasSeenContact,
  markContactWelcomed,
} from "./flowStore";
import {
  sendWhatsAppAudio,
  sendWhatsAppImage,
  sendWhatsAppText,
  uploadWhatsAppMedia,
} from "./graph";
import { appendWhatsAppMessage } from "./messageStore";
import { getLocalDevApiOrigin, getPublicAppUrl } from "@/lib/publicAppUrl";

async function generateImageFromPrompt(prompt) {
  const origin =
    process.env.NODE_ENV === "development"
      ? getLocalDevApiOrigin()
      : getPublicAppUrl();
  const res = await fetch(`${origin}/api/studio/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "image",
      prompt: prompt.trim(),
      aspectRatio: "1:1",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Image generation failed");
  }
  const originPublic = getPublicAppUrl();
  return data.url.startsWith("http")
    ? data.url
    : `${originPublic}${data.url.startsWith("/") ? "" : "/"}${data.url}`;
}

function stripPrefix(body, prefix) {
  const p = String(prefix || "").trim();
  if (!p) return body.trim();
  const lower = body.toLowerCase();
  if (lower.startsWith(p.toLowerCase())) {
    return body.slice(p.length).trim();
  }
  return body.trim();
}

function pickRule(rules, body) {
  const text = body.trim();
  const lower = text.toLowerCase();
  for (const rule of rules) {
    const type = rule.matchType || "exact";
    const match = String(rule.match || "");
    if (type === "default") return rule;
    if (type === "exact" && lower === match.toLowerCase()) return rule;
    if (type === "prefix" && lower.startsWith(match.toLowerCase())) return rule;
    if (type === "contains" && lower.includes(match.toLowerCase())) return rule;
  }
  return rules.find((r) => r.matchType === "default") || null;
}

async function sendVoice(from, text, phoneNumberId) {
  const { settings } = getWhatsAppFlowConfig();
  if (!settings.voiceEnabled) {
    await sendWhatsAppText(from, "Voice replies are disabled in bot settings.", phoneNumberId);
    return;
  }
  await sendWhatsAppText(from, "Synthesizing voice…", phoneNumberId);
  const speech = await synthesizeSpeech(text);
  if (!speech.ok) {
    await sendWhatsAppText(from, `Voice failed: ${speech.error}`, phoneNumberId);
    return;
  }
  const uploaded = await uploadWhatsAppMedia(speech.buffer, speech.mimeType, phoneNumberId);
  if (!uploaded.success) {
    await sendWhatsAppText(from, `Audio upload failed: ${uploaded.error}`, phoneNumberId);
    return;
  }
  const sent = await sendWhatsAppAudio(from, uploaded.mediaId, phoneNumberId);
  if (!sent.success) {
    await sendWhatsAppText(from, `Voice send failed: ${sent.error}`, phoneNumberId);
  }
}

async function sendImage(from, prompt, phoneNumberId) {
  const { settings } = getWhatsAppFlowConfig();
  if (!settings.imageEnabled) {
    await sendWhatsAppText(from, "Image generation is disabled in bot settings.", phoneNumberId);
    return;
  }
  await sendWhatsAppText(from, "Generating image…", phoneNumberId);
  const imageUrl = await generateImageFromPrompt(prompt);
  const img = await sendWhatsAppImage(from, imageUrl, prompt.slice(0, 200), phoneNumberId);
  if (!img.success) {
    await sendWhatsAppText(
      from,
      `Image ready but send failed: ${img.error}\n${imageUrl}`,
      phoneNumberId
    );
  }
}

export async function runWhatsAppFlow({ from, text, phoneNumberId, waMessageId }) {
  const body = (text || "").trim();
  if (!body || !from) return;

  const flow = getWhatsAppFlowConfig();
  const { settings, rules } = flow;

  appendWhatsAppMessage({
    direction: "in",
    from,
    waMessageId,
    text: body.slice(0, 2000),
  });

  if (settings.sendWelcomeOnce && !hasSeenContact(from)) {
    markContactWelcomed(from);
    if (settings.welcomeMessage?.trim()) {
      await sendWhatsAppText(from, settings.welcomeMessage.trim(), phoneNumberId);
    }
  }

  const rule = pickRule(rules, body);
  if (!rule) {
    await sendWhatsAppText(from, settings.helpText || "No matching flow rule.", phoneNumberId);
    return;
  }

  const action = rule.action || "image";
  if (action === "help") {
    await sendWhatsAppText(from, settings.helpText, phoneNumberId);
    return;
  }

  if (action === "text") {
    const reply = rule.replyText || rule.body || "OK";
    await sendWhatsAppText(from, reply, phoneNumberId);
    return;
  }

  if (action === "voice") {
    const voiceText = stripPrefix(body, rule.match);
    if (!voiceText) {
      await sendWhatsAppText(from, `Usage: ${rule.match} your message`, phoneNumberId);
      return;
    }
    await sendVoice(from, voiceText, phoneNumberId);
    return;
  }

  if (action === "image") {
    let prompt = body;
    if (rule.matchType === "prefix") {
      prompt = stripPrefix(body, rule.match);
    }
    if (!prompt) {
      await sendWhatsAppText(from, "Send a prompt for an image.", phoneNumberId);
      return;
    }
    try {
      await sendImage(from, prompt, phoneNumberId);
    } catch (err) {
      await sendWhatsAppText(
        from,
        `Could not generate: ${err?.message || "error"}`,
        phoneNumberId
      );
    }
  }
}
