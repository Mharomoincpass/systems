import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  const params = await Promise.resolve(context?.params);
  let fileName = params?.name;

  if (!fileName) {
    return new Response("Missing video name", { status: 400 });
  }

  fileName = path.basename(fileName);
  if (!fileName.endsWith(".mp4")) {
    fileName = `${fileName}.mp4`;
  }

  const possiblePaths = [
    path.join(process.cwd(), "videos", fileName),
    path.join(process.cwd(), "public", "videos", fileName),
    path.join("F:\\R&M", fileName),
    path.join("/home/ec2-user/systems/videos", fileName),
  ];

  let filePath = null;
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    } catch {}
  }

  if (!filePath) {
    return new Response(`Video not found: ${fileName}`, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = request.headers.get("range");

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      return new Response("Range Not Satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${fileSize}` },
      });
    }

    const chunksize = end - start + 1;
    const nodeStream = fs.createReadStream(filePath, { start, end });
    const webStream = Readable.toWeb(nodeStream);

    return new Response(webStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } else {
    const nodeStream = fs.createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream);

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }
}
