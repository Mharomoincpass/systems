import Link from "next/link";
import BlogShell from "@/components/BlogShell";
import { getAllPosts } from "@/lib/blogs/posts";

export const metadata = {
  title: "Blog — Website & Software Development in Wokha, Nagaland",
  description:
    "Guides on website development, software development, ecommerce, and local SEO for businesses in Wokha, Kohima, Dimapur, and across Nagaland — by MHAROMO Systems.",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "MHAROMO Systems Blog — Web & software for Nagaland",
    description:
      "Practical guides for website cost, local SEO, ecommerce, and custom software in Wokha and Nagaland.",
    url: "/blogs",
    type: "website",
  },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogsIndexPage() {
  const posts = getAllPosts();

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "MHAROMO Systems Blog",
    description:
      "Website development and software development guides for Wokha and Nagaland businesses.",
    url: "https://mharomo.systems/blogs",
    publisher: {
      "@type": "Organization",
      name: "MHAROMO Systems",
      url: "https://mharomo.systems",
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `https://mharomo.systems/blogs/${p.slug}`,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt || p.publishedAt,
    })),
  };

  return (
    <BlogShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--signal)]">
          Blog
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Website &amp; software development for Wokha and Nagaland
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--muted)] leading-relaxed">
          Practical guides for local businesses — cost, hiring, ecommerce, local SEO, and when you
          need custom software instead of only a brochure site.
        </p>

        <ul className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blogs/${post.slug}`}
                className="group block py-7 hover:bg-white/60 -mx-2 px-2 sm:-mx-3 sm:px-3 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  <span className="text-[var(--signal)]">{post.category}</span>
                  <span>{formatDate(post.publishedAt)}</span>
                  <span>{post.readingMinutes} min read</span>
                </div>
                <h2
                  className="mt-2 text-xl sm:text-2xl font-bold tracking-tight group-hover:text-[var(--signal)] transition-colors"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{post.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </BlogShell>
  );
}
