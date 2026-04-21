import { Navbar } from '@/components/Navbar'
import Hero from '@/components/home/Hero'
import ToolsPreview from '@/components/home/ToolsPreview'
import dynamic from 'next/dynamic'

const ScrollStory = dynamic(() => import('@/components/home/ScrollStory'))
const Features = dynamic(() => import('@/components/home/Features'))
const Showcase = dynamic(() => import('@/components/home/Showcase'))
const CTA = dynamic(() => import('@/components/home/CTA'))

const siteUrl = 'https://mharomo.systems'

export const metadata = {
  title: 'Mharomo AI Chatbot: Chat, Image, Video, Music & Voice',
  description: 'Talk to one AI chatbot that can answer questions, generate images and video, create music, transcribe audio, and do text-to-speech in a single workflow.',
  keywords: ['AI chatbot', 'multimodal AI', 'AI image generator', 'AI video generator', 'AI music generator', 'text to speech', 'speech to text', 'AI assistant'],
  openGraph: {
    title: 'Mharomo AI Chatbot: Chat, Image, Video, Music & Voice',
    description: 'Talk to one AI chatbot that can answer questions, generate images and video, create music, transcribe audio, and do text-to-speech in a single workflow.',
    url: siteUrl,
    siteName: 'Mharomo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mharomo AI Chatbot: Chat, Image, Video, Music & Voice',
    description: 'Talk to one AI chatbot that can answer questions, generate images and video, create music, transcribe audio, and do text-to-speech in a single workflow.',
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
    description: 'A multi-tool AI chatbot for chat, code, images, video, music, transcription, and text-to-speech.',
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
    name: 'Mharomo - Multi-Tool AI Chatbot',
    url: siteUrl,
    description: 'Use one AI chatbot to write, plan, code, generate visuals, create audio, and handle voice workflows in a single place.',
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

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Mharomo Systems',
    url: siteUrl,
    image: `${siteUrl}/icon.svg`,
    description: 'Multi-modal AI chatbot platform for chat, image generation, video, music, and voice workflows.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Delhi',
      addressCountry: 'India',
    },
    areaServed: 'Worldwide',
    sameAs: [
      'https://linkedin.com/in/mharomo-ezung-51b158191',
      'https://github.com/Mharomoincpass',
    ],
  }

  return (
    <>
      <main className="relative bg-background text-foreground selection:bg-white selection:text-black">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <Navbar />
        
        <div className="relative z-10">
          <Hero />
          <div className="bg-background border-y border-border">
            <div className="max-w-6xl mx-auto px-6 py-4 text-center">
              <p className="text-sm sm:text-base text-muted-foreground">
                One chatbot, many capabilities: chat, research, code, images, video, music, and voice tools in one flow.
              </p>
            </div>
          </div>
          <ToolsPreview />
          <ScrollStory />
          <Features />
          <Showcase />
          <CTA />
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-[0.02] bg-noise"></div>
      </main>
    </>
  )
}
