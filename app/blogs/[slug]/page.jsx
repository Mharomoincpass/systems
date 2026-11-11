import Link from "next/link";
import { notFound } from "next/navigation";
import BlogShell from "@/components/BlogShell";
import {
  BLOG_AUTHOR,
  getAllPosts,
  getAllSlugs,
  getPostBySlug,
  getPostsBySlugs,
} from "@/lib/blogs/posts";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `https://mharomo.systems/blogs/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [BLOG_AUTHOR.name],
      siteName: "MHAROMO Systems",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const linkClass = "text-[var(--signal)] font-semibold underline underline-offset-2 hover:text-[var(--ink)]";

/** Replace [[0]], [[1]], ... with linked labels from block.links */
function RichText({ text, links = [] }) {
  if (!links.length) return <>{text}</>;

  const parts = [];
  const re = /\[\[(\d+)\]\]/g;
  let last = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", value: text.slice(last, match.index) });
    const idx = Number(match[1]);
    const link = links[idx];
    if (link) parts.push({ type: "link", ...link });
    else parts.push({ type: "text", value: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "text") return <span key={i}>{part.value}</span>;
        if (part.external || /^https?:/i.test(part.href)) {
          return (
            <a
              key={i}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {part.label}
            </a>
          );
        }
        return (
          <Link key={i} href={part.href} className={linkClass}>
            {part.label}
          </Link>
        );
      })}
    </>
  );
}

function SectionBlock({ block }) {
  if (block.type === "h2") {
    const id = block.text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return (
      <h2
        id={id}
        className="mt-10 text-2xl font-bold tracking-tight scroll-mt-24"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        {block.text}
      </h2>
    );
  }
  if (block.type === "p") {
    return (
      <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-[#2a3340]">
        <RichText text={block.text} links={block.links} />
      </p>
    );
  }
  if (block.type === "ul") {
    return (
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[#2a3340]">
        {block.items.map((item) => (
          <li key={typeof item === "string" ? item : item.text}>
            {typeof item === "string" ? item : <RichText text={item.text} links={item.links} />}
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "ol") {
    return (
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-[#2a3340]">
        {block.items.map((item) => (
          <li key={typeof item === "string" ? item : item.text}>
            {typeof item === "string" ? item : <RichText text={item.text} links={item.links} />}
          </li>
        ))}
      </ol>
    );
  }
  if (block.type === "cta") {
    return (
      <p className="mt-8">
        <a
          href={block.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] items-center bg-[#128C7E] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#0E6F64] transition-colors"
        >
          {block.text}
        </a>
      </p>
    );
  }
  return null;
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedFromMeta = getPostsBySlugs(post.relatedSlugs || []);
  const relatedFallback = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 4);
  const related = relatedFromMeta.length ? relatedFromMeta : relatedFallback;
  const faqs = post.faqs || [];
  const externalLinks = post.externalLinks || [];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Organization",
      name: BLOG_AUTHOR.name,
      url: BLOG_AUTHOR.url,
    },
    publisher: {
      "@type": "Organization",
      name: "MHAROMO Systems",
      url: "https://mharomo.systems",
      logo: {
        "@type": "ImageObject",
        url: "https://mharomo.systems/brand/logo-full.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://mharomo.systems/blogs/${post.slug}`,
    },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    inLanguage: "en-IN",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mharomo.systems/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://mharomo.systems/blogs",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://mharomo.systems/blogs/${post.slug}`,
      },
    ],
  };

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <BlogShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <nav className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          <Link href="/blogs" className="hover:text-[var(--ink)]">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span>{post.category}</span>
        </nav>

        <h1
          className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15]"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          <span className="text-[var(--signal)]">{post.primaryKeyword}</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.readingMinutes} min read</span>
          <span>{BLOG_AUTHOR.name}</span>
        </div>

        <p className="mt-6 text-[15px] leading-relaxed text-[var(--muted)] border-l-2 border-[var(--signal)] pl-4">
          {post.description}{" "}
          <Link href="/#contact" className={linkClass}>
            Contact MHAROMO Systems
          </Link>{" "}
          or browse the{" "}
          <Link href="/blogs" className={linkClass}>
            full blog
          </Link>
          .
        </p>

        <div className="mt-8 border-t border-[var(--line)] pt-2">
          {post.sections.map((block, i) => (
            <SectionBlock key={`${block.type}-${i}`} block={block} />
          ))}
        </div>

        {(related.length > 0 || externalLinks.length > 0) && (
          <aside className="mt-14 border border-[var(--line)] bg-white/70 p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--signal)]">
              Resources &amp; further reading
            </p>
            {related.length > 0 && (
              <div className="mt-4">
                <p
                  className="text-sm font-bold"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  Internal guides
                </p>
                <ul className="mt-2 space-y-2">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blogs/${p.slug}`} className={linkClass}>
                        {p.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/#projects" className={linkClass}>
                      MHAROMO Systems — actual projects
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className={linkClass}>
                      Software &amp; web development services
                    </Link>
                  </li>
                </ul>
              </div>
            )}
            {externalLinks.length > 0 && (
              <div className="mt-6">
                <p
                  className="text-sm font-bold"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  Authoritative external references
                </p>
                <ul className="mt-2 space-y-2">
                  {externalLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {link.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}

        {faqs.length > 0 && (
          <section className="mt-14 border-t border-[var(--line)] pt-10" aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Frequently asked questions
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Straight answers for {post.primaryKeyword} — expanded for search and for humans.
            </p>
            <div className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {faqs.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="cursor-pointer list-none font-bold tracking-tight pr-6 relative">
                    <span style={{ fontFamily: "var(--font-display), sans-serif" }}>
                      {item.question}
                    </span>
                    <span className="absolute right-0 top-0 text-[var(--muted)] group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#2a3340]">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <aside className="mt-14 border-t border-[var(--line)] pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--signal)]">
            Keep reading
          </p>
          <ul className="mt-4 space-y-4">
            {related.slice(0, 3).map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blogs/${p.slug}`}
                  className="font-bold tracking-tight hover:text-[var(--signal)]"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <a
              href="https://wa.me/916009325630?text=Hi%20MHAROMO%20Systems%20—%20I%20read%20your%20blog%20and%20want%20to%20talk."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center bg-[#128C7E] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#0E6F64] transition-colors"
            >
              Continue on WhatsApp
            </a>
          </p>
        </aside>
      </article>
    </BlogShell>
  );
}
