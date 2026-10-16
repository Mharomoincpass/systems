import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/studioAdminAuth";
import { saveWhatsAppConnection } from "@/lib/whatsapp/connectionStore";
import { runWhatsAppEmbeddedSignup } from "@/lib/whatsapp/embeddedSignup";

export const runtime = "nodejs";

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
    const data = await runWhatsAppEmbeddedSignup({
      code: body?.code,
      wabaId: body?.wabaId,
      phoneNumberId: body?.phoneNumberId,
      businessId: body?.businessId,
      registerPin: body?.registerPin,
      redirectUri: body?.redirectUri,
    });
    saveWhatsAppConnection(data);
    return NextResponse.json({
      ok: true,
      data: {
        wabaId: data.wabaId,
        phoneNumberId: data.phoneNumberId,
        displayPhoneNumber: data.displayPhoneNumber,
        verifiedName: data.verifiedName,
        tokenExpiresAt: data.tokenExpiresAt,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Embedded signup failed" },
      { status: 400 }
    );
  }
}
