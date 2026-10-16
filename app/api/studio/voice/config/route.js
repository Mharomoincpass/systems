import { NextResponse } from "next/server";
import { getVoiceConfig, saveVoiceConfig } from "@/lib/voice/configStore";
import { getVoiceMeta } from "@/lib/voice/chat";

export const runtime = "nodejs";

export async function GET() {
  const config = getVoiceConfig();
  const meta = getVoiceMeta();
  return NextResponse.json({
    ok: true,
    config,
    meta: {
      openaiConfigured: meta.openaiConfigured,
      elevenLabsConfigured: meta.elevenLabsConfigured,
      defaultVoiceId: meta.voiceId,
      model: meta.model,
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
    systemPrompt: body?.systemPrompt,
    voiceId: body?.voiceId,
  });
  return NextResponse.json({ ok: true, config: saved });
}
