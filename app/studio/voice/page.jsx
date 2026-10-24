"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Phone, PhoneOff, Save } from "lucide-react";
import { toast } from "sonner";
import { Conversation } from "@elevenlabs/client";
import {
  patchPermissionsQuery,
  patchGetUserMedia,
  patchAudioContext,
  checkMobileAudioSupport,
  unlockUserGestureAudio,
  attachMobileAudioOutput,
} from "@/lib/voice/mobileAudioShim";

export default function VoiceAiPage() {
  const [tab, setTab] = useState("call");
  const [meta, setMeta] = useState(null);
  const [config, setConfig] = useState({
    agentId: "",
    systemPrompt: "",
    voiceId: "",
  });
  const [saving, setSaving] = useState(false);
  const [callStatus, setCallStatus] = useState("idle");
  const [agentMode, setAgentMode] = useState("");
  const [lines, setLines] = useState([]);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [serverApiKey, setServerApiKey] = useState("");
  const [serverAgentId, setServerAgentId] = useState("");
  const [savingServer, setSavingServer] = useState(false);
  const conversationRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/studio/voice/config");
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Load failed");
      setConfig(data.config);
      setMeta(data.meta);
    } catch (e) {
      console.warn("Could not load config:", e?.message);
    }
  }, []);

  useEffect(() => {
    // 1. Patch WebKit permissions, getUserMedia & AudioContext bugs for iOS Safari & iOS Chrome
    patchPermissionsQuery();
    patchGetUserMedia();
    patchAudioContext();
    load();
    fetch("/api/studio/admin/voice-env", { credentials: "include" })
      .then((r) => {
        setIsAdmin(r.ok);
        return r.ok ? r.json() : null;
      })
      .then((data) => {
        if (data?.meta?.agentId) setServerAgentId(data.meta.agentId);
      })
      .catch(() => setIsAdmin(false));
    return () => {
      conversationRef.current?.endSession?.().catch(() => {});
    };
  }, [load]);

  const saveServerEnv = async () => {
    setSavingServer(true);
    try {
      const res = await fetch("/api/studio/admin/voice-env", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(serverApiKey.trim() ? { apiKey: serverApiKey.trim() } : {}),
          ...(serverAgentId.trim() ? { agentId: serverAgentId.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      setServerApiKey("");
      toast.success("Server .env updated — try Call");
      await load();
    } catch (e) {
      toast.error(e?.message || "Need studio admin login (A on /studio) first");
    } finally {
      setSavingServer(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/studio/voice/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Save failed");
      setConfig(data.config);
      if (data.syncWarning) toast.message(data.syncWarning);
      else toast.success("Saved — synced to ElevenLabs agent");
      await load();
    } catch (e) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const endCall = async () => {
    try {
      await conversationRef.current?.endSession?.();
    } catch {
      /* ignore */
    }
    conversationRef.current = null;
    setCallStatus("idle");
    setAgentMode("");
  };

  const startCall = async () => {
    if (callStatus === "live" || callStatus === "connecting") return;

    setError("");
    setCallStatus("connecting");
    setLines([]);

    // 1. Unlock AudioContext & AudioElement immediately in user gesture window
    unlockUserGestureAudio();

    // 2. Verify environment security (HTTPS)
    const support = checkMobileAudioSupport();
    if (!support.ok) {
      setError(support.message);
      toast.error(support.message);
      setCallStatus("idle");
      return;
    }

    try {
      // 3. Fetch fresh session signed URL from server
      const sessionRes = await fetch("/api/studio/voice/session");
      const sessionData = await sessionRes.json();
      if (!sessionData?.ok) {
        throw new Error(sessionData?.error || "Could not create voice session");
      }

      // 4. Start ElevenLabs conversational AI session
      const workletOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const conversation = await Conversation.startSession({
        signedUrl: sessionData.signedUrl,
        connectionType: "websocket",
        connectionDelay: { android: 500, ios: 100, default: 0 },
        workletPaths: workletOrigin
          ? {
              rawAudioProcessor: `${workletOrigin}/worklets/rawAudioProcessor.js`,
              audioConcatProcessor: `${workletOrigin}/worklets/audioConcatProcessor.js`,
            }
          : undefined,
        onConversationCreated: (conv) => {
          conversationRef.current = conv;
          attachMobileAudioOutput(conv);
        },
        onConnect: () => {
          setCallStatus("live");
          setError("");
          attachMobileAudioOutput(conversationRef.current);
          toast.success("Connected — speak now");
        },
        onDisconnect: () => {
          setCallStatus("idle");
          setAgentMode("");
          conversationRef.current = null;
        },
        onModeChange: (mode) => {
          setAgentMode(mode?.mode || "");
        },
        onMessage: (message) => {
          const text =
            typeof message === "string"
              ? message
              : message?.message || message?.text || JSON.stringify(message);
          setLines((prev) => [...prev.slice(-40), { at: Date.now(), text }]);
        },
        onError: (err) => {
          const msg = err?.message || String(err || "Call error");
          console.error("ElevenLabs Call Error:", err);
          let userMsg = msg;
          if (
            msg.includes("Permission") ||
            msg.includes("NotAllowedError") ||
            msg.includes("denied")
          ) {
            userMsg =
              "Microphone permission denied. In iPhone Settings > Chrome, turn ON Microphone.";
          }
          setError(userMsg);
          toast.error(userMsg);
          setCallStatus("idle");
        },
      });

      attachMobileAudioOutput(conversation);
      conversationRef.current = conversation;
    } catch (e) {
      console.error("Call start error:", e);
      let userMsg = e?.message || "Could not start call";
      if (
        userMsg.includes("Permission") ||
        userMsg.includes("NotAllowedError") ||
        userMsg.includes("denied")
      ) {
        userMsg =
          "Microphone permission needed. In iPhone Settings > Chrome, enable Microphone.";
      }
      setError(userMsg);
      toast.error(userMsg);
      setCallStatus("idle");
    }
  };

  const tabs = [
    { id: "call", label: "Call" },
    { id: "config", label: "Config" },
  ];

  return (
    <div className="min-h-[100dvh] bg-white text-black font-sans flex flex-col">
      <header className="shrink-0 border-b border-zinc-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="inline-flex items-center gap-1 text-xs font-mono text-zinc-600 hover:text-black"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Studio
          </Link>
          <h1 className="text-sm font-mono font-bold uppercase tracking-wide">Voice AI</h1>
        </div>
      </header>

      <div className="shrink-0 border-b border-zinc-200 px-4 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2.5 text-[10px] font-mono font-bold uppercase border-b-2 transition-colors cursor-pointer ${
              tab === t.id
                ? "border-black text-black"
                : "border-transparent text-zinc-500 hover:text-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-lg mx-auto w-full">
        {tab === "call" && (
          <div className="space-y-6 flex flex-col items-center pt-8">
            <p className="text-xs font-mono text-zinc-500 text-center leading-relaxed">
              Live voice conversation with your{" "}
              <a
                href="https://elevenlabs.io/app/conversational-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-black"
              >
                ElevenLabs agent
              </a>
              . Works on iOS, Android, and desktop.
            </p>
            {callStatus === "live" && agentMode && (
              <p className="text-[10px] font-mono uppercase text-zinc-600">
                Agent: {agentMode}
              </p>
            )}
            {callStatus !== "live" ? (
              <button
                type="button"
                disabled={callStatus === "connecting"}
                onClick={startCall}
                className="w-28 h-28 rounded-full flex items-center justify-center bg-black text-white disabled:opacity-50 touch-manipulation active:scale-95 transition-transform shadow-lg cursor-pointer"
                aria-label="Start voice call"
              >
                <Phone className="w-10 h-10" />
              </button>
            ) : (
              <button
                type="button"
                onClick={endCall}
                className="w-28 h-28 rounded-full flex items-center justify-center bg-red-600 text-white touch-manipulation active:scale-95 transition-transform shadow-lg cursor-pointer"
                aria-label="End voice call"
              >
                <PhoneOff className="w-10 h-10" />
              </button>
            )}
            <p className="text-[10px] font-mono uppercase text-zinc-500">
              {callStatus === "connecting"
                ? "Connecting…"
                : callStatus === "live"
                  ? "On call — tap to hang up"
                  : "Tap to start call"}
            </p>

            {error && (
              <div className="w-full border border-red-300 bg-red-50 p-3 text-red-700 text-xs font-mono text-center">
                {error}
              </div>
            )}

            {lines.length > 0 && (
              <ul className="w-full space-y-1 text-[10px] font-mono text-zinc-600 max-h-[30vh] overflow-y-auto border border-zinc-200 p-2">
                {lines.map((line) => (
                  <li key={line.at} className="break-words">
                    {line.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "config" && (
          <div className="space-y-4 text-xs font-mono">
            {!(meta?.elevenLabsConfigured && meta?.agentId) && (
              <>
                <p className="text-red-600 border border-red-200 bg-red-50 p-3">
                  Voice AI is not wired up on the server yet (API key or agent missing).
                </p>
                {isAdmin ? (
                  <div className="border border-zinc-300 p-3 space-y-2">
                    <label className="block">
                      <span className="text-[10px] uppercase text-zinc-500">
                        ElevenLabs API key
                      </span>
                      <input
                        type="password"
                        value={serverApiKey}
                        onChange={(e) => setServerApiKey(e.target.value)}
                        className="mt-1 w-full border border-zinc-300 px-2 py-2"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] uppercase text-zinc-500">Agent ID</span>
                      <input
                        value={serverAgentId}
                        onChange={(e) => setServerAgentId(e.target.value)}
                        placeholder="agent_..."
                        className="mt-1 w-full border border-zinc-300 px-2 py-2"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={savingServer}
                      onClick={saveServerEnv}
                      className="inline-flex min-h-[40px] px-3 bg-black text-white font-bold uppercase disabled:opacity-50"
                    >
                      {savingServer ? "Saving…" : "Save server setup"}
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-500">
                    Studio admin login required to add keys, or set{" "}
                    <code className="text-black">.env</code> on the server.
                  </p>
                )}
              </>
            )}
            <label className="block">
              <span className="text-[10px] uppercase text-zinc-500">System prompt</span>
              <textarea
                rows={8}
                value={config.systemPrompt || ""}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, systemPrompt: e.target.value }))
                }
                className="mt-1 w-full border border-zinc-300 px-2 py-2 resize-y"
              />
            </label>
            {!(meta?.elevenLabsConfigured && meta?.agentId) && (
              <label className="block">
                <span className="text-[10px] uppercase text-zinc-500">Voice ID</span>
                <input
                  value={config.voiceId || ""}
                  onChange={(e) => setConfig((c) => ({ ...c, voiceId: e.target.value }))}
                  placeholder={meta?.defaultVoiceId || "21m00Tcm4TlvDq8ikWAM"}
                  className="mt-1 w-full border border-zinc-300 px-2 py-2"
                />
              </label>
            )}
            <button
              type="button"
              onClick={saveConfig}
              disabled={saving}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 bg-black text-white font-bold uppercase disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving…" : "Save config"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
