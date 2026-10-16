import { NextResponse } from "next/server";
import {
  getConversationSignedUrl,
  resolveAgentId,
} from "@/lib/voice/elevenAgent";
import { getElevenLabsConfig } from "@/lib/elevenlabs/tts";

export const runtime = "nodejs";

export async function GET() {
  const eleven = getElevenLabsConfig();
  if (!eleven.configured) {
    return NextResponse.json(
      { ok: false, error: "Set ELEVENLABS_API_KEY on the server." },
      { status: 503 }
    );
  }
  const agentId = resolveAgentId();
  if (!agentId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Set ElevenLabs Agent ID in Config (or ELEVENLABS_AGENT_ID in .env).",
      },
      { status: 400 }
    );
  }
  try {
    const signedUrl = await getConversationSignedUrl(agentId);
    return NextResponse.json({ ok: true, signedUrl, agentId });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Could not start session" },
      { status: 400 }
    );
  }
}
