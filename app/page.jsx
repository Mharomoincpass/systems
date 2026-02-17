import { Navbar } from '@/components/Navbar'
import SmoothScroll from '@/components/SmoothScroll'
import Hero from '@/components/home/Hero'
import ScrollStory from '@/components/home/ScrollStory'
import Features from '@/components/home/Features'
import Showcase from '@/components/home/Showcase'
import CTA from '@/components/home/CTA'
import ToolsPreview from '@/components/home/ToolsPreview'

const siteUrl = 'https://mharomo.systems'

export const metadata = {
  title: 'Free AI Tools - Chat, Image, Video, Music & Voice | Mharomo Systems',
  description: 'Use free AI tools for chat, image generation, video, music, text-to-speech, and speech-to-text. All in one place.',
  keywords: ['AI tools', 'AI image generator', 'AI video generator', 'AI music generator', 'text to speech', 'speech to text', 'AI chat', 'free AI tools'],
  openGraph: {
    title: 'Free AI Tools - Chat, Image, Video, Music & Voice | Mharomo Systems',
    description: 'Use free AI tools for chat, image generation, video, music, text-to-speech, and speech-to-text. All in one place.',
    url: siteUrl,
    siteName: 'Mharomo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Tools - Chat, Image, Video, Music & Voice | Mharomo Systems',
    description: 'Use free AI tools for chat, image generation, video, music, text-to-speech, and speech-to-text. All in one place.',
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function Home() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mharomo',
    url: siteUrl,
    description: 'AI Tools for Chat, Images, Video, Music, Speech-to-Text and Text-to-Speech',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/ai-tools?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Mharomo - AI Tools Platform',
    url: siteUrl,
    description: 'Explore free AI tools for generating images, videos, music, transcribing audio, and chatting with multiple AI models.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
      ],
    },
  }

  return (
    <>
      <SmoothScroll>
        <main className="bg-black text-white selection:bg-white selection:text-black">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
          />
          <Navbar />
          
          <div className="relative z-10">
            <Hero />
            <div className="bg-black border-y border-white/10">
              <div className="max-w-6xl mx-auto px-6 py-4 text-center">
                <p className="text-sm sm:text-base text-zinc-400">
                  No sign-up required. Free AI tools for chat, images, video, music, and voice.
                </p>
              </div>
            </div>
            <ToolsPreview />
            <ScrollStory />
            <Features />
            <Showcase />
            <CTA />
          </div>

          {/* Noise overlay for texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] sm:opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </main>
      </SmoothScroll>
    </>
  )
}
