import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_IMAGE_MODEL_ID,
  getImageModelLabel,
  modelSupportsReferenceImage,
  resolveImageModelId,
} from "@/lib/studioImageModels";
import { saveGalleryFromDataUrl } from "@/lib/studioGalleryStore";
import { appendStudioVisit } from "@/lib/studioAdminStore";
import { logStudioServer } from "@/lib/studioAdminLog";
import { visitMetaFromRequest } from "@/lib/studioRequestMeta";
import { appendGenerationLog } from "@/lib/studioGenerationHistory";

export const runtime = "nodejs";

function respondWithSavedMedia({
  type,
  prompt,
  provider,
  dataUrl,
  meta = {},
  model = "",
  aspectRatio = "",
}) {
  const item = saveGalleryFromDataUrl({
    type,
    prompt,
    provider,
    dataUrl,
    meta,
  });
  appendGenerationLog({
    status: "success",
    prompt,
    provider,
    model,
    aspectRatio,
    mediaId: item.id,
  });
  return NextResponse.json({
    ok: true,
    provider: item.provider,
    url: item.url,
    id: item.id,
    createdAt: item.createdAt,
    saved: true,
  });
}
export const maxDuration = 300;

const DEFAULT_POLLINATIONS_KEY = "sk_ueAtw7LuBE1fqkn7tcKkHqViIhaYrsnE";

function getPollinationsKey() {
  return process.env.POLLINATIONS_API_KEY || DEFAULT_POLLINATIONS_KEY;
}

function getBackendEnvKey(keyName) {
  if (process.env[keyName]) return process.env[keyName];
  try {
    const envPath = path.resolve(process.cwd(), "..", "backend", ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(new RegExp(`^${keyName}=(.*)$`, "m"));
      if (match) return match[1].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // ignore
  }
  return "";
}

function dimensionsForAspectRatio(ratio) {
  switch (ratio) {
    case "16:9":
      return { width: 1280, height: 720 };
    case "9:16":
      return { width: 720, height: 1280 };
    case "4:3":
      return { width: 1152, height: 864 };
    case "3:4":
      return { width: 864, height: 1152 };
    case "1:1":
    default:
      return { width: 1024, height: 1024 };
  }
}

async function pollinationsImageRequest(targetUrl, apiKey, signal) {
  const headers = {
    Accept: "image/*,*/*;q=0.8",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  const res = await fetch(targetUrl, { signal, headers });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Pollinations HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }
  const ct = res.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) {
    throw new Error("Received empty or corrupt image");
  }
  const dataUrl = `data:${ct.split(";")[0]};base64,${buf.toString("base64")}`;
  return dataUrl;
}

async function generatePollinationsImageViaPost({
  prompt,
  aspectRatio,
  model,
  negativePrompt,
  referenceImageDataUrl,
}) {
  const { width, height } = dimensionsForAspectRatio(aspectRatio);
  const apiKey = getPollinationsKey();
  const selectedModel = resolveImageModelId(model);

  const body = {
    model: selectedModel,
    prompt,
    width,
    height,
    nologo: true,
  };
  if (negativePrompt?.trim()) {
    body.negative_prompt = negativePrompt.trim();
  }

  const imageParts = [];
  if (
    referenceImageDataUrl &&
    referenceImageDataUrl.startsWith("data:image") &&
    modelSupportsReferenceImage(selectedModel)
  ) {
    imageParts.push(referenceImageDataUrl);
  }
  if (imageParts.length) {
    body.image = imageParts;
  }

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  // Img2img uses generations + `image` array — /v1/images/edits returns 400 for these models.
  const endpoint = "https://gen.pollinations.ai/v1/images/generations";

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = data?.error?.code || "";
    const msg = data?.error?.message || JSON.stringify(data).slice(0, 200);
    if (code === "INSUFFICIENT_BALANCE" || res.status === 402) {
      throw new Error(
        msg.includes("paid balance")
          ? "This model requires paid Pollen. Try FLUX.1 Kontext Pro or top up at enter.pollinations.ai."
          : msg
      );
    }
    throw new Error(`Pollinations POST ${res.status}: ${msg}`);
  }

  const b64 =
    data?.data?.[0]?.b64_json ||
    data?.data?.[0]?.b64Json ||
    data?.images?.[0]?.b64_json;
  if (b64) {
    const mime = data?.data?.[0]?.mime_type || "image/png";
    return { dataUrl: `data:${mime};base64,${b64}`, model: selectedModel };
  }

  const url = data?.data?.[0]?.url || data?.output?.[0]?.url;
  if (url) {
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error("Failed to fetch generated image URL");
    const ct = imgRes.headers.get("content-type") || "image/png";
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const dataUrl = `data:${ct.split(";")[0]};base64,${buf.toString("base64")}`;
    return { dataUrl, model: selectedModel };
  }

  throw new Error("Pollinations returned no image data");
}

