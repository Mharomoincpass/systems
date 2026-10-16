import { NextResponse } from "next/server";
import {
  getWhatsAppFlowConfig,
  saveWhatsAppFlowConfig,
} from "@/lib/whatsapp/flowStore";
import { getPublicAppUrl } from "@/lib/publicAppUrl";

export const runtime = "nodejs";

export async function GET() {
  const config = getWhatsAppFlowConfig();
  const appUrl = getPublicAppUrl();
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim() || "";
  return NextResponse.json({
    ok: true,
    config,
    meta: {
      webhookPath: "/api/whatsapp/webhook",
      webhookUrl: `${appUrl.replace(/\/$/, "")}/api/whatsapp/webhook`,
      verifyTokenSet: Boolean(verifyToken),
      voiceConfigured: Boolean(process.env.ELEVENLABS_API_KEY?.trim()),
      whatsappConfigured: Boolean(
        process.env.WHATSAPP_ACCESS_TOKEN?.trim() &&
          process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
      ),
      appSecretSet: Boolean(process.env.WHATSAPP_APP_SECRET?.trim()),
      productionMode: process.env.WHATSAPP_PRODUCTION?.trim() === "true",
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
  if (!body?.settings || !Array.isArray(body?.rules)) {
    return NextResponse.json(
      { ok: false, error: "Expected { settings, rules }" },
      { status: 400 }
    );
  }
  const saved = saveWhatsAppFlowConfig(body);
  return NextResponse.json({ ok: true, config: saved });
}
