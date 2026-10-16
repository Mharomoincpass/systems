import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/studioAdminAuth";
import { sendWhatsAppText } from "@/lib/whatsapp/graph";
import { formatMetaSendError } from "@/lib/whatsapp/metaErrors";
import { sendWhatsAppTemplate } from "@/lib/whatsapp/templates";

export const runtime = "nodejs";

/**
 * Studio admin: outbound text (24h window) or template (any number, business-initiated).
 * POST { to, text } | { to, templateName, languageCode?, bodyParameters? }
 */
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

  const to = String(body?.to || "").trim();
  if (!to) {
    return NextResponse.json({ ok: false, error: "Missing to (E.164 digits)" }, { status: 400 });
  }

  const templateName = String(body?.templateName || body?.template || "").trim();
  if (templateName) {
    const sendRes = await sendWhatsAppTemplate(to, {
      templateName,
      languageCode: body?.languageCode || body?.language || "en",
      bodyParameters: body?.bodyParameters,
      headerParameters: body?.headerParameters,
    });
    if (!sendRes.success) {
      const mapped = formatMetaSendError(sendRes, { isTemplateSend: true });
      return NextResponse.json(
        { ok: false, error: mapped.error, metaCode: mapped.metaCode },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, messageId: sendRes.messageId });
  }

  const text = String(body?.text || "").trim();
  if (!text) {
    return NextResponse.json(
      { ok: false, error: "Provide text or templateName" },
      { status: 400 }
    );
  }

  const sendRes = await sendWhatsAppText(to, text);
  if (!sendRes.success) {
    const mapped = formatMetaSendError(sendRes);
    return NextResponse.json(
      { ok: false, error: mapped.error, metaCode: mapped.metaCode },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, messageId: sendRes.messageId });
}
