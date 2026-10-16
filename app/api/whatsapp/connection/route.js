import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/studioAdminAuth";
import {
  clearWhatsAppConnection,
  getWhatsAppConnectionStatus,
} from "@/lib/whatsapp/connectionStore";

export const runtime = "nodejs";

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, data: getWhatsAppConnectionStatus() });
}

export async function DELETE(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  clearWhatsAppConnection();
  return NextResponse.json({ ok: true });
}
