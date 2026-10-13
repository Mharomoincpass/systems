export async function blobUrlToDataUrl(blobUrl) {
  const blob = await fetch(blobUrl).then((r) => r.blob());
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("read_failed"));
    };
    reader.onerror = () => reject(reader.error || new Error("read_failed"));
    reader.readAsDataURL(blob);
  });
}

/** @param {{ type: string, prompt: string, provider: string, url: string, meta?: object }} input */
export async function persistStudioMedia({ type, prompt, provider, url, meta = {} }) {
  let dataUrl = url;
  if (typeof url === "string" && url.startsWith("blob:")) {
    dataUrl = await blobUrlToDataUrl(url);
  }
  if (!String(dataUrl).startsWith("data:")) {
    return null;
  }

  const res = await fetch("/api/studio/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, prompt, provider, dataUrl, meta }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success || !data.item) {
    throw new Error(data.error || "Failed to save to gallery");
  }
  return data.item;
}

export function galleryItemFromApi(data, fields) {
  if (data?.id && data?.url) {
    return {
      ...fields,
      id: data.id,
      url: data.url,
      createdAt: data.createdAt,
    };
  }
  return fields;
}
