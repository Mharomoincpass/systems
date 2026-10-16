import { sendWhatsAppImage, sendWhatsAppText } from "./graph";

function publicAppOrigin() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "https://mharomo.systems";
  return base.replace(/\/$/, "");
}

async function generateImageFromPrompt(prompt) {
  const origin =
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:3000"
      : publicAppOrigin();
  const res = await fetch(`${origin}/api/studio/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "image",
      prompt: prompt.trim(),
      aspectRatio: "1:1",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Image generation failed");
  }
  const url = data.url.startsWith("http")
    ? data.url
    : `${publicAppOrigin()}${data.url.startsWith("/") ? "" : "/"}${data.url}`;
  return url;
}

export async function handleWhatsAppTextMessage({
  from,
  text,
  phoneNumberId,
}) {
  const body = (text || "").trim();
  if (!body || !from) return;

  if (body.toLowerCase() === "help") {
    await sendWhatsAppText(
      from,
      "FrsionOS WhatsApp bot\n\nSend any text to generate a 1:1 image.\nPrefix with /image if you like.\n\nhelp — this message",
      phoneNumberId
    );
    return;
  }

  let prompt = body;
  if (prompt.toLowerCase().startsWith("/image")) {
    prompt = prompt.slice(6).trim();
  }
  if (!prompt) {
    await sendWhatsAppText(from, "Send a prompt text to generate an image.", phoneNumberId);
    return;
  }

  await sendWhatsAppText(from, "Generating… this can take a minute.", phoneNumberId);
  try {
    const imageUrl = await generateImageFromPrompt(prompt);
    const img = await sendWhatsAppImage(
      from,
      imageUrl,
      prompt.slice(0, 200),
      phoneNumberId
    );
    if (!img.success) {
      await sendWhatsAppText(
        from,
        `Image ready but could not send on WhatsApp: ${img.error}\n${imageUrl}`,
        phoneNumberId
      );
    }
  } catch (err) {
    await sendWhatsAppText(
      from,
      `Could not generate: ${err?.message || "unknown error"}`,
      phoneNumberId
    );
  }
}
