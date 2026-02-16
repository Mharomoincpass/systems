'use client'

import { useRouter } from 'next/navigation'
import Script from 'next/script'

export default function TTSDocPage() {
  const router = useRouter()

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Documentation
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Text-to-Speech</h1>
          <p className="text-lg text-gray-600">Convert text to natural-sounding audio with multiple voices and languages</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div><div className="text-sm font-medium text-gray-600">Voices</div><div className="text-2xl font-bold text-gray-900">6+</div></div>
          <div><div className="text-sm font-medium text-gray-600">Char Limit</div><div className="text-2xl font-bold text-gray-900">5000</div></div>
          <div><div className="text-sm font-medium text-gray-600">Quality</div><div className="text-2xl font-bold text-gray-900">Natural</div></div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            Generate natural-sounding audio from text using advanced TTS technology. Create narration for videos, voiceovers for presentations, audiobooks, or add voice to your applications. Choose from realistic voices and adjust speed for perfect timing.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Voices</h2>
          <div className="space-y-3">
            {[
              { name: 'Aria', style: 'Professional, neutral tone' },
              { name: 'Roger', style: 'Deep, authoritative voice' },
              { name: 'Sarah', style: 'Warm, engaging tone' },
              { name: 'Chris', style: 'Casual, conversational' },
              { name: 'Maya', style: 'Bright, friendly' },
              { name: 'Leo', style: 'Natural, expressive' },
            ].map((voice, i) => (
              <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
                <span className="font-semibold text-gray-900">{voice.name}</span>
                <span className="text-sm text-gray-600">{voice.style}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Features</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Natural Voices:</strong> 6+ realistic voice options</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Speed Control:</strong> Adjust playback speed 0.5x - 2x</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Multiple Languages:</strong> English, Spanish, French, German, and more</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>5000 Chars/Request:</strong> Split longer content into segments</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Instant Generation:</strong> Audio ready to download immediately</span></li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">YouTube Videos</h3><p className="text-sm text-gray-600">Add professional narration to your content</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Audiobooks</h3><p className="text-sm text-gray-600">Convert books to audio format</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">E-Learning</h3><p className="text-sm text-gray-600">Voice content for online courses</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Presentations</h3><p className="text-sm text-gray-600">Professional voiceovers for slideshows</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Best Practices</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Use Proper Punctuation</h3><p className="text-sm text-gray-700">Periods, commas, and questions create natural pauses</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Match Voice to Content</h3><p className="text-sm text-gray-700">Choose voice tone that fits your content style</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Test Different Speeds</h3><p className="text-sm text-gray-700">Experiment with speed for readability and engagement</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Split Long Text</h3><p className="text-sm text-gray-700">Keep segments under 5,000 characters for consistency</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Review Before Use</h3><p className="text-sm text-gray-700">Listen to preview and make text adjustments as needed</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Limitations</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>5,000 character limit per generation</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Complex pronunciations may need manual correction</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Limited control over emphasis and emotion</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Processing time varies with text length</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Technical terms may need clarification</span></li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Pro Tips</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Use SSML markup for advanced control over speech</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Add emphasis with punctuation: !!!, ...</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Use parentheses for asides or stage directions</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Break scripts into natural speaking sections</span></li>
          </ul>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Generate Your Voice Now</h2>
          <p className="text-gray-700 mb-6">Turn text into natural-sounding audio.</p>
          <button onClick={() => router.push('/tts')} className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            Launch Text-to-Speech
          </button>
        </section>
      </div>
    </div>
    </>
  )
}
