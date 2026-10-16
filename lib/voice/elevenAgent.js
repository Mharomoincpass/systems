import { getElevenLabsConfig } from "@/lib/elevenlabs/tts";
import { getVoiceConfig } from "./configStore";

export function resolveAgentId() {
  const cfg = getVoiceConfig();
  return (
    cfg.agentId?.trim() ||
    process.env.ELEVENLABS_AGENT_ID?.trim() ||
    ""
  );
}

export function getVoiceMeta() {
  const eleven = getElevenLabsConfig();
  const agentId = resolveAgentId();
  return {
    elevenLabsConfigured: eleven.configured,
    agentId: agentId || null,
    defaultVoiceId: eleven.voiceId,
  };
}

export async function getConversationSignedUrl(agentId) {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Set ELEVENLABS_API_KEY on the server.");
  }
  if (!agentId) {
    throw new Error("Set your ElevenLabs Agent ID in the Config tab.");
  }
  const url = new URL(
    "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"
  );
  url.searchParams.set("agent_id", agentId);
  const res = await fetch(url.toString(), {
    headers: { "xi-api-key": apiKey },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.detail?.message ||
        data?.detail ||
        data?.message ||
        `ElevenLabs HTTP ${res.status}`
    );
  }
  if (!data?.signed_url) {
    throw new Error("ElevenLabs did not return a signed URL.");
  }
  return data.signed_url;
}

/** Push prompt + voice to the ElevenLabs agent (optional fields). */
export async function syncAgentToElevenLabs({ systemPrompt, voiceId }) {
  const agentId = resolveAgentId();
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!agentId || !apiKey) return { synced: false };

  const conversation_config = {};
  if (systemPrompt?.trim()) {
    conversation_config.agent = {
      prompt: { prompt: systemPrompt.trim() },
    };
  }
  if (voiceId?.trim()) {
    conversation_config.tts = { voice_id: voiceId.trim() };
  }
  if (!Object.keys(conversation_config).length) {
    return { synced: false };
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${encodeURIComponent(agentId)}`,
    {
      method: "PATCH",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation_config }),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.detail?.message ||
        data?.detail ||
        data?.message ||
        `Agent update failed (${res.status})`
    );
  }
  return { synced: true };
}
