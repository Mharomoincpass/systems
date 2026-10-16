"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function waitForEmbeddedFinish(getSnapshot, timeoutMs = 20000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const id = setInterval(() => {
      const f = getSnapshot();
      if (f?.wabaId && f?.phoneNumberId) {
        clearInterval(id);
        resolve(f);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(id);
        resolve(getSnapshot());
      }
    }, 80);
  });
}

export default function WhatsappEmbeddedConnect({ onConnected }) {
  const [meta, setMeta] = useState({ enabled: false });
  const [status, setStatus] = useState({ connected: false });
  const [fbReady, setFbReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [registerPin, setRegisterPin] = useState("");
  const embeddedFinishRef = useRef(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/connection");
      const data = await res.json();
      if (data?.ok) setStatus(data.data || { connected: false });
    } catch {
      /* ignore */
    }
  }, []);

  const loadMeta = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/auth/embedded-meta");
      if (res.status === 401) {
        setMeta({ enabled: false, needsAdmin: true });
        return;
      }
      const data = await res.json();
      setMeta(data?.data?.enabled ? data.data : { enabled: false });
    } catch {
      setMeta({ enabled: false });
    }
  }, []);

  useEffect(() => {
    loadMeta();
    loadStatus();
  }, [loadMeta, loadStatus]);

  useEffect(() => {
    const onMessage = (ev) => {
      const origin = ev.origin || "";
      if (!origin.includes("facebook.com")) return;
      let payload = ev.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }
      if (payload?.type !== "WA_EMBEDDED_SIGNUP") return;
      if (payload.event === "FINISH" && payload.data) {
        const d = payload.data;
        embeddedFinishRef.current = {
          wabaId: d.waba_id ?? d.wabaId,
          phoneNumberId: d.phone_number_id ?? d.phoneNumberId,
          businessId: d.business_id ?? d.businessId,
        };
      }
      if (payload.event === "CANCEL") {
        embeddedFinishRef.current = null;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!meta.enabled || !meta.appId) {
      setFbReady(false);
      return undefined;
    }
    const graphV = meta.graphVersion || "v21.0";
    const tryInit = () => {
      if (!window?.FB) return false;
      try {
        window.FB.init({
          appId: meta.appId,
          cookie: true,
          xfbml: true,
          version: graphV,
        });
        setFbReady(true);
        return true;
      } catch {
        return false;
      }
    };
    window.fbAsyncInit = tryInit;
    if (window.FB && tryInit()) return undefined;

    let existing = document.getElementById("facebook-jssdk");
    if (!existing) {
      const s = document.createElement("script");
      s.id = "facebook-jssdk";
      s.async = true;
      s.defer = true;
      s.crossOrigin = "anonymous";
      s.src = "https://connect.facebook.net/en_US/sdk.js";
      document.body.appendChild(s);
      existing = s;
    }
    const poll = window.setInterval(() => {
      if (tryInit()) window.clearInterval(poll);
    }, 150);
    const stop = window.setTimeout(() => window.clearInterval(poll), 20000);
    return () => {
      window.clearInterval(poll);
      window.clearTimeout(stop);
    };
  }, [meta.enabled, meta.appId, meta.graphVersion]);

  const startConnect = () => {
    if (!window.FB) {
      toast.error("Facebook SDK not ready — refresh (use HTTPS).");
      return;
    }
    embeddedFinishRef.current = null;
    setConnecting(true);
    window.FB.login(
      (response) => {
        if (!response.authResponse?.code) {
          setConnecting(false);
          toast.message("Signup cancelled or incomplete");
          return;
        }
        waitForEmbeddedFinish(() => embeddedFinishRef.current)
          .then(async (finish) => {
            const res = await fetch("/api/whatsapp/auth/embedded", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: response.authResponse.code,
                wabaId: finish?.wabaId,
                phoneNumberId: finish?.phoneNumberId,
                businessId: finish?.businessId,
                ...(registerPin.replace(/\D/g, "").length >= 6
                  ? { registerPin: registerPin.replace(/\D/g, "") }
                  : {}),
              }),
            });
            const data = await res.json();
            if (!data?.ok) throw new Error(data?.error || "Connect failed");
            toast.success(
              `Connected ${data.data?.displayPhoneNumber || data.data?.phoneNumberId}`
            );
            await loadStatus();
            onConnected?.(data.data);
          })
          .catch((err) => {
            toast.error(err?.message || "Embedded signup failed");
          })
          .finally(() => setConnecting(false));
      },
      {
        config_id: meta.configId,
        response_type: "code",
        override_default_response_type: true,
        // Embedded Signup v4 (2026 templates): empty extras; products set in Login configuration.
        extras: {},
      }
    );
  };

  const disconnect = async () => {
    const res = await fetch("/api/whatsapp/connection", { method: "DELETE" });
    const data = await res.json();
    if (!data?.ok) {
      toast.error("Could not disconnect");
      return;
    }
    setStatus({ connected: false });
    toast.success("Disconnected — using .env credentials again");
  };

  if (meta.needsAdmin) {
    return (
      <p className="text-xs font-mono text-zinc-600 leading-relaxed">
        Log in to studio admin (A button on /studio) first, then return here to connect
        Embedded Signup.
      </p>
    );
  }

  if (!meta.enabled) {
    return (
      <p className="text-xs font-mono text-zinc-600 leading-relaxed">
        Set <code className="text-black">WHATSAPP_FB_APP_ID</code> and{" "}
        <code className="text-black">WHATSAPP_EMBEDDED_CONFIG_ID</code> in server{" "}
        <code className="text-black">.env</code> (Meta → WhatsApp → Embedded Signup).
      </p>
    );
  }

  return (
    <div className="space-y-3 text-xs font-mono">
      {status.connected ? (
        <div className="border border-green-600 bg-green-50 p-3 space-y-1">
          <p className="font-bold text-green-900">Embedded connection active</p>
          <p>{status.displayPhoneNumber || status.phoneNumberId}</p>
          <p className="text-[10px] text-green-800">WABA {status.wabaId}</p>
          <button
            type="button"
            onClick={disconnect}
            className="mt-2 underline text-green-900 hover:text-black"
          >
            Disconnect (fall back to .env)
          </button>
        </div>
      ) : (
        <p className="text-zinc-600">
          Connect via Meta Embedded Signup to attach a{" "}
          <strong>Meta-provided or business phone number</strong> and long-lived token
          (stored on server, not in git).
        </p>
      )}
      <label className="block text-[10px] uppercase text-zinc-500">
        Optional 6-digit Cloud API PIN
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={registerPin}
          onChange={(e) => setRegisterPin(e.target.value)}
          className="mt-1 w-full max-w-[8rem] border border-zinc-300 px-2 py-1.5"
          placeholder="••••••"
        />
      </label>
      <button
        type="button"
        disabled={!fbReady || connecting}
        onClick={startConnect}
        className="inline-flex min-h-[44px] px-4 bg-[#1877F2] text-white font-bold uppercase tracking-wide disabled:opacity-50"
      >
        {connecting ? "Connecting…" : "Connect with Meta"}
      </button>
      {!fbReady && meta.enabled && (
        <p className="text-[10px] text-zinc-500">Loading Facebook SDK…</p>
      )}
    </div>
  );
}
