import Link from 'next/link'

const siteUrl = 'https://mharomo.systems'

export const metadata = {
  title: 'Author - Mharomo Ezung',
  description: 'Learn about Mharomo Ezung, the creator behind Mharomo.systems and its AI tools for chat, images, video, music, and speech.',
  alternates: {
    canonical: `${siteUrl}/author`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Author - Mharomo Ezung',
    description: 'Creator of Mharomo.systems and its AI tools for chat, images, video, music, and speech.',
    url: `${siteUrl}/author`,
    siteName: 'Mharomo.systems',
    type: 'profile',
  },
  twitter: {
    card: 'summary',
    title: 'Author - Mharomo Ezung',
    description: 'Creator of Mharomo.systems and its AI tools for chat, images, video, music, and speech.',
  },
}

export default function AuthorPage() {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Mharomo Ezung',
    url: `${siteUrl}/author`,
    worksFor: {
      '@type': 'Organization',
      name: 'Mharomo.systems',
      url: siteUrl,
    },
    sameAs: [
      'https://linkedin.com/in/mharomo-ezung-51b158191',
      'https://github.com/Mharomoincpass',
    ],
  }

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Author - Mharomo Ezung',
    url: `${siteUrl}/author`,
    description: 'Author profile for Mharomo Ezung, creator of Mharomo.systems.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Author',
          item: `${siteUrl}/author`,
        },
      ],
    },
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Link href="/" className="text-xs text-zinc-600 hover:text-black transition-colors">
          Back to Home
        </Link>

        <div className="mt-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-zinc-200 flex items-center justify-center text-2xl font-bold text-zinc-700">
            M
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Mharomo Ezung</h1>
            <p className="text-sm text-zinc-600 mt-2">Software Developer</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <a className="text-zinc-700 hover:text-black underline" href="https://linkedin.com/in/mharomo-ezung-51b158191" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a className="text-zinc-700 hover:text-black underline" href="https://github.com/Mharomoincpass" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a className="text-zinc-700 hover:text-black underline" href="mailto:mharomoezgs@gmail.com">
                Email
              </a>
              <Link className="text-zinc-700 hover:text-black underline" href="/blogs">
                Read the Blog
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-10 space-y-4 text-zinc-700">
          <h2 className="text-2xl font-bold text-black">About</h2>
          <p>
            I build AI products that are fast, reliable, and practical. Mharomo.systems is focused on making AI tools
            accessible for creators, developers, and businesses. The platform includes multi-model chat, image
            generation, video creation, music generation, and speech tools.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-zinc-700">
          <h2 className="text-2xl font-bold text-black">Skills and Stack</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Frontend: React, Next.js, Tailwind CSS</li>
            <li>Backend: Node.js, Python, REST APIs</li>
            <li>Data and AI: Model orchestration, prompt design, multi-model routing</li>
            <li>Cloud: AWS, Google Cloud</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-zinc-700">
          <h2 className="text-2xl font-bold text-black">Focus Areas</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50">
              <h3 className="text-lg font-semibold text-black">Creative AI</h3>
              <p className="text-sm text-zinc-600 mt-2">Images, videos, and music generated from text prompts.</p>
            </div>
            <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50">
              <h3 className="text-lg font-semibold text-black">Voice and Speech</h3>
              <p className="text-sm text-zinc-600 mt-2">Speech-to-text and text-to-speech for accessibility and workflows.</p>
            </div>
            <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50">
              <h3 className="text-lg font-semibold text-black">AI Assistants</h3>
              <p className="text-sm text-zinc-600 mt-2">Multi-model chat for research, writing, and coding support.</p>
            </div>
            <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50">
              <h3 className="text-lg font-semibold text-black">System Integration</h3>
              <p className="text-sm text-zinc-600 mt-2">Connecting AI tools into real business workflows.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-3 text-zinc-700">
          <h2 className="text-2xl font-bold text-black">Press and Mentions</h2>
          <p>
            If you would like to feature Mharomo.systems or collaborate on an AI project, reach out anytime.
          </p>
        </section>
      </div>
    </main>
  )
}
