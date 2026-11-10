"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Code2, Globe2, ImageIcon, Layers3, Mic, Tv } from "lucide-react";

const APPS = [
  {
    href: "/studio",
    title: "FrsionOS Studio",
    copy: "AI image studio — prompts, engines, gallery, and transparent pricing.",
    icon: ImageIcon,
  },
  {
    href: "/studio/voice",
    title: "Voice AI",
    copy: "Live voice agent in the browser — talk, configure prompt, hang up.",
    icon: Mic,
  },
  {
    href: "/rick-and-morty",
    title: "Rick & Morty",
    copy: "Season streaming player with multi-server playback.",
    icon: Tv,
  },
];
import { Syne, Manrope } from "next/font/google";

const display = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.12 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function FrsionLanding() {
  return (
    <div
      className={`${display.variable} ${body.variable} min-h-[100dvh] text-[var(--ink)]`}
      style={{
        "--ink": "#0B0D10",
        "--paper": "#EEF1F4",
        "--mist": "#D7DEE7",
        "--muted": "#5B6675",
        "--line": "rgba(11,13,16,0.12)",
        "--signal": "#1F6F8B",
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_82%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-3 min-w-0" aria-label="MHAROMO Systems home">
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={48}
              height={36}
              className="h-8 w-auto sm:h-9"
              priority
            />
            <span className="hidden sm:flex flex-col leading-none">
              <span
                className="text-[13px] font-bold tracking-[0.08em] uppercase"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                MHAROMO
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[var(--muted)]">
                Systems
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <a href="#services" className="px-2 py-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              Services
            </a>
            <a href="#apps" className="px-2 py-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              Apps
            </a>
            <a href="#contact" className="hidden sm:inline px-2 py-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              Contact
            </a>
            <a
              href="#contact"
              className="inline-flex min-h-[40px] items-center gap-1.5 bg-[var(--ink)] px-3.5 text-[var(--paper)] hover:bg-[var(--signal)] transition-colors"
            >
              Start a project
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero — one composition: brand, headline, line, CTAs, dominant mark */}
        <section className="relative min-h-[100dvh] overflow-hidden bg-[var(--paper)] pt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 80% 55% at 15% 20%, rgba(31,111,139,0.18), transparent 55%),
                radial-gradient(ellipse 70% 50% at 90% 75%, rgba(11,13,16,0.08), transparent 50%),
                linear-gradient(160deg, #F5F7FA 0%, #E6ECF2 48%, #D9E2EA 100%)
              `,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 70% 65% at 50% 40%, black, transparent)",
            }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-[8%] top-[12%] hidden w-[58vw] max-w-[720px] lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 0.12, x: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={900}
              height={700}
              className="h-auto w-full select-none"
              priority
            />
          </motion.div>

          <div className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl flex-col justify-center px-4 pb-16 pt-8 sm:px-8">
            <motion.div
              className="mb-8 sm:mb-10"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
            >
              <Image
                src="/brand/logo-full.png"
                alt="MHAROMO Systems"
                width={520}
                height={160}
                className="h-auto w-[min(88vw,420px)] sm:w-[min(70vw,480px)]"
                priority
              />
            </motion.div>

            <motion.h1
              className="max-w-3xl text-[clamp(2.4rem,7vw,4.75rem)] font-extrabold leading-[0.98] tracking-[-0.03em]"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
            >
              Software &amp; web systems that ship.
            </motion.h1>

            <motion.p
              className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-[var(--muted)]"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
            >
              MHAROMO Systems designs and builds custom software, modern websites, and product
              platforms for teams that need clarity, speed, and long-term ownership.
            </motion.p>

            <motion.div
              className="mt-9 flex flex-col gap-3 sm:flex-row"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
            >
              <a
                href="#contact"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 bg-[var(--ink)] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--paper)] hover:bg-[var(--signal)] transition-colors"
              >
                Start a project
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="#services"
                className="inline-flex min-h-[48px] items-center justify-center border border-[var(--ink)]/20 bg-white/50 px-6 text-sm font-semibold uppercase tracking-[0.12em] backdrop-blur-sm hover:border-[var(--ink)] transition-colors"
              >
                View services
              </a>
            </motion.div>
          </div>
        </section>

        {/* Services — one job */}
        <section id="services" className="border-t border-[var(--line)] bg-[#F7F9FB] px-4 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--signal)]">
              Services
            </p>
            <h2
              className="max-w-2xl text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Built for the web, shaped as real software.
            </h2>
            <p className="mt-4 max-w-2xl text-[var(--muted)] leading-relaxed">
              From marketing sites to internal tools and full product backends — we ship systems you
              can run, extend, and own.
            </p>

            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {[
                {
                  icon: Globe2,
                  title: "Web development",
                  copy: "Fast, responsive sites and web apps with clean UX, SEO foundations, and production hosting.",
                },
                {
                  icon: Code2,
                  title: "Custom software",
                  copy: "APIs, dashboards, integrations, and business workflows tailored to how your team actually works.",
                },
                {
                  icon: Layers3,
                  title: "Product systems",
                  copy: "End-to-end product builds — architecture, UI, auth, data, and deployment — without the agency fog.",
                },
              ].map((item) => (
                <div key={item.title} className="border-t border-[var(--ink)]/15 pt-5">
                  <item.icon className="mb-4 h-5 w-5 text-[var(--signal)]" strokeWidth={1.75} />
                  <h3
                    className="text-lg font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Apps — keep existing products visible */}
        <section id="apps" className="border-t border-[var(--line)] bg-white px-4 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--signal)]">
              Apps
            </p>
            <h2
              className="max-w-2xl text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Products already live on this system.
            </h2>
            <p className="mt-4 max-w-2xl text-[var(--muted)] leading-relaxed">
              Studio, Voice AI, and more — same stack, same domain, still here.
            </p>

            <ul className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {APPS.map((app) => (
                <li key={app.href}>
                  <Link
                    href={app.href}
                    className="group flex items-start gap-4 py-6 sm:items-center sm:gap-6 hover:bg-[#F7F9FB] transition-colors -mx-2 px-2 sm:-mx-4 sm:px-4"
                  >
                    <app.icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-[var(--signal)]"
                      strokeWidth={1.75}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-lg font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-display), sans-serif" }}
                      >
                        {app.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                        {app.copy}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink)] opacity-60 group-hover:opacity-100 transition-opacity">
                      Open
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Approach — one job */}
        <section className="border-t border-[var(--line)] bg-[var(--ink)] px-4 py-20 text-[var(--paper)] sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7EB6C9]">
              Approach
            </p>
            <h2
              className="max-w-2xl text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Clear scope. Direct builds. No theater.
            </h2>
            <p className="mt-4 max-w-2xl text-[#A8B3C0] leading-relaxed">
              We keep delivery tight: discover the problem, design the system, ship in slices, and
              leave you with documentation and ownership.
            </p>
            <ol className="mt-12 grid gap-8 sm:grid-cols-3">
              {[
                ["01", "Discover", "Goals, users, constraints, and the smallest useful first release."],
                ["02", "Build", "Interfaces, APIs, and infrastructure with production habits from day one."],
                ["03", "Handoff", "Deployed product, source access, and a path to iterate without lock-in."],
              ].map(([num, title, copy]) => (
                <li key={num}>
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-[#7EB6C9]">{num}</p>
                  <p
                    className="mt-2 text-xl font-bold"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#A8B3C0]">{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Contact — one job */}
        <section id="contact" className="border-t border-[var(--line)] bg-[var(--paper)] px-4 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--signal)]">
              Contact
            </p>
            <h2
              className="max-w-2xl text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Tell us what you need built.
            </h2>
            <p className="mt-4 max-w-xl text-[var(--muted)] leading-relaxed">
              Share the product, site, or internal tool on your mind — we will reply with a clear
              next step.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:mharomolotha6@gmail.com?subject=Project%20inquiry%20—%20MHAROMO%20Systems"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 bg-[var(--ink)] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--paper)] hover:bg-[var(--signal)] transition-colors"
              >
                Email MHAROMO
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/in/mharomo-ezung-51b158191"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center border border-[var(--ink)]/20 px-6 text-sm font-semibold uppercase tracking-[0.12em] hover:border-[var(--ink)] transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] bg-[#E8EDF2] px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Image
              src="/brand/logo-full.png"
              alt="MHAROMO Systems"
              width={220}
              height={68}
              className="h-10 w-auto"
            />
            <p className="mt-3 text-xs text-[var(--muted)]">
              Software &amp; web development · Delhi · Worldwide
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            <a href="#apps" className="hover:text-[var(--ink)]">
              Apps
            </a>
            <Link href="/studio" className="hover:text-[var(--ink)]">
              Studio
            </Link>
            <Link href="/studio/voice" className="hover:text-[var(--ink)]">
              Voice AI
            </Link>
            <Link href="/rick-and-morty" className="hover:text-[var(--ink)]">
              Rick &amp; Morty
            </Link>
            <span>© {new Date().getFullYear()} MHAROMO Systems</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
