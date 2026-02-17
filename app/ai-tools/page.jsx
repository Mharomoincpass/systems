import Link from 'next/link'
import Script from 'next/script'

const siteUrl = 'https://mharomo.systems'

export const metadata = {
  title: 'AI Tools - Multi Chat Models, Image, Video, Music & Speech Tools',
  description: 'Explore AI tools for chat, images, video, music, speech-to-text, and text-to-speech. Free AI tools for content creation and productivity.',
  keywords: ['AI tools', 'multi chat models', 'AI image generator', 'AI video generator', 'AI music generator', 'speech to text', 'text to speech', 'MCM'],
  openGraph: {
    title: 'AI Tools - Complete Suite for Content Creation',
    description: 'Explore AI tools for chat, images, video, music, speech-to-text, and text-to-speech.',
    url: `${siteUrl}/ai-tools`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tools - Complete Suite for Content Creation',
    description: 'Explore AI tools for chat, images, video, music, speech-to-text, and text-to-speech.',
  },
  alternates: {
    canonical: `${siteUrl}/ai-tools`,
  },
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
}

const tools = [
  {
    href: '/ai-tools/mcm',
    title: 'Multi Chat Models (MCM)',
    desc: 'Multi-model chat assistant for fast, accurate answers and workflows.',
  },
  {
    href: '/ai-image-generator',
    title: 'AI Image Generator',
    desc: 'Create images from text prompts with affordable model options.',
  },
  {
    href: '/ai-video-generator',
    title: 'AI Video Generator',
    desc: 'Generate short videos from detailed text prompts.',
  },
  {
    href: '/ai-music-generator',
    title: 'AI Music Generator',
    desc: 'Make royalty-free music from text descriptions.',
  },
  {
    href: '/speech-to-text',
    title: 'Speech to Text',
    desc: 'Transcribe audio to text with high accuracy.',
  },
  {
    href: '/text-to-speech',
    title: 'Text to Speech',
    desc: 'Generate natural-sounding voice audio from text.',
  },
]

export default function AIToolsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Script
        id="json-ld-collectionpage"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'AI Tools',
            description: 'A comprehensive suite of AI-powered tools for content creation, chat, and productivity.',
            url: `${siteUrl}/ai-tools`,
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
                  name: 'AI Tools',
                  item: `${siteUrl}/ai-tools`,
                },
              ],
            },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: 6,
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Multi Chat Models (MCM)',
                    description: 'Multi-model chat assistant for fast, accurate answers and workflows.',
                    url: `${siteUrl}/ai-tools/mcm`,
                    applicationCategory: 'AIApplication',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'AI Image Generator',
                    description: 'Create images from text prompts with affordable model options.',
                    url: `${siteUrl}/ai-image-generator`,
                    applicationCategory: 'AIApplication',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'AI Video Generator',
                    description: 'Generate short videos from detailed text prompts.',
                    url: `${siteUrl}/ai-video-generator`,
                    applicationCategory: 'AIApplication',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'AI Music Generator',
                    description: 'Make royalty-free music from text descriptions.',
                    url: `${siteUrl}/ai-music-generator`,
                    applicationCategory: 'AIApplication',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 5,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Speech to Text',
                    description: 'Transcribe audio to text with high accuracy.',
                    url: `${siteUrl}/speech-to-text`,
                    applicationCategory: 'AIApplication',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 6,
                  item: {
                    '@type': 'SoftwareApplication',
                    name: 'Text to Speech',
                    description: 'Generate natural-sounding voice audio from text.',
                    url: `${siteUrl}/text-to-speech`,
                    applicationCategory: 'AIApplication',
                  },
                },
              ],
            },
          }),
        }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-12">
          <Link href="/" className="text-xs text-zinc-600 hover:text-black transition-colors">
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">AI Tools System</h1>
          <p className="text-base text-zinc-700 leading-relaxed">
            A comprehensive suite of AI-powered tools designed to unlock creative potential and streamline workflows. Our system combines cutting-edge AI models with intuitive interfaces, making advanced technology accessible to everyone—from creators and developers to businesses and enterprises.
          </p>
        </div>

        <div className="mb-12 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-3">What We Offer</h2>
            <p className="text-zinc-700 leading-relaxed">
              Our platform provides a unified ecosystem of AI tools that work together seamlessly. Whether you&apos;re generating images from text, creating videos, transcribing audio, or building multi-model chat applications, our system handles it all with precision and speed. We focus on delivering high-quality results while keeping the tools easy to use.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">Core Features</h2>
            <ul className="space-y-2 text-zinc-700">
              <li className="flex items-start">
                <span className="font-semibold mr-3">•</span>
                <span><strong>Multi-Modal AI:</strong> Chat with multiple AI models simultaneously for the best results.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-3">•</span>
                <span><strong>Creative Generation:</strong> From images to videos to music, generate professional-quality content in minutes.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-3">•</span>
                <span><strong>Audio Processing:</strong> Convert between speech and text with high accuracy for transcription and voice generation.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-3">•</span>
                <span><strong>Fast & Reliable:</strong> Built for performance with low latency and high uptime.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-3">•</span>
                <span><strong>Affordable:</strong> Choose from various model options at different price points to fit your budget.</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">Use Cases</h2>
            <p className="text-zinc-700 leading-relaxed">
              Content creators can generate imagery and videos for social media. Businesses can automate customer support with multi-model chat. Developers can integrate AI capabilities into their applications. Marketing teams can create multiple ad variations in seconds. Students and researchers can leverage AI for learning and discovery. The possibilities are endless.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Explore Our Tools</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition"
              >
                <h3 className="text-lg font-semibold">{tool.title}</h3>
                <p className="text-sm text-zinc-600 mt-2">{tool.desc}</p>
                <div className="text-xs text-zinc-500 mt-3">Learn more</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 text-xs text-zinc-600">
          Looking for technical details? Visit the{' '}
          <Link href="/systems/documentation" className="text-zinc-700 hover:text-black font-medium">
            documentation
          </Link>
          .
        </div>
      </div>
    </main>
  )
}
