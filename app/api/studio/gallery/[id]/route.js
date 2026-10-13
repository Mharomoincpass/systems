import { NextResponse } from "next/server";
import { deleteGalleryItem } from "@/lib/studioGalleryStore";

export const runtime = "nodejs";

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }
    const ok = deleteGalleryItem(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}
