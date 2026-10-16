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
  const [connecting, setConnecting] = useState(false);
  const [registerPin, setRegisterPin] = useState("");
  const embeddedFinishRef = useRef(null);
  const popupRef = useRef(null);
  const oauthHandledRef = useRef(false);
  const metaRef = useRef({ enabled: false });

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
      const res = await fetch("/api/whatsapp/auth/embedded-meta", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      const next = data?.data?.enabled ? data.data : { enabled: false };
      metaRef.current = next;
      setMeta(next);
    } catch {
      metaRef.current = { enabled: false };
      setMeta({ enabled: false });
    }
  }, []);

  const completeWithCode = useCallback(
    async (code) => {
      if (!code) return;
      setConnecting(true);
      const m = metaRef.current;
      try {
        const finish = await waitForEmbeddedFinish(() => embeddedFinishRef.current);
        const res = await fetch("/api/whatsapp/auth/embedded", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirectUri: m.redirectUri,
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
      } catch (err) {
        toast.error(err?.message || "Embedded signup failed");
      } finally {
        setConnecting(false);
        embeddedFinishRef.current = null;
      }
    },
    [loadStatus, onConnected, registerPin]
  );

  useEffect(() => {
    loadMeta();
    loadStatus();
  }, [loadMeta, loadStatus]);

  useEffect(() => {
    const onMessage = (ev) => {
      const origin = ev.origin || "";
      if (origin.includes("facebook.com")) {
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
        return;
      }

      if (ev.origin !== window.location.origin) return;
      const payload = ev.data;
      if (payload?.type !== "MHA_WA_EMBEDDED_OAUTH") return;
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
      popupRef.current = null;
      oauthHandledRef.current = true;
      if (payload.error) {
        toast.error(String(payload.error));
        setConnecting(false);
        return;
      }
      const expectedState = metaRef.current.oauthState || "mha_wa_embedded_v1";
      if (payload.state && payload.state !== expectedState) {
        toast.error("Meta login state mismatch — try again.");
        setConnecting(false);
        return;
      }
      completeWithCode(payload.code);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [completeWithCode]);

  const startConnect = () => {
    const m = metaRef.current;
    if (!m.enabled || !m.configId) {
      toast.error("Embedded Signup not loaded — refresh the page.");
      return;
    }
    embeddedFinishRef.current = null;
    oauthHandledRef.current = false;
    setConnecting(true);

    const startPath = m.oauthStartPath || "/api/whatsapp/auth/embedded-start";
    const popup = window.open(
      `${window.location.origin}${startPath}`,
      "mha_wa_embedded_signup",
      "width=600,height=720,scrollbars=yes"
    );
    if (!popup) {
      setConnecting(false);
      toast.error("Popup blocked — allow popups for this site and try again.");
      return;
    }
    popupRef.current = popup;
    const poll = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(poll);
        popupRef.current = null;
        setConnecting((c) => {
          if (c && !oauthHandledRef.current) {
            toast.message("Signup cancelled or window closed");
          }
          return false;
        });
      }
    }, 500);
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

  if (!meta.enabled) {
    return (
      <p className="text-xs font-mono text-zinc-600 leading-relaxed">
        Set <code className="text-black">WHATSAPP_FB_APP_ID</code> and{" "}
        <code className="text-black">WHATSAPP_EMBEDDED_CONFIG_ID</code> in server{" "}
        <code className="text-black">.env</code> (Meta → Facebook Login for Business →
        Configurations → WhatsApp embedded template).
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
      <div className="text-[10px] text-zinc-500 leading-relaxed space-y-1 border border-zinc-200 p-2 bg-zinc-50">
        <p>
          Configuration ID on server:{" "}
          <code className="text-black">{meta.configId}</code>
        </p>
        <p>
          Must match Meta → Facebook Login for Business → Configurations (WhatsApp
          embedded sign-up template row).
        </p>
        <p>
          OAuth redirect URI:{" "}
          <code className="text-black break-all">{meta.redirectUri}</code>
        </p>
      </div>
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
        disabled={connecting || !meta.configId}
        onClick={startConnect}
        className="inline-flex min-h-[44px] px-4 bg-[#1877F2] text-white font-bold uppercase tracking-wide disabled:opacity-50"
      >
        {connecting ? "Connecting…" : "Connect with Meta"}
      </button>
    </div>
  );
}
