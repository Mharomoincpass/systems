import fs from "node:fs";
import { NextResponse } from "next/server";
import {
  GALLERY_TTL_MS,
  galleryMediaPath,
  getGalleryRecord,
  purgeExpiredGallery,
} from "@/lib/studioGalleryStore";

export const runtime = "nodejs";

export async function GET(_req, { params }) {
  try {
    purgeExpiredGallery();
    const { id } = await params;
    const record = getGalleryRecord(id);
    if (!record) {
      return new NextResponse("Not found", { status: 404 });
    }
    if (Date.now() - record.createdAt > GALLERY_TTL_MS) {
      return new NextResponse("Expired", { status: 410 });
    }

    const filePath = galleryMediaPath(id, record.ext);
    if (!fs.existsSync(filePath)) {
      return new NextResponse("File missing", { status: 404 });
    }

    const buf = fs.readFileSync(filePath);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": record.mime,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Error", { status: 500 });
  }
}
