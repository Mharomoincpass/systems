import { getVoiceConfig } from "./configStore";
import { getElevenLabsConfig, synthesizeSpeech } from "@/lib/elevenlabs/tts";

export function getVoiceMeta() {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const eleven = getElevenLabsConfig();
  const cfg = getVoiceConfig();
  const voiceId = cfg.voiceId || eleven.voiceId;
  return {
    openaiConfigured: Boolean(openaiKey),
    elevenLabsConfigured: eleven.configured,
    voiceId,
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
  };
}

export async function voiceChatReply(userMessage, history = []) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Set OPENAI_API_KEY on the server for Voice AI chat.");
  }
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const { systemPrompt } = getVoiceConfig();

  const messages = [
    { role: "system", content: systemPrompt },
    ...history
      .filter((m) => m?.role && m?.content)
      .slice(-12)
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) })),
    { role: "user", content: String(userMessage || "").slice(0, 4000) },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 300,
      temperature: 0.7,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenAI HTTP ${res.status}`);
  }
  const replyText = data?.choices?.[0]?.message?.content?.trim();
  if (!replyText) throw new Error("Empty reply from model");

  const cfg = getVoiceConfig();
  const eleven = getElevenLabsConfig();
  const voiceId = cfg.voiceId || eleven.voiceId;

  let audioBase64 = null;
  let audioMime = null;
  if (eleven.configured) {
    const speech = await synthesizeSpeech(replyText, voiceId);

    if (speech.ok) {
      audioBase64 = speech.buffer.toString("base64");
      audioMime = speech.mimeType;
    }
  }

  return { replyText, audioBase64, audioMime };
}
