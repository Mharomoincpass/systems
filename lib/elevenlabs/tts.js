const ELEVEN_BASE = "https://api.elevenlabs.io/v1";

export function getElevenLabsConfig() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId =
    process.env.ELEVENLABS_VOICE_ID?.trim() || "21m00Tcm4TlvDq8ikWAM";
  const modelId =
    process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";
  return { apiKey, voiceId, modelId, configured: Boolean(apiKey) };
}

/**
 * @returns {Promise<{ ok: true, buffer: Buffer, mimeType: string } | { ok: false, error: string }>}
 */
export async function synthesizeSpeech(text) {
  const { apiKey, voiceId, modelId } = getElevenLabsConfig();
  if (!apiKey) {
    return { ok: false, error: "ELEVENLABS_API_KEY is not set" };
  }
  const input = String(text || "").trim().slice(0, 2500);
  if (!input) {
    return { ok: false, error: "Empty text for speech" };
  }

  const url = `${ELEVEN_BASE}/text-to-speech/${encodeURIComponent(voiceId)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: input,
        model_id: modelId,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        ok: false,
        error: errText.slice(0, 200) || `ElevenLabs HTTP ${res.status}`,
      };
    }
    const ab = await res.arrayBuffer();
    return { ok: true, buffer: Buffer.from(ab), mimeType: "audio/mpeg" };
  } catch (e) {
    return { ok: false, error: e?.message || "ElevenLabs request failed" };
  }
}
