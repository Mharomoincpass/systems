import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/studioAdminAuth";
import {
  loadRecipients,
  addRecipient,
  removeRecipient,
} from "@/lib/whatsapp/recipientStore";

export const runtime = "nodejs";

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, recipients: loadRecipients() });
}

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
    const list = addRecipient({ phone: body?.phone, name: body?.name });
    return NextResponse.json({ ok: true, recipients: list });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ ok: false, error: "Missing phone" }, { status: 400 });
  }
  const list = removeRecipient(phone);
  return NextResponse.json({ ok: true, recipients: list });
}
