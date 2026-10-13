const IMAGE_EXT = /\.(png|jpe?g|webp|gif|bmp|avif)$/i;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("read_failed"));
    };
    reader.onerror = () => reject(reader.error || new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

function compressDataUrl(dataUrl, maxSide, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(1, maxSide / Math.max(width, height));
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas_unsupported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("decode_failed"));
    img.src = dataUrl;
  });
}

/**
 * Read a user-selected file into a data URL for reference / img2img uploads.
 * @returns {Promise<string>}
 */
export async function prepareReferenceImageDataUrl(file) {
  if (!file) throw new Error("no_file");

  const looksLikeImage =
    (file.type && file.type.startsWith("image/")) || IMAGE_EXT.test(file.name || "");
  if (!looksLikeImage) throw new Error("unsupported_type");

  if (file.size === 0) throw new Error("empty_file");

  let dataUrl = await readFileAsDataUrl(file);

  if (!dataUrl.startsWith("data:image")) throw new Error("read_failed");

  const heavy =
    file.size > 3 * 1024 * 1024 || dataUrl.length > 4.5 * 1024 * 1024;
  if (heavy) {
    dataUrl = await compressDataUrl(dataUrl, 2048, 0.88);
  }

  return dataUrl;
}

export function referenceUploadErrorMessage(code) {
  switch (code) {
    case "empty_file":
      return "File is 0 bytes — often OneDrive “online only”. Right-click the file → Always keep on this device, then try again.";
    case "unsupported_type":
      return "Use a PNG, JPG, WEBP, or GIF image.";
    case "decode_failed":
      return "Could not open this image. Try another format or save a copy as PNG.";
    case "read_failed":
    case "no_file":
    default:
      return "Could not read the file. Save it locally (not cloud-only) and try again.";
  }
}
