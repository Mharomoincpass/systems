"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import WhatsappEmbeddedConnect from "@/components/whatsapp/WhatsappEmbeddedConnect";

const MATCH_TYPES = [
  { id: "exact", label: "Exact" },
  { id: "prefix", label: "Prefix" },
  { id: "contains", label: "Contains" },
  { id: "default", label: "Default (fallback)" },
];

const ACTIONS = [
  { id: "image", label: "Generate image" },
  { id: "voice", label: "Voice (ElevenLabs)" },
  { id: "help", label: "Help text" },
  { id: "text", label: "Fixed reply" },
];

function newRule() {
  return {
    id: `rule_${Date.now()}`,
    label: "New rule",
    matchType: "contains",
    match: "hello",
    action: "text",
    replyText: "Hi there!",
  };
}

export default function StudioWhatsappPage() {
  const [tab, setTab] = useState("settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState(null);
  const [settings, setSettings] = useState(null);
  const [rules, setRules] = useState([]);
  const [messages, setMessages] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/flow");
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Load failed");
      setSettings(data.config.settings);
      setRules(data.config.rules);
      setMeta(data.meta);
    } catch (e) {
      toast.error(e?.message || "Could not load flow");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/messages?limit=50");
      const data = await res.json();
      if (data?.ok) setMessages(data.items || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (tab !== "log") return undefined;
    loadMessages();
    const t = setInterval(loadMessages, 4000);
    return () => clearInterval(t);
  }, [tab, loadMessages]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/whatsapp/flow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, rules }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Save failed");
      toast.success("Flow saved — test on WhatsApp");
    } catch (e) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updateRule = (id, patch) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const tabs = [
    { id: "settings", label: "Settings" },
    { id: "flow", label: "Conversation flow" },
    { id: "log", label: "Live log" },
    { id: "production", label: "Production (B)" },
    { id: "test", label: "Test on WhatsApp" },
  ];

  if (loading || !settings) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center font-mono text-xs text-zinc-500">
        Loading WhatsApp bot…
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white text-black font-sans flex flex-col">
      <header className="shrink-0 border-b border-zinc-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="inline-flex items-center gap-1 text-xs font-mono text-zinc-600 hover:text-black"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Studio
          </Link>
          <h1 className="text-sm font-mono font-bold uppercase tracking-wide">
            WhatsApp bot
          </h1>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 min-h-[40px] px-4 bg-black text-white text-xs font-mono font-bold uppercase disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving…" : "Save flow"}
        </button>
      </header>

      <div className="shrink-0 border-b border-zinc-200 px-4 flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 py-2.5 text-[10px] font-mono font-bold uppercase border-b-2 transition-colors ${
              tab === t.id
                ? "border-black text-black"
                : "border-transparent text-zinc-500 hover:text-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6">
        {tab === "settings" && (
          <>
            <section className="space-y-3">
              <h2 className="text-xs font-mono font-bold uppercase text-zinc-500">
                Bot identity
              </h2>
              <label className="block text-[10px] font-mono uppercase text-zinc-600">
                Bot name
                <input
                  value={settings.botName || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, botName: e.target.value }))
                  }
                  className="mt-1 w-full border border-zinc-300 focus:border-black px-2 py-2 text-xs font-mono"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-mono">
                <input
                  type="checkbox"
                  checked={Boolean(settings.sendWelcomeOnce)}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, sendWelcomeOnce: e.target.checked }))
                  }
                />
                Send welcome message once per contact
              </label>
              <label className="block text-[10px] font-mono uppercase text-zinc-600">
                Welcome message
                <textarea
                  rows={3}
                  value={settings.welcomeMessage || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, welcomeMessage: e.target.value }))
                  }
                  className="mt-1 w-full border border-zinc-300 focus:border-black px-2 py-2 text-xs font-mono resize-y"
                />
              </label>
              <label className="block text-[10px] font-mono uppercase text-zinc-600">
                Help text (help rule / command)
                <textarea
                  rows={5}
                  value={settings.helpText || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, helpText: e.target.value }))
                  }
                  className="mt-1 w-full border border-zinc-300 focus:border-black px-2 py-2 text-xs font-mono resize-y"
                />
              </label>
            </section>
            <section className="space-y-2 border-t border-zinc-200 pt-4">
              <h2 className="text-xs font-mono font-bold uppercase text-zinc-500">
                Capabilities
              </h2>
              <label className="flex items-center gap-2 text-xs font-mono">
                <input
                  type="checkbox"
                  checked={Boolean(settings.imageEnabled)}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, imageEnabled: e.target.checked }))
                  }
                />
                Image generation (Pollinations)
              </label>
              <label className="flex items-center gap-2 text-xs font-mono">
                <input
                  type="checkbox"
                  checked={Boolean(settings.voiceEnabled)}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, voiceEnabled: e.target.checked }))
                  }
                />
                Voice notes (ElevenLabs — set ELEVENLABS_API_KEY in .env)
              </label>
            </section>
          </>
        )}

        {tab === "flow" && (
          <section className="space-y-4">
            <p className="text-[11px] font-mono text-zinc-600 leading-relaxed">
              Rules run top to bottom. First match wins. Keep one{" "}
              <strong className="font-bold">Default</strong> rule at the bottom for
              anything unmatched.
            </p>
            {rules.map((rule, index) => (
              <div
                key={rule.id}
                className="border border-zinc-200 p-3 space-y-2 bg-zinc-50/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                    Rule {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRule(rule.id)}
                    className="p-1 text-zinc-500 hover:text-red-600"
                    aria-label="Delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  value={rule.label || ""}
                  onChange={(e) => updateRule(rule.id, { label: e.target.value })}
                  placeholder="Label"
                  className="w-full border border-zinc-300 px-2 py-1.5 text-xs font-mono"
                />
                <div className="grid sm:grid-cols-2 gap-2">
                  <select
                    value={rule.matchType}
                    onChange={(e) => updateRule(rule.id, { matchType: e.target.value })}
                    className="border border-zinc-300 px-2 py-1.5 text-xs font-mono bg-white"
                  >
                    {MATCH_TYPES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={rule.match || ""}
                    onChange={(e) => updateRule(rule.id, { match: e.target.value })}
                    placeholder="Match text"
                    disabled={rule.matchType === "default"}
                    className="border border-zinc-300 px-2 py-1.5 text-xs font-mono disabled:opacity-50"
                  />
                </div>
                <select
                  value={rule.action}
                  onChange={(e) => updateRule(rule.id, { action: e.target.value })}
                  className="w-full border border-zinc-300 px-2 py-1.5 text-xs font-mono bg-white"
                >
                  {ACTIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
                {rule.action === "text" && (
                  <textarea
                    rows={2}
                    value={rule.replyText || ""}
                    onChange={(e) =>
                      updateRule(rule.id, { replyText: e.target.value })
                    }
                    placeholder="Fixed reply text"
                    className="w-full border border-zinc-300 px-2 py-1.5 text-xs font-mono"
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setRules((prev) => [...prev, newRule()])}
              className="inline-flex items-center gap-2 px-3 py-2 border border-black text-xs font-mono font-bold uppercase"
            >
              <Plus className="w-3.5 h-3.5" />
              Add rule
            </button>
          </section>
        )}

        {tab === "log" && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono font-bold uppercase">Recent messages</h2>
              <button
                type="button"
                onClick={loadMessages}
                className="text-xs font-mono flex items-center gap-1 text-zinc-600 hover:text-black"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
            {messages.length === 0 ? (
              <p className="text-xs font-mono text-zinc-400 border border-dashed border-zinc-300 p-6">
                No messages yet. Text the Meta test number after webhook is connected.
              </p>
            ) : (
              <ul className="space-y-2">
                {messages.map((m, i) => (
                  <li
                    key={`${m.at}-${i}`}
                    className="border border-zinc-200 p-2 text-[10px] font-mono"
                  >
                    <span className="text-zinc-500">
                      {new Date(m.at).toLocaleString()} · {m.direction} · {m.from}
                    </span>
                    <p className="text-black mt-1 break-words">{m.text || m.kind}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "production" && meta && (
          <section className="space-y-4 text-xs font-mono">
            <div className="border border-zinc-200 p-4 space-y-3">
              <p className="font-bold uppercase text-[10px] text-zinc-500">
                Embedded Signup (Meta-provided number)
              </p>
              <WhatsappEmbeddedConnect onConnected={() => load()} />
            </div>
            <div className="border border-black p-4 space-y-2">
              <p className="font-bold uppercase text-[10px] text-zinc-500">
                Option B — manual .env production
              </p>
              <p className="text-zinc-700 leading-relaxed">
                System User token + real WABA (not API Setup temp token / +1 555 test line).
                Full checklist: <code className="text-black">docs/WHATSAPP_PRODUCTION.md</code> in
                the repo.
              </p>
              <p>
                Production flag:{" "}
                {meta.productionMode ? (
                  <span className="text-green-700">WHATSAPP_PRODUCTION=true</span>
                ) : (
                  <span className="text-zinc-500">WHATSAPP_PRODUCTION not set (dev OK)</span>
                )}
              </p>
              <p>App secret: {meta.appSecretSet ? "set" : "recommended for webhook signatures"}</p>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-zinc-700 border border-zinc-200 p-4">
              <li>Meta Business → System User → long-lived token with WhatsApp permissions</li>
              <li>
                <code className="text-black">npm run whatsapp -- phones</code> → fix{" "}
                <code className="text-black">WHATSAPP_PHONE_NUMBER_ID</code> on server
              </li>
              <li>
                <code className="text-black">npm run whatsapp -- subscribe</code> and{" "}
                <code className="text-black">register &lt;PIN&gt;</code> if needed
              </li>
              <li>Webhook: {meta.webhookUrl} — subscribe <strong>messages</strong></li>
              <li>
                Outbound to anyone: approved <strong>templates</strong> (
                <code className="text-black">npm run whatsapp -- send-template …</code>)
              </li>
              <li>Inbound replies (24h): bot flow on this page — no test recipient list</li>
            </ol>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Admin API: POST /api/whatsapp/send (studio admin cookie) with{" "}
              <code className="text-black">templateName</code> or <code className="text-black">text</code>
              .
            </p>
          </section>
        )}

        {tab === "test" && meta && (
          <section className="space-y-4 text-xs font-mono">
            <div className="border border-black p-4 space-y-2">
              <p className="font-bold uppercase text-[10px] text-zinc-500">Status</p>
              <p>WhatsApp API: {meta.whatsappConfigured ? "configured" : "missing .env"}</p>
              <p>ElevenLabs: {meta.voiceConfigured ? "configured" : "missing key"}</p>
            </div>
            <div className="border border-zinc-200 p-4 space-y-2">
              <p className="font-bold uppercase text-[10px] text-zinc-500">
                Local webhook (use ngrok)
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Run <code className="text-black">npm run dev</code> then{" "}
                <code className="text-black">ngrok http 3001</code> (your port). Paste
                this URL in Meta → WhatsApp → Configuration:
              </p>
              <code className="block bg-zinc-100 p-2 break-all text-[10px]">
                {meta.webhookUrl}
              </code>
              <p className="text-zinc-500">
                Verify token in .env: WHATSAPP_VERIFY_TOKEN
                {meta.verifyTokenSet ? " (set)" : " (not set)"}
              </p>
            </div>
            <div className="border border-zinc-200 p-4">
              <p className="font-bold uppercase text-[10px] text-zinc-500 mb-2">
                Test from your phone
              </p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-700">
                <li>Save flow above</li>
                <li>Message Meta test number +1 555 677 0611</li>
                <li>Try help, a prompt, or /voice hello</li>
                <li>Watch Live log tab</li>
              </ol>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
