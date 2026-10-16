"use client";

import { useEffect, useState } from "react";

/** Meta OAuth redirect target — forwards code to opener and closes the popup. */
export default function WhatsappEmbeddedCallbackPage() {
  const [note, setNote] = useState("Finishing Meta login…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = {
      type: "MHA_WA_EMBEDDED_OAUTH",
      code: params.get("code"),
      error: params.get("error_description") || params.get("error"),
      state: params.get("state"),
    };
    const origin = window.location.origin;
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(payload, origin);
      setNote("Connected — closing window…");
      window.setTimeout(() => window.close(), 400);
      return;
    }
    setNote(
      payload.error
        ? `Meta error: ${payload.error}`
        : "You can close this tab and return to Studio → WhatsApp."
    );
  }, []);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6 font-mono text-xs text-zinc-600">
      {note}
    </div>
  );
}
