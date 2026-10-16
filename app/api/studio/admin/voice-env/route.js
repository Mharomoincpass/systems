import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/studioAdminAuth";
import { upsertEnvLine } from "@/lib/voice/envFile";
import { saveVoiceConfig } from "@/lib/voice/configStore";
import { getVoiceMeta } from "@/lib/voice/elevenAgent";

export const runtime = "nodejs";

/** Studio admin: write ElevenLabs secrets to server .env (never returned to client). */
export async function POST(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  try {
    if (body?.apiKey?.trim()) {
      upsertEnvLine("ELEVENLABS_API_KEY", body.apiKey.trim());
    }
    if (body?.agentId?.trim()) {
      upsertEnvLine("ELEVENLABS_AGENT_ID", body.agentId.trim());
      saveVoiceConfig({ agentId: body.agentId.trim() });
    }
    process.env.ELEVENLABS_API_KEY =
      body?.apiKey?.trim() || process.env.ELEVENLABS_API_KEY;
    process.env.ELEVENLABS_AGENT_ID =
      body?.agentId?.trim() || process.env.ELEVENLABS_AGENT_ID;

    const meta = getVoiceMeta();
    return NextResponse.json({
      ok: true,
      meta: {
        elevenLabsConfigured: meta.elevenLabsConfigured,
        agentId: meta.agentId,
      },
      note: "Restart pm2 with --update-env if call still fails after save.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Could not update .env" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const meta = getVoiceMeta();
  return NextResponse.json({
    ok: true,
    meta: {
      elevenLabsConfigured: meta.elevenLabsConfigured,
      agentId: meta.agentId,
    },
  });
}
