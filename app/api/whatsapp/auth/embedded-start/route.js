import { NextResponse } from "next/server";
import { buildEmbeddedSignupAuthorizeUrl } from "@/lib/whatsapp/embeddedSignup";

export const runtime = "nodejs";

/** Redirect popup to Meta OAuth with config_id from server env. */
export async function GET() {
  const url = buildEmbeddedSignupAuthorizeUrl();
  if (!url) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Set WHATSAPP_FB_APP_ID and WHATSAPP_EMBEDDED_CONFIG_ID on the server.",
      },
      { status: 503 }
    );
  }
  return NextResponse.redirect(url);
}
