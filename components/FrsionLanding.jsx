import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageIcon, MessageCircle, Sparkles } from "lucide-react";

const WHATSAPP_BOT_PAGE = "/whatsapp";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Text & reference images",
    body: "FLUX, DreamShaper, GPT Image, and Kontext — pick T2I or I2I with clear Pollen pricing.",
  },
];

const sectionShell =
  "px-4 sm:px-8 py-12 sm:py-20 max-w-5xl mx-auto border-t border-zinc-200 first:border-t-0";

const eyebrowClass =
  "text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4";

const headlineClass =
  "text-3xl sm:text-5xl font-mono font-bold tracking-tight leading-[1.1] mb-5";

const accentClass = "block sm:inline sm:ml-2 border-b-4 border-black";

const bodyClass =
  "text-sm sm:text-base font-mono text-zinc-600 max-w-xl leading-relaxed mb-8";

const actionsRowClass = "flex flex-col sm:flex-row gap-3";

const btnPrimaryClass =
  "inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-black text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors";

const btnSecondaryClass =
  "inline-flex items-center justify-center min-h-[48px] px-6 border border-zinc-300 text-xs font-mono font-bold uppercase tracking-wider hover:border-black transition-colors";

export default function FrsionLanding() {
  return (
    <div className="min-h-[100dvh] bg-white text-black font-sans flex flex-col">
      <header className="shrink-0 border-b border-zinc-200 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Image src="/icon.svg" alt="" width={32} height={32} className="shrink-0" />
          <div className="min-w-0">
            <p className="font-mono font-bold text-sm sm:text-base tracking-tight truncate">
              FrsionOS
            </p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider hidden sm:block">
              mharomo.systems
            </p>
          </div>
        </div>
        <Link
          href="/studio"
          className="shrink-0 inline-flex items-center gap-2 min-h-[44px] px-4 py-2 bg-black text-white text-xs font-mono font-bold uppercase tracking-wide hover:bg-zinc-800 transition-colors"
        >
          Open studio
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <main className="flex-1">
        <section className={sectionShell}>
          <p className={eyebrowClass}>AI image studio</p>
          <h1 className={headlineClass}>Generate images</h1>
          <p className={bodyClass}>
            FrsionOS is a minimal studio for prompts, engines, and previews — built on
            Pollinations.ai with server-side gallery storage and transparent per-model costs.
          </p>
          <div className={actionsRowClass}>
            <Link href="/studio" className={btnPrimaryClass}>
              <ImageIcon className="w-4 h-4" />
              Start generating
            </Link>
            <a
              href="https://enter.pollinations.ai"
              target="_blank"
              rel="noopener noreferrer"
              className={btnSecondaryClass}
            >
              Get Pollen
            </a>
          </div>
        </section>

        <section className={sectionShell}>
          <p className={eyebrowClass}>Messaging</p>
          <h2 className={headlineClass}>
            FrsionOS
            <span className={accentClass}>WhatsApp bot</span>
          </h2>
          <p className={bodyClass}>
            Chat on WhatsApp to generate images without opening the browser studio — built for
            quick prompts on your phone.
          </p>
          <div className={actionsRowClass}>
            <a
              href={WHATSAPP_BOT_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className={btnPrimaryClass}
            >
              <MessageCircle className="w-4 h-4" />
              Open WhatsApp bot
            </a>
          </div>
        </section>

        <section className="border-t border-zinc-200 bg-zinc-50 px-4 sm:px-8 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="border border-zinc-200 bg-white p-5 flex flex-col gap-3 hover:border-black transition-colors"
              >
                <Icon className="w-5 h-5 text-black" strokeWidth={1.5} />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wide">{title}</h3>
                <p className="text-[11px] font-mono text-zinc-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
