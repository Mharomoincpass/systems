import Link from "next/link";
import { notFound } from "next/navigation";
import BlogShell from "@/components/BlogShell";
import { BLOG_AUTHOR, getAllPosts, getAllSlugs, getPostBySlug } from "@/lib/blogs/posts";

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

function SectionBlock({ block }) {
  if (block.type === "h2") {
    return (
      <h2
        className="mt-10 text-2xl font-bold tracking-tight"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        {block.text}
      </h2>
    );
  }
  if (block.type === "p") {
    return <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-[#2a3340]">{block.text}</p>;
  }
  if (block.type === "ul") {
    return (
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[#2a3340]">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === "ol") {
    return (
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-[#2a3340]">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
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

  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

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

        <div className="mt-8 border-t border-[var(--line)] pt-2">
          {post.sections.map((block, i) => (
            <SectionBlock key={`${block.type}-${i}`} block={block} />
          ))}
        </div>

        <aside className="mt-14 border-t border-[var(--line)] pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--signal)]">
            Keep reading
          </p>
          <ul className="mt-4 space-y-4">
            {related.map((p) => (
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
        </aside>
      </article>
    </BlogShell>
  );
}
