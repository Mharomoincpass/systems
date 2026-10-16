import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/studioAdminAuth";
import { listWhatsAppTemplates } from "@/lib/whatsapp/templates";

export const runtime = "nodejs";

/** GET ?search= — list WABA templates (admin). */
export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const search = request.nextUrl.searchParams.get("search") || "";
  const result = await listWhatsAppTemplates({ search });
  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, templates: result.templates });
}
