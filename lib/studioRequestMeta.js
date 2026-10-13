/** @param {Request} request */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/** @param {Request} request */
export function visitMetaFromRequest(request, overrides = {}) {
  return {
    ip: getClientIp(request),
    path: overrides.path || "/",
    method: overrides.method || request.method || "GET",
    userAgent: request.headers.get("user-agent") || "",
    referer: request.headers.get("referer") || "",
    kind: overrides.kind || "visit",
  };
}
