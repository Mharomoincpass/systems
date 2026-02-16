'use client'

import Link from 'next/link'

const posts = [
  {
    slug: 'welcome-to-mharomo-systems',
    title: 'Welcome to Mharomo Systems',
    excerpt: 'A quick overview of the AI tools, models, and workflows you can explore here.',
    date: '2026-02-16',
  },
  {
    slug: 'building-multi-model-chat',
    title: 'Building Multi Chat Models',
    excerpt: 'How we designed a fast multi-model chat experience and kept it snappy.',
    date: '2026-02-16',
  },
]

export default function BlogsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <Link href="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">Blogs</h1>
          <p className="text-sm text-zinc-500 mt-1">Short updates and notes.</p>
        </div>

        <div className="divide-y divide-white/10">
          {posts.map((post) => (
            <div key={post.slug} className="py-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base sm:text-lg font-medium">{post.title}</h2>
                <span className="text-xs text-zinc-500 whitespace-nowrap">{post.date}</span>
              </div>
              <p className="text-sm text-zinc-500 mt-2">{post.excerpt}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
