import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/studioAdminAuth";
import { appendStudioServerLog } from "@/lib/studioAdminStore";
import { deleteStudioSubscriber } from "@/lib/studioSubscribersStore";

export const runtime = "nodejs";

export async function DELETE(req, { params }) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const removed = deleteStudioSubscriber(id);
  if (!removed) {
    return NextResponse.json({ ok: false, error: "Subscriber not found" }, { status: 404 });
  }

  appendStudioServerLog({
    level: "info",
    message: "Subscriber deleted",
    meta: { id },
  });

  return NextResponse.json({ ok: true });
}
