import { NextResponse } from "next/server";
import { getVoiceConfig, saveVoiceConfig } from "@/lib/voice/configStore";
import { getVoiceMeta, syncAgentToElevenLabs } from "@/lib/voice/elevenAgent";

export const runtime = "nodejs";

export async function GET() {
  const config = getVoiceConfig();
  const meta = getVoiceMeta();
  return NextResponse.json({
    ok: true,
    config,
    meta: {
      elevenLabsConfigured: meta.elevenLabsConfigured,
      agentId: meta.agentId,
      defaultVoiceId: meta.defaultVoiceId,
    },
  });
}

export async function PUT(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const saved = saveVoiceConfig({
    agentId: body?.agentId,
    systemPrompt: body?.systemPrompt,
    voiceId: body?.voiceId,
  });
  let syncWarning = null;
  try {
    await syncAgentToElevenLabs({
      systemPrompt: saved.systemPrompt,
      voiceId: saved.voiceId || undefined,
    });
  } catch (e) {
    syncWarning = e?.message || "Could not sync to ElevenLabs agent";
  }
  return NextResponse.json({ ok: true, config: saved, syncWarning });
}
