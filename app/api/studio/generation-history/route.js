import { NextResponse } from "next/server";
import {
  listGenerationLogs,
  toClientGenerationLog,
} from "@/lib/studioGenerationHistory";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = listGenerationLogs().map(toClientGenerationLog);
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load generation history" },
      { status: 500 }
    );
  }
}
