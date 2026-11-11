import Link from "next/link";
import BlogShell from "@/components/BlogShell";
import { getAllServicePages, WA } from "@/lib/services/pages";

export const metadata = {
  title: "Services — Web & Software Development in Nagaland",
  description:
    "Hire MHAROMO Systems for web development in Wokha, website design in Kohima & Dimapur, and custom software across Nagaland. WhatsApp for a quote.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "MHAROMO Systems Services",
    description: "Web development and custom software for Nagaland businesses.",
    url: "/services",
  },
};

export default function ServicesIndexPage() {
  const pages = getAllServicePages();

  return (
    <BlogShell>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--signal)]">
          Services
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Hire MHAROMO for web &amp; software in Nagaland
        </h1>
        <p className="mt-4 text-[var(--muted)] leading-relaxed">
          These are the pages buyers search for. Pick your city or service, then WhatsApp for a
          written scope — not a vague package pitch.
        </p>

        <a
          href={WA}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-[48px] items-center bg-[#128C7E] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#0E6F64] transition-colors"
        >
          Get a quote on WhatsApp
        </a>

        <ul className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {pages.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/services/${page.slug}`}
                className="block py-6 hover:bg-white/60 -mx-2 px-2 transition-colors"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--signal)]">
                  {page.eyebrow}
                </p>
                <p
                  className="mt-1 text-xl font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {page.h1}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">{page.summary}</p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-[var(--muted)]">
          Prefer reading first? See the{" "}
          <Link href="/blogs" className="text-[var(--signal)] font-semibold underline">
            blog
          </Link>
          .
        </p>
      </main>
    </BlogShell>
  );
}
