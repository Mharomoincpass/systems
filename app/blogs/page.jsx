import Link from 'next/link'

const siteUrl = 'https://mharomo.systems'

export const metadata = {
  title: 'Blog - AI Tools and Insights | Mharomo.systems',
  description: 'Read our latest articles about AI tools, free AI chat, image generation, and how to leverage AI for your business.',
  keywords: 'ai blog, ai tools, free ai chat, ai image generator, ai tutorials',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Blog - AI Tools and Insights',
    description: 'Read our latest articles about AI tools, free AI chat, image generation, and how to leverage AI for your business.',
    url: 'https://mharomo.systems/blogs',
    siteName: 'Mharomo.systems',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mharomo.systems/blogs',
  },
}

const posts = [
  {
    slug: 'free-ai-chat-guide',
    title: 'Free AI Chat: A Full Guide for 2026',
    excerpt: 'Discover the world of free AI chat tools and how they can help your business. Learn about top platforms, features, and custom solutions.',
    date: '2026-02-17',
  },
  {
    slug: 'ai-photo-generator-free',
    title: 'AI Photo Generator Free: Your Guide to Creating Stunning Visuals',
    excerpt: 'Learn how to create amazing pictures with text prompts using free AI photo generators. A complete guide to turning your words into images.',
    date: '2026-02-17',
  },
]

export default function BlogsPage() {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Mharomo.systems Blog',
    description: 'Expert insights on AI tools, tutorials, and industry best practices.',
    url: `${siteUrl}/blogs`,
    publisher: {
      '@type': 'Organization',
      name: 'Mharomo.systems',
      url: siteUrl,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `${siteUrl}/blogs/${post.slug}`,
      datePublished: post.date,
    })),
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <Link href="/" className="text-xs text-zinc-600 hover:text-black transition-colors">
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">Blogs</h1>
          <p className="text-sm text-zinc-600 mt-1">Expert insights on AI tools, tutorials, and industry best practices.</p>
        </div>

        <div className="divide-y divide-zinc-200">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blogs/${post.slug}`}>
              <div className="py-4 hover:bg-zinc-50 px-2 rounded transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base sm:text-lg font-medium">{post.title}</h2>
                  <span className="text-xs text-zinc-500 whitespace-nowrap">{post.date}</span>
                </div>
                <p className="text-sm text-zinc-600 mt-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
