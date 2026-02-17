import { Navbar } from '@/components/Navbar'
import SmoothScroll from '@/components/SmoothScroll'
import Hero from '@/components/home/Hero'
import ScrollStory from '@/components/home/ScrollStory'
import Features from '@/components/home/Features'
import Showcase from '@/components/home/Showcase'
import CTA from '@/components/home/CTA'
import Script from 'next/script'

const siteUrl = 'https://mharomo.systems'

export const metadata = {
  title: 'Mharomo - AI Tools for Chat, Images, Video, Music & More',
  description: 'Free AI tools for content creation. Generate images, videos, music, transcribe audio, and chat with multiple AI models. Fast, affordable, and easy to use.',
  keywords: ['AI tools', 'AI image generator', 'AI video generator', 'AI music generator', 'text to speech', 'speech to text', 'AI chat', 'free AI tools'],
  openGraph: {
    title: 'Mharomo - AI Tools for Chat, Images, Video, Music & More',
    description: 'Free AI tools for content creation. Generate images, videos, music, transcribe audio, and chat with multiple AI models.',
    url: siteUrl,
    siteName: 'Mharomo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mharomo - AI Tools for Chat, Images, Video, Music & More',
    description: 'Free AI tools for content creation. Generate images, videos, music, transcribe audio, and chat with multiple AI models.',
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
  return (
    <>
      <Script
        id="json-ld-website"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />
      <Script
        id="json-ld-webpage"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />
      <SmoothScroll>
        <main className="bg-black text-white selection:bg-white selection:text-black">
          <Navbar />
          
          <div className="relative z-10">
            <Hero />
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
