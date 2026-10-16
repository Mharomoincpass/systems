import { synthesizeSpeech } from "@/lib/elevenlabs/tts";
import {
  sendWhatsAppAudio,
  sendWhatsAppImage,
  sendWhatsAppText,
  uploadWhatsAppMedia,
} from "./graph";
import { appendWhatsAppMessage } from "./messageStore";

function publicAppOrigin() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "https://mharomo.systems";
  return base.replace(/\/$/, "");
}

async function generateImageFromPrompt(prompt) {
  const origin =
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:3000"
      : publicAppOrigin();
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
  const originPublic = publicAppOrigin();
  const url = data.url.startsWith("http")
    ? data.url
    : `${originPublic}${data.url.startsWith("/") ? "" : "/"}${data.url}`;
  return url;
}

const HELP_TEXT = `FrsionOS WhatsApp

• Send any text → 1:1 image (Pollinations)
• /image your prompt
• /voice your text → voice note (ElevenLabs)

help — this message`;

async function handleVoiceReply(from, text, phoneNumberId) {
  await sendWhatsAppText(from, "Synthesizing voice…", phoneNumberId);
  const speech = await synthesizeSpeech(text);
  if (!speech.ok) {
    await sendWhatsAppText(
      from,
      `Voice failed: ${speech.error}. Set ELEVENLABS_API_KEY on the server.`,
      phoneNumberId
    );
    appendWhatsAppMessage({
      direction: "out",
      from,
      kind: "voice_error",
      error: speech.error,
    });
    return;
  }
  const uploaded = await uploadWhatsAppMedia(
    speech.buffer,
    speech.mimeType,
    phoneNumberId
  );
  if (!uploaded.success) {
    await sendWhatsAppText(
      from,
      `Could not upload audio to WhatsApp: ${uploaded.error}`,
      phoneNumberId
    );
    return;
  }
  const sent = await sendWhatsAppAudio(from, uploaded.mediaId, phoneNumberId);
  appendWhatsAppMessage({
    direction: "out",
    from,
    kind: "voice",
    success: sent.success,
    messageId: sent.messageId,
    error: sent.error,
  });
  if (!sent.success) {
    await sendWhatsAppText(from, `Voice send failed: ${sent.error}`, phoneNumberId);
  }
}

async function handleImageReply(from, prompt, phoneNumberId) {
  await sendWhatsAppText(from, "Generating image…", phoneNumberId);
  const imageUrl = await generateImageFromPrompt(prompt);
  const img = await sendWhatsAppImage(
    from,
    imageUrl,
    prompt.slice(0, 200),
    phoneNumberId
  );
  appendWhatsAppMessage({
    direction: "out",
    from,
    kind: "image",
    success: img.success,
    messageId: img.messageId,
    prompt: prompt.slice(0, 500),
    error: img.error,
  });
  if (!img.success) {
    await sendWhatsAppText(
      from,
      `Image ready but WhatsApp send failed: ${img.error}\n${imageUrl}`,
      phoneNumberId
    );
  }
}

export async function handleWhatsAppTextMessage({
  from,
  text,
  phoneNumberId,
  waMessageId,
}) {
  const body = (text || "").trim();
  if (!body || !from) return;

  appendWhatsAppMessage({
    direction: "in",
    from,
    waMessageId,
    text: body.slice(0, 2000),
  });

  if (body.toLowerCase() === "help") {
    await sendWhatsAppText(from, HELP_TEXT, phoneNumberId);
    return;
  }

  const lower = body.toLowerCase();
  if (lower.startsWith("/voice")) {
    const voiceText = body.slice(6).trim();
    if (!voiceText) {
      await sendWhatsAppText(from, "Usage: /voice say something here", phoneNumberId);
      return;
    }
    await handleVoiceReply(from, voiceText, phoneNumberId);
    return;
  }

  let prompt = body;
  if (lower.startsWith("/image")) {
    prompt = body.slice(6).trim();
  }
  if (!prompt) {
    await sendWhatsAppText(from, "Send a prompt or use /voice …", phoneNumberId);
    return;
  }

  try {
    await handleImageReply(from, prompt, phoneNumberId);
  } catch (err) {
    await sendWhatsAppText(
      from,
      `Could not generate: ${err?.message || "unknown error"}`,
      phoneNumberId
    );
    appendWhatsAppMessage({
      direction: "out",
      from,
      kind: "image_error",
      error: err?.message,
    });
  }
}
