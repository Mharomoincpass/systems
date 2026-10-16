import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/studioAdminAuth";
import { getEmbeddedSignupPublicMeta } from "@/lib/whatsapp/embeddedSignup";

export const runtime = "nodejs";

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const data = getEmbeddedSignupPublicMeta();
  return NextResponse.json({ ok: true, data });
}
