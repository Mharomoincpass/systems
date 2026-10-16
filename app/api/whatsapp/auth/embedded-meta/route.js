import { NextResponse } from "next/server";
import { getEmbeddedSignupPublicMeta } from "@/lib/whatsapp/embeddedSignup";

export const runtime = "nodejs";

/** Public: app id + config id only (required for FB.login on the client). */
export async function GET() {
  const data = getEmbeddedSignupPublicMeta();
  return NextResponse.json({ ok: true, data });
}
