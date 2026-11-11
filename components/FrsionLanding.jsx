"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Code2, Globe2, ImageIcon, Layers3, Mic, Tv } from "lucide-react";

const PROJECTS = [
  {
    href: "https://www.miloniwater.com/",
    title: "MILONI Water",
    copy: "Brand site and commerce presence for packaged drinking water from Wokha, Nagaland — products, purification story, and wholesale/order flows.",
    external: true,
  },
];

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
      className="min-h-[100dvh] text-[var(--ink)]"
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
            <Link href="/services" className="px-2 py-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              Services
            </Link>
            <a href="#projects" className="px-2 py-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              Projects
            </a>
            <Link href="/blogs" className="hidden sm:inline px-2 py-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              Blog
            </Link>
            <a href="#apps" className="hidden lg:inline px-2 py-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
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
              can run, extend, and own. Hire us for{" "}
              <Link href="/services/web-development-wokha" className="text-[var(--signal)] font-semibold underline underline-offset-2">
                web development in Wokha
              </Link>
              ,{" "}
              <Link href="/services/web-development-nagaland" className="text-[var(--signal)] font-semibold underline underline-offset-2">
                Nagaland websites
              </Link>
              , or{" "}
              <Link href="/services/software-development-nagaland" className="text-[var(--signal)] font-semibold underline underline-offset-2">
                custom software
              </Link>
              .
            </p>

            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {[
                {
                  icon: Globe2,
                  title: "Web development",
                  copy: "Fast, responsive sites and web apps with clean UX, SEO foundations, and production hosting.",
                  href: "/services/web-development-nagaland",
                },
                {
                  icon: Code2,
                  title: "Custom software",
                  copy: "APIs, dashboards, integrations, and business workflows tailored to how your team actually works.",
                  href: "/services/software-development-nagaland",
                },
                {
                  icon: Layers3,
                  title: "City pages",
                  copy: "Wokha, Kohima, Dimapur — dedicated service pages for buyers searching locally.",
                  href: "/services",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="border-t border-[var(--ink)]/15 pt-5 block hover:opacity-90 transition-opacity"
                >
                  <item.icon className="mb-4 h-5 w-5 text-[var(--signal)]" strokeWidth={1.75} />
                  <h3
                    className="text-lg font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.copy}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--signal)]">
                    View service
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Actual projects */}
        <section id="projects" className="border-t border-[var(--line)] bg-white px-4 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--signal)]">
              Actual projects
            </p>
            <h2
              className="max-w-2xl text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Client work shipped in the wild.
            </h2>
            <p className="mt-4 max-w-2xl text-[var(--muted)] leading-relaxed">
              Real brands and businesses — sites and systems built to run every day.
            </p>

            <ul className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {PROJECTS.map((project) => (
                <li key={project.href}>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 py-6 sm:items-center sm:gap-6 hover:bg-[#F7F9FB] transition-colors -mx-2 px-2 sm:-mx-4 sm:px-4"
                  >
                    <Globe2
                      className="mt-0.5 h-5 w-5 shrink-0 text-[var(--signal)]"
                      strokeWidth={1.75}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-lg font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-display), sans-serif" }}
                      >
                        {project.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                        {project.copy}
                      </p>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--signal)]">
                        {new URL(project.href).host.replace(/^www\./, "")}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink)] opacity-60 group-hover:opacity-100 transition-opacity">
                      Visit
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Timepass apps */}
        <section id="apps" className="border-t border-[var(--line)] bg-[#F7F9FB] px-4 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Timepass apps
            </p>
            <h2
              className="max-w-2xl text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Side experiments on this domain.
            </h2>
            <p className="mt-4 max-w-2xl text-[var(--muted)] leading-relaxed">
              Fun internal tools and demos — not client delivery. Still open if you want to poke around.
            </p>

            <ul className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {APPS.map((app) => (
                <li key={app.href}>
                  <Link
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 py-6 sm:items-center sm:gap-6 hover:bg-white transition-colors -mx-2 px-2 sm:-mx-4 sm:px-4"
                  >
                    <app.icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-[var(--muted)]"
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
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="https://wa.me/916009325630?text=Hi%20MHAROMO%20Systems%20—%20I%27d%20like%20to%20talk%20about%20a%20project."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 bg-[#128C7E] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#0E6F64] transition-colors"
              >
                WhatsApp chat
                <ArrowUpRight className="h-4 w-4" />
              </a>
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
            <Link href="/services" className="hover:text-[var(--ink)]">
              Services
            </Link>
            <a href="#projects" className="hover:text-[var(--ink)]">
              Projects
            </a>
            <Link href="/blogs" className="hover:text-[var(--ink)]">
              Blog
            </Link>
            <a href="#apps" className="hover:text-[var(--ink)]">
              Timepass apps
            </a>
            <a
              href="https://www.miloniwater.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--ink)]"
            >
              MILONI Water
            </a>
            <span>© {new Date().getFullYear()} MHAROMO Systems</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
