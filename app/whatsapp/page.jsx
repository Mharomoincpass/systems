import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";

export const metadata = {
  title: "WhatsApp bot",
  description: "FrsionOS WhatsApp bot — chat to generate and manage images.",
};

const WHATSAPP_CHAT_URL = process.env.NEXT_PUBLIC_WHATSAPP_BOT_URL?.trim();

export default function WhatsAppBotPage() {
  return (
    <div className="min-h-[100dvh] bg-white text-black font-sans flex flex-col">
      <header className="shrink-0 border-b border-zinc-200 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
          <Image src="/icon.svg" alt="" width={32} height={32} className="shrink-0" />
          <div className="min-w-0">
            <p className="font-mono font-bold text-sm sm:text-base tracking-tight truncate">
              FrsionOS
            </p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider hidden sm:block">
              WhatsApp bot
            </p>
          </div>
        </Link>
        <Link
          href="/studio"
          className="shrink-0 inline-flex items-center gap-2 min-h-[44px] px-4 py-2 border border-black text-xs font-mono font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
        >
          Web studio
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16 max-w-2xl mx-auto w-full flex flex-col">
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">
          Messaging
        </p>
        <h1 className="text-2xl sm:text-4xl font-mono font-bold tracking-tight leading-[1.1] mb-4">
          FrsionOS on
          <span className="block sm:inline sm:ml-2 border-b-4 border-black">WhatsApp</span>
        </h1>
        <p className="text-sm font-mono text-zinc-600 leading-relaxed mb-4">
          Generate and manage images from WhatsApp — same Pollinations engines, built for quick
          prompts on your phone.
        </p>
        <p className="text-[11px] font-mono text-zinc-500 leading-relaxed mb-8 border-l-2 border-zinc-200 pl-3">
          Dev uses Meta&apos;s test business number from API Setup. Only numbers added as test
          recipients can chat until the app is published.
        </p>

        {WHATSAPP_CHAT_URL ? (
          <a
            href={WHATSAPP_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-[#25D366] text-white text-xs font-mono font-bold uppercase tracking-wider hover:brightness-95 transition-[filter] w-full sm:w-auto"
          >
            <MessageCircle className="w-4 h-4" />
            Open in WhatsApp
          </a>
        ) : (
          <div className="border border-dashed border-zinc-300 p-6 font-mono text-xs text-zinc-500 leading-relaxed">
            Bot link not configured yet. Set{" "}
            <code className="text-black">NEXT_PUBLIC_WHATSAPP_BOT_URL</code> in{" "}
            <code className="text-black">.env</code> to your{" "}
            <code className="text-black">wa.me</code> or WhatsApp Business chat URL.
          </div>
        )}
      </main>
    </div>
  );
}
