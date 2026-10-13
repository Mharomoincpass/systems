import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/studioAdminAuth";
import { appendStudioServerLog } from "@/lib/studioAdminStore";
import { broadcastStudioEmail } from "@/lib/studioBroadcastMail";
import { listStudioSubscribers } from "@/lib/studioSubscribersStore";
import { visitMetaFromRequest } from "@/lib/studioRequestMeta";

export const runtime = "nodejs";

export async function POST(req) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const subject = body.subject;
    const message = body.body ?? body.message;
    const sendToAll = body.sendToAll !== false;
    const extraRecipients = Array.isArray(body.recipients) ? body.recipients : [];

    let recipients = extraRecipients;
    if (sendToAll) {
      recipients = [
        ...recipients,
        ...listStudioSubscribers().map((s) => s.email),
      ];
    }

    const result = await broadcastStudioEmail({
      recipients,
      subject,
      body: message,
    });

    appendStudioServerLog({
      level: result.failed ? "warn" : "info",
      message: "Admin bulk email broadcast",
      meta: {
        batchId: result.batchId,
        total: result.total,
        sent: result.sent,
        failed: result.failed,
        ip: visitMetaFromRequest(req).ip,
      },
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Broadcast failed" },
      { status: 400 }
    );
  }
}
