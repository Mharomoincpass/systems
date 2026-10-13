import { NextResponse } from "next/server";
import { appendStudioVisit } from "@/lib/studioAdminStore";
import { visitMetaFromRequest } from "@/lib/studioRequestMeta";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = String(body.path || "/").slice(0, 512);
    appendStudioVisit(
      visitMetaFromRequest(req, { path, method: "GET", kind: "page" })
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
