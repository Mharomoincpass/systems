'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

export default function DocumentationPage() {
  const router = useRouter()

  const systems = [
    { id: 'slm', name: 'Multi Chat Models', desc: 'Conversational AI assistant', path: '/systems/documentation/slm' },
    { id: 'images', name: 'Image Generation', desc: 'Text-to-image with affordable models', path: '/systems/documentation/images' },
    { id: 'videos', name: 'Video Generation', desc: 'Text-to-video with Grok', path: '/systems/documentation/videos' },
    { id: 'music', name: 'Music Generation', desc: 'Royalty-free music from text', path: '/systems/documentation/music' },
    { id: 'transcribe', name: 'Transcription', desc: 'Speech-to-text conversion', path: '/systems/documentation/transcribe' },
    { id: 'tts', name: 'Text-to-Speech', desc: 'Natural voice synthesis', path: '/systems/documentation/tts' },
  ]

  return (
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-DEN9D68RFH"
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DEN9D68RFH');
          `,
        }}
      />
      <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Systems
        </button>

        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Documentation</h1>
          <p className="text-sm text-gray-500">Reference guides for each system — features, usage, and best practices.</p>
        </div>

        <div className="space-y-1">
          {systems.map((system) => (
            <Link
              key={system.id}
              href={system.path}
              className="group flex items-center justify-between p-3 sm:p-4 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div>
                <h2 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{system.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{system.desc}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <div className="mt-10 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Getting Started</h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Select a system from the <Link href="/systems" className="text-blue-600 hover:underline">/systems</Link> page to begin</li>
            <li>• Check your credit balance before generating content</li>
            <li>• Each model has different cost and performance trade-offs</li>
          </ul>
        </div>
      </div>
    </div>
    </>
  )
}
