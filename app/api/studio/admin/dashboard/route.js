import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/studioAdminAuth";
import { getStudioAdminDashboard } from "@/lib/studioAdminStore";

export const runtime = "nodejs";

export async function GET(req) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const data = getStudioAdminDashboard();
  return NextResponse.json({ ok: true, ...data });
}
