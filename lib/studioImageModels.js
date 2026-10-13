/**
 * Pollinations image models exposed in the studio UI.
 * IDs match gen.pollinations.ai `model` parameter (publisher/model).
 */

/** @param {number} pollenAmount */
export function formatPollenPerGen(pollenAmount) {
  const n = Number(pollenAmount);
  if (!Number.isFinite(n)) return null;
  const s = n
    .toFixed(5)
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "");
  return `P${s}`;
}

export const STUDIO_IMAGE_MODELS = [
  {
    id: "lykon/dreamshaper-8-lcm",
    label: "DreamShaper 8 LCM",
    description: "Near-instant images at rock-bottom cost",
    pricePerGen: "P0.0001",
    tier: "budget",
  },
  {
    id: "black-forest-labs/flux.1-schnell",
    label: "FLUX.1 Schnell",
    description: "Fast, high-quality images at a tiny cost",
    pricePerGen: "P0.002",
    tier: "budget",
  },
  {
    id: "tongyi-mai/z-image-turbo",
    label: "Z-Image Turbo",
    description: "Instant, budget-friendly with crisp upscaled output",
    pricePerGen: "P0.004",
    tier: "budget",
  },
  {
    id: "black-forest-labs/flux.2-klein-4b",
    label: "FLUX.2 Klein 4B",
    description: "Fast generation and editing up to 2.4 MP",
    pricePerGen: "P0.005",
    tier: "standard",
    supportsReference: true,
  },
  {
    id: "black-forest-labs/flux.1.1-pro",
    label: "FLUX 1.1 Pro",
    description: "Precise dimensions and reproducible seeds",
    pricePerGen: "P0.03",
    tier: "pro",
  },
  {
    id: "black-forest-labs/flux.1-kontext-pro",
    label: "FLUX.1 Kontext Pro",
    description: "Edit from instructions — swap, restyle, refine",
    pricePerGen: "P0.03",
    tier: "edit",
    supportsReference: true,
  },
  {
    id: "openai/gpt-image-1-mini",
    label: "GPT Image 1 Mini",
    description: "Affordable creation and editing",
    priceLabel: "Token-priced",
    tier: "standard",
    supportsReference: true,
  },
  {
    id: "openai/gpt-image-1.5",
    label: "GPT Image 1.5",
    description: "High-fidelity generation and editing",
    priceLabel: "Token-priced",
    tier: "pro",
    supportsReference: true,
  },
  {
    id: "openai/gpt-image-2",
    label: "GPT Image 2",
    description: "Premium high-res with strong prompt following",
    priceLabel: "Token-priced",
    tier: "premium",
    supportsReference: true,
  },
  {
    id: "microsoft/mai-image-2.6-flash",
    label: "MAI Image 2.6 Flash",
    description: "Photoreal + single-reference edit, accurate text",
    priceLabel: "Token-priced",
    tier: "pro",
    supportsReference: true,
  },
  {
    id: "microsoft/mai-image-2.6",
    label: "MAI Image 2.6",
    description: "Detailed photoreal with strong instruction following",
    priceLabel: "Token-priced",
    tier: "premium",
    supportsReference: true,
  },
];

/** @deprecated aliases still accepted by Pollinations */
export const LEGACY_IMAGE_MODEL_ALIASES = {
  flux: "black-forest-labs/flux.1-schnell",
  "flux-klein": "black-forest-labs/flux.2-klein-4b",
  dreamshaper: "lykon/dreamshaper-8-lcm",
  "z-image-turbo": "tongyi-mai/z-image-turbo",
};

export const DEFAULT_IMAGE_MODEL_ID = "black-forest-labs/flux.1-schnell";

export function resolveImageModelId(model) {
  const raw = String(model || "").trim();
  if (!raw) return DEFAULT_IMAGE_MODEL_ID;
  if (raw.startsWith("gemini-")) return raw;
  return LEGACY_IMAGE_MODEL_ALIASES[raw] || raw;
}

export function getImageModelMeta(modelId) {
  const id = resolveImageModelId(modelId);
  return STUDIO_IMAGE_MODELS.find((m) => m.id === id) || null;
}

export function getImageModelLabel(modelId) {
  return getImageModelMeta(modelId)?.label || resolveImageModelId(modelId);
}

export function modelSupportsReferenceImage(modelId) {
  return Boolean(getImageModelMeta(modelId)?.supportsReference);
}

/** @param {string | { pricePerGen?: string; priceLabel?: string } | null | undefined} modelOrMeta */
export function getImageModelPriceDisplay(modelOrMeta) {
  const meta =
    typeof modelOrMeta === "string" ? getImageModelMeta(modelOrMeta) : modelOrMeta;
  if (!meta) return "—";
  if (meta.pricePerGen) return meta.pricePerGen;
  if (meta.priceLabel) return meta.priceLabel;
  return "—";
}

export const IMAGE_MODEL_MODES = {
  TEXT_TO_IMAGE: "text2img",
  IMAGE_TO_IMAGE: "img2img",
};

/** @param {string | { supportsReference?: boolean } | null | undefined} modelOrMeta */
export function getImageModelMode(modelOrMeta) {
  const meta =
    typeof modelOrMeta === "string" ? getImageModelMeta(modelOrMeta) : modelOrMeta;
  return meta?.supportsReference
    ? IMAGE_MODEL_MODES.IMAGE_TO_IMAGE
    : IMAGE_MODEL_MODES.TEXT_TO_IMAGE;
}

export function getImageModelModeLabel(mode) {
  return mode === IMAGE_MODEL_MODES.IMAGE_TO_IMAGE ? "Image→Image" : "Text→Image";
}

export function getImageModelModeShort(mode) {
  return mode === IMAGE_MODEL_MODES.IMAGE_TO_IMAGE ? "I2I" : "T2I";
}

export const STUDIO_TEXT_TO_IMAGE_MODELS = STUDIO_IMAGE_MODELS.filter(
  (m) => !m.supportsReference
);
export const STUDIO_IMAGE_TO_IMAGE_MODELS = STUDIO_IMAGE_MODELS.filter(
  (m) => m.supportsReference
);
