import { NextResponse } from "next/server";
import { addStudioSubscriber } from "@/lib/studioSubscribersStore";
import { appendStudioServerLog, appendStudioVisit } from "@/lib/studioAdminStore";
import { visitMetaFromRequest } from "@/lib/studioRequestMeta";
import { sendWelcomeSubscriberEmail } from "@/lib/studioBroadcastMail";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email;

    const result = addStudioSubscriber(email, {
      userAgent: req.headers.get("user-agent") || "",
    });

    appendStudioVisit(
      visitMetaFromRequest(req, {
        path: "/api/studio/subscribe",
        method: "POST",
        kind: "subscribe",
      })
    );

    appendStudioServerLog({
      level: "info",
      message: result.alreadySubscribed
        ? "Subscriber re-confirmed email"
        : "New subscriber email",
      meta: { email: result.email, ip: visitMetaFromRequest(req).ip },
    });

    let welcomeMail = null;
    if (!result.alreadySubscribed) {
      try {
        welcomeMail = await sendWelcomeSubscriberEmail(result.email);
        appendStudioServerLog({
          level: welcomeMail.deliveredLive ? "info" : "warn",
          message: welcomeMail.deliveredLive
            ? "Welcome email delivered via ZeptoMail"
            : "Welcome email queued (ZeptoMail not fully configured or send failed)",
          meta: {
            email: result.email,
            subject: welcomeMail.subject,
            deliveredLive: welcomeMail.deliveredLive,
            queuedOutbox: welcomeMail.queuedOutbox,
            failed: welcomeMail.failed,
            errors: welcomeMail.errors,
            zeptoRequestIds: welcomeMail.zeptoRequestIds,
            mailConfigReason: welcomeMail.mailConfigReason,
            batchId: welcomeMail.batchId,
          },
        });
      } catch (mailErr) {
        appendStudioServerLog({
          level: "warn",
          message: "Welcome email failed",
          meta: { email: result.email, error: mailErr?.message },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      email: result.email,
      alreadySubscribed: result.alreadySubscribed,
      welcomeSent: Boolean(welcomeMail?.deliveredLive),
      welcomeQueued: Boolean(welcomeMail?.queuedOutbox),
      mailConfigReason: welcomeMail?.mailConfigReason || null,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Subscribe failed" },
      { status: 400 }
    );
  }
}
