import Link from "next/link";
import { notFound } from "next/navigation";
import BlogShell from "@/components/BlogShell";
import {
  getAllServicePages,
  getServiceBySlug,
  getServiceSlugs,
  WA,
} from "@/lib/services/pages";
import { getPostBySlug } from "@/lib/blogs/posts";

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getServiceBySlug(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: `/services/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/services/${page.slug}`,
      type: "website",
    },
  };
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const page = getServiceBySlug(slug);
  if (!page) notFound();

  const others = getAllServicePages().filter((p) => p.slug !== page.slug).slice(0, 4);
  const wa = `${WA.split("?")[0]}?text=${encodeURIComponent(
    `Hi MHAROMO Systems — I want a quote for: ${page.h1}`
  )}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.h1,
    description: page.description,
    provider: {
      "@type": "Organization",
      name: "MHAROMO Systems",
      url: "https://mharomo.systems",
      telephone: "+916009325630",
      areaServed: page.cities.map((c) => ({ "@type": "City", name: c })),
    },
    areaServed: page.cities,
    url: `https://mharomo.systems/services/${page.slug}`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <BlogShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <nav className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          <Link href="/services" className="hover:text-[var(--ink)]">
            Services
          </Link>
          <span className="mx-2">/</span>
          <span>{page.eyebrow}</span>
        </nav>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--signal)]">
          {page.primaryKeyword}
        </p>
        <h1
          className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1]"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          {page.h1}
        </h1>
        <p className="mt-5 text-base sm:text-lg leading-relaxed text-[var(--muted)]">
          {page.summary}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center bg-[#128C7E] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#0E6F64] transition-colors"
          >
            WhatsApp for a quote
          </a>
          <a
            href="tel:+916009325630"
            className="inline-flex min-h-[48px] items-center justify-center border border-[var(--ink)]/20 px-6 text-sm font-semibold uppercase tracking-[0.12em] hover:border-[var(--ink)] transition-colors"
          >
            Call +91 60093 25630
          </a>
        </div>

        <section className="mt-12">
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            What you get
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[#2a3340]">
            {page.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Popular starting points
          </h2>
          <ul className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {page.offer.map(([name, copy]) => (
              <li key={name} className="py-4">
                <p
                  className="font-bold"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {name}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">{copy}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-none border border-[var(--line)] bg-white/70 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--signal)]">
            Why clients message us
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[#2a3340]">
            Clear scope. Direct builds. You own the domain and code. Live project example:{" "}
            <a
              href="https://www.miloniwater.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--signal)] font-semibold underline"
            >
              MILONI Water
            </a>
            . Read more on{" "}
            <Link href="/#projects" className="text-[var(--signal)] font-semibold underline">
              projects
            </Link>
            .
          </p>
        </section>

        <section className="mt-12">
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            FAQs
          </h2>
          <div className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {page.faqs.map((f) => (
              <details key={f.q} className="py-4 group">
                <summary className="cursor-pointer font-bold list-none pr-6 relative">
                  <span style={{ fontFamily: "var(--font-display), sans-serif" }}>{f.q}</span>
                  <span className="absolute right-0 top-0 text-[var(--muted)] group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-[#2a3340]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {page.relatedBlogs?.length > 0 && (
          <section className="mt-12">
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Related guides
            </h2>
            <ul className="mt-3 space-y-2">
              {page.relatedBlogs.map((blogSlug) => {
                const post = getPostBySlug(blogSlug);
                return (
                  <li key={blogSlug}>
                    <Link
                      href={`/blogs/${blogSlug}`}
                      className="text-[var(--signal)] font-semibold underline underline-offset-2"
                    >
                      {post?.title || blogSlug}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="mt-12">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Other services
          </h2>
          <ul className="mt-3 space-y-2">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={`/services/${p.slug}`} className="font-semibold hover:text-[var(--signal)]">
                  {p.h1}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center bg-[#128C7E] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white"
          >
            WhatsApp now — get clients from a real site
          </a>
          <Link
            href="/#contact"
            className="inline-flex min-h-[48px] items-center justify-center border border-[var(--ink)]/20 px-6 text-sm font-semibold uppercase tracking-[0.12em]"
          >
            Contact page
          </Link>
        </div>
      </article>
    </BlogShell>
  );
}
