import { NextResponse } from "next/server";
import {
  listGalleryItems,
  purgeExpiredGallery,
  saveGalleryFromDataUrl,
} from "@/lib/studioGalleryStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    purgeExpiredGallery();
    const items = listGalleryItems();
    return NextResponse.json({ success: true, items });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load gallery" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      type,
      prompt = "",
      provider = "Studio",
      dataUrl = "",
      meta = {},
    } = body || {};

    if (!type || !dataUrl) {
      return NextResponse.json(
        { success: false, error: "type and dataUrl are required" },
        { status: 400 }
      );
    }

    const item = saveGalleryFromDataUrl({
      type,
      prompt,
      provider,
      dataUrl,
      meta,
    });

    return NextResponse.json({ success: true, item });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save gallery item" },
      { status: 500 }
    );
  }
}
