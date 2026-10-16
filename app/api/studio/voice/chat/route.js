import { NextResponse } from "next/server";
import { voiceChatReply } from "@/lib/voice/chat";

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const message = String(body?.message || "").trim();
  if (!message) {
    return NextResponse.json({ ok: false, error: "Missing message" }, { status: 400 });
  }
  try {
    const data = await voiceChatReply(message, body?.history || []);
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Voice chat failed" },
      { status: 400 }
    );
  }
}
