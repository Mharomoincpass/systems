import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/studioAdminAuth";
import { appendStudioServerLog } from "@/lib/studioAdminStore";
import { getZeptoMailConfigStatus, sendZeptoMail } from "@/lib/zeptomailClient";
import { visitMetaFromRequest } from "@/lib/studioRequestMeta";

export const runtime = "nodejs";

export async function POST(req) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const config = getZeptoMailConfigStatus();
  if (!config.ok) {
    return NextResponse.json(
      { ok: false, error: "Mail not configured", reason: config.reason },
      { status: 400 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const to = String(body.to || "").trim().toLowerCase();
    if (!to || !to.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid `to` email required" }, { status: 400 });
    }

    const result = await sendZeptoMail({
      to,
      subject: "FrsionOS — ZeptoMail test",
      htmlbody:
        "<div style=\"font-family:monospace\"><b>Test OK</b><p>If you see this, studio mail is working.</p></div>",
      textbody: "FrsionOS ZeptoMail test — if you see this, studio mail is working.",
    });

    appendStudioServerLog({
      level: "info",
      message: "Admin mail test sent",
      meta: { to, requestId: result.requestId, apiBase: config.apiBase, ip: visitMetaFromRequest(req).ip },
    });

    return NextResponse.json({
      ok: true,
      to,
      requestId: result.requestId,
      apiBase: config.apiBase,
      from: config.fromAddress,
    });
  } catch (err) {
    appendStudioServerLog({
      level: "warn",
      message: "Admin mail test failed",
      meta: { error: err?.message, ip: visitMetaFromRequest(req).ip },
    });
    return NextResponse.json(
      { ok: false, error: err?.message || "Send failed" },
      { status: 502 }
    );
  }
}
