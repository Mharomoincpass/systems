import { NextResponse } from "next/server";
import { getWhatsAppConfig } from "@/lib/whatsapp/config";
import { verifyWebhookSignature } from "@/lib/whatsapp/graph";
import { processWhatsAppWebhookBody } from "@/lib/whatsapp/processWebhook";

export const runtime = "nodejs";

export async function GET(request) {
  const { verifyToken } = getWhatsAppConfig();
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (!verifyToken) {
    return new NextResponse("Server misconfiguration", { status: 500 });
  }
  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Meta expects a fast 200; process async (Grocliq postLeoWhatsappWebhook pattern).
  const response = NextResponse.json({ success: true });
  void processWhatsAppWebhookBody(payload).catch((err) => {
    console.error("WhatsApp webhook process error:", err);
  });
  return response;
}
