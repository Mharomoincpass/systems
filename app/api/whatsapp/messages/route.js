import { NextResponse } from "next/server";
import { readRecentWhatsAppMessages } from "@/lib/whatsapp/readMessages";

export const runtime = "nodejs";

export async function GET(request) {
  const limit = Number(request.nextUrl.searchParams.get("limit") || 80);
  const items = readRecentWhatsAppMessages(Math.min(200, Math.max(1, limit)));
  return NextResponse.json({ ok: true, items });
}
