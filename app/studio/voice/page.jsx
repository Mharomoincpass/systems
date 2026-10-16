"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, MicOff, Save } from "lucide-react";
import { toast } from "sonner";

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function VoiceAiPage() {
  const [tab, setTab] = useState("call");
  const [meta, setMeta] = useState(null);
  const [config, setConfig] = useState({ systemPrompt: "", voiceId: "" });
  const [saving, setSaving] = useState(false);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const recognitionRef = useRef(null);
  const historyRef = useRef([]);
  const audioRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/studio/voice/config");
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Load failed");
      setConfig(data.config);
      setMeta(data.meta);
    } catch (e) {
      toast.error(e?.message || "Could not load config");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      toast.success("Config saved");
    } catch (e) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const speakReply = async (data) => {
    if (data.audioBase64 && data.audioMime) {
      const src = `data:${data.audioMime};base64,${data.audioBase64}`;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = src;
        await audioRef.current.play().catch(() => {});
        return;
      }
    }
    if (typeof window !== "undefined" && window.speechSynthesis && data.replyText) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(data.replyText);
      window.speechSynthesis.speak(u);
    }
  };

  const sendMessage = async (text) => {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setTranscript((t) => [...t, { role: "user", text: message }]);
    try {
      const res = await fetch("/api/studio/voice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: historyRef.current }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Chat failed");
      const reply = data.data.replyText;
      historyRef.current = [
        ...historyRef.current,
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ].slice(-20);
      setTranscript((t) => [...t, { role: "assistant", text: reply }]);
      await speakReply(data.data);
    } catch (e) {
      toast.error(e?.message || "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  };

  const startListening = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      toast.error("Speech recognition not supported in this browser. Use Chrome.");
      return;
    }
    if (!meta?.openaiConfigured) {
      toast.error("Set OPENAI_API_KEY on the server first (Config tab).");
      return;
    }
    stopListening();
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const text = ev.results?.[0]?.[0]?.transcript;
      if (text) sendMessage(text);
    };
    rec.onerror = () => {
      setListening(false);
      toast.message("Mic stopped");
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const toggleMic = () => {
    if (listening) stopListening();
    else startListening();
  };

  const tabs = [
    { id: "call", label: "Call" },
    { id: "config", label: "Config" },
  ];

  return (
    <div className="min-h-[100dvh] bg-white text-black font-sans flex flex-col">
      <audio ref={audioRef} className="hidden" />
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
            className={`px-3 py-2.5 text-[10px] font-mono font-bold uppercase border-b-2 transition-colors ${
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
            <p className="text-xs font-mono text-zinc-500 text-center">
              Tap the mic, speak, then listen. Uses browser speech + OpenAI + ElevenLabs (if
              set).
            </p>
            <button
              type="button"
              onClick={toggleMic}
              disabled={busy}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
                listening ? "bg-red-600 text-white" : "bg-black text-white"
              }`}
              aria-label={listening ? "Stop listening" : "Start listening"}
            >
              {listening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
            <p className="text-[10px] font-mono uppercase text-zinc-500">
              {busy ? "Thinking…" : listening ? "Listening…" : "Tap to talk"}
            </p>
            <ul className="w-full space-y-2 text-xs font-mono max-h-[40vh] overflow-y-auto">
              {transcript.map((line, i) => (
                <li
                  key={`${i}-${line.role}`}
                  className={`p-2 border ${
                    line.role === "user"
                      ? "border-zinc-200 bg-zinc-50 ml-4"
                      : "border-black bg-white mr-4"
                  }`}
                >
                  <span className="text-[10px] uppercase text-zinc-400">{line.role}</span>
                  <p className="mt-1">{line.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "config" && (
          <div className="space-y-4 text-xs font-mono">
            <div className="border border-zinc-200 p-3 space-y-1 bg-zinc-50">
              <p>
                OpenAI:{" "}
                {meta?.openaiConfigured ? (
                  <span className="text-green-700">configured</span>
                ) : (
                  <span className="text-red-600">set OPENAI_API_KEY in server .env</span>
                )}
              </p>
              <p>
                ElevenLabs:{" "}
                {meta?.elevenLabsConfigured ? (
                  <span className="text-green-700">configured (voice output)</span>
                ) : (
                  <span className="text-zinc-500">optional — ELEVENLABS_API_KEY</span>
                )}
              </p>
              {meta?.model && (
                <p className="text-zinc-500">Model: {meta.model}</p>
              )}
            </div>
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
            <label className="block">
              <span className="text-[10px] uppercase text-zinc-500">
                ElevenLabs voice ID (blank = env default)
              </span>
              <input
                value={config.voiceId || ""}
                onChange={(e) => setConfig((c) => ({ ...c, voiceId: e.target.value }))}
                placeholder={meta?.defaultVoiceId || "21m00Tcm4TlvDq8ikWAM"}
                className="mt-1 w-full border border-zinc-300 px-2 py-2"
              />
            </label>
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