async function generatePollinationsImage({
  prompt,
  aspectRatio,
  model,
  negativePrompt = "",
  referenceImageDataUrl = "",
}) {
  const { width, height } = dimensionsForAspectRatio(aspectRatio);
  const seed = Math.floor(Math.random() * 1000000);
  const apiKey = getPollinationsKey();
  const selectedModel = model?.startsWith("gemini-")
    ? model
    : resolveImageModelId(model);

  const usePost =
    referenceImageDataUrl &&
    referenceImageDataUrl.startsWith("data:image") &&
    modelSupportsReferenceImage(selectedModel);

  if (usePost) {
    return generatePollinationsImageViaPost({
      prompt,
      aspectRatio,
      model: selectedModel,
      negativePrompt,
      referenceImageDataUrl,
    });
  }

  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    model: selectedModel,
    seed: String(seed),
    nologo: "true",
  });
  if (negativePrompt?.trim()) {
    params.set("negative_prompt", negativePrompt.trim());
  }

  const targetUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?${params.toString()}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120000);

  try {
    const dataUrl = await pollinationsImageRequest(targetUrl, apiKey, ctrl.signal);
    clearTimeout(timer);
    return { dataUrl, model: selectedModel };
  } catch (err) {
    clearTimeout(timer);

    if (selectedModel !== DEFAULT_IMAGE_MODEL_ID) {
      try {
        const fallbackParams = new URLSearchParams({
          width: String(width),
          height: String(height),
          model: DEFAULT_IMAGE_MODEL_ID,
          seed: String(seed),
          nologo: "true",
        });
        if (negativePrompt?.trim()) {
          fallbackParams.set("negative_prompt", negativePrompt.trim());
        }
        const fallbackUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?${fallbackParams.toString()}`;
        const dataUrl = await pollinationsImageRequest(fallbackUrl, apiKey);
        return { dataUrl, model: DEFAULT_IMAGE_MODEL_ID };
      } catch {
        // continue to throw original
      }
    }

    throw err;
  }
}

async function generateGeminiImage({ apiKey, model, prompt, aspectRatio, referenceImageDataUrl }) {
  const parts = [];
  if (referenceImageDataUrl && referenceImageDataUrl.startsWith("data:image")) {
    const m = referenceImageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (m) {
      parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
    }
  }
  parts.push({ text: prompt });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
        },
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Gemini API HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const candParts = data?.candidates?.[0]?.content?.parts || [];
  for (const p of candParts) {
    const inline = p.inlineData || p.inline_data;
    if (inline?.data) {
      const mime = inline.mimeType || inline.mime_type || "image/png";
      return `data:${mime};base64,${inline.data}`;
    }
  }
  throw new Error("Gemini returned no image data");
}

export async function POST(req) {
  try {
    appendStudioVisit(
      visitMetaFromRequest(req, {
        path: "/api/studio/generate",
        method: "POST",
        kind: "api",
      })
    );

    const body = await req.json();
    const {
      type = "image",
      prompt = "",
      negativePrompt = "",
      style = "",
      aspectRatio = "1:1",
      model = "",
      referenceImage = "",
      apiKey: userApiKey = "",
    } = body || {};

    if (!String(prompt).trim()) {
      return NextResponse.json({ ok: false, error: "Prompt is required" }, { status: 400 });
    }

    const customGeminiKey = String(userApiKey || "").trim() || getBackendEnvKey("GEMINI_API_KEY");
    const fullPrompt = [
      String(prompt).trim(),
      style ? `Style: ${style}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    // ==========================================
    // IMAGE GENERATION
    // ==========================================
    if (type === "image") {
      const wantsGemini = model && model.startsWith("gemini-");
      if (wantsGemini && customGeminiKey) {
        try {
          const dataUrl = await generateGeminiImage({
            apiKey: customGeminiKey,
            model,
            prompt: fullPrompt,
            aspectRatio,
            referenceImageDataUrl: referenceImage,
          });
          return respondWithSavedMedia({
            type: "image",
            prompt: fullPrompt,
            provider: model,
            dataUrl,
            model,
            aspectRatio,
          });
        } catch (geminiErr) {
          console.warn("Gemini image failed, falling back to Pollinations:", geminiErr.message);
        }
      }

      // Default & Primary AI Image Engine: Pollinations (Flux / Turbo / Klein)
      try {
        const { dataUrl, model: usedModel } = await generatePollinationsImage({
          prompt: fullPrompt,
          aspectRatio,
          model,
          negativePrompt,
          referenceImageDataUrl: referenceImage,
        });

        logStudioServer("info", "Image generated", {
          model: usedModel,
          ip: visitMetaFromRequest(req).ip,
        });
        return respondWithSavedMedia({
          type: "image",
          prompt: fullPrompt,
          provider: getImageModelLabel(usedModel),
          dataUrl,
          model: usedModel,
          aspectRatio,
        });
      } catch (pollinationsErr) {
        console.error("Pollinations image generation failed:", pollinationsErr);
        const errMsg = pollinationsErr?.message || "Image generation failed";
        logStudioServer("error", "Image generation failed", {
          message: errMsg,
          ip: visitMetaFromRequest(req).ip,
        });
        appendGenerationLog({
          status: "error",
          prompt: fullPrompt,
          provider: getImageModelLabel(model) || model || "Image",
          model: model || "",
          aspectRatio,
          error: errMsg,
        });
        return NextResponse.json(
          {
            ok: false,
            error: errMsg,
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { ok: false, error: "Only image generation is supported." },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Generation failed" },
      { status: 500 }
    );
  }
}
