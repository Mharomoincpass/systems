'use client'

import { useRouter } from 'next/navigation'
import Script from 'next/script'

export default function TranscribeDocPage() {
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
          <h1 className="text-4xl font-bold mb-2">Audio Transcription</h1>
          <p className="text-lg text-gray-600">Convert speech to text with high accuracy across multiple languages</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div><div className="text-sm font-medium text-gray-600">Languages</div><div className="text-2xl font-bold text-gray-900">99+</div></div>
          <div><div className="text-sm font-medium text-gray-600">Max File</div><div className="text-2xl font-bold text-gray-900">25 MB</div></div>
          <div><div className="text-sm font-medium text-gray-600">Accuracy</div><div className="text-2xl font-bold text-gray-900">High</div></div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            Convert audio files to text using OpenAI&apos;s Whisper model. Automatically transcribe podcasts, interviews, meetings, or any audio content. The model handles multiple languages and works well with background noise.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Supported Formats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['MP3', 'WAV', 'M4A', 'FLAC', 'OGG', 'WEBM', 'AAC', 'OPUS'].map((fmt) => (
              <div key={fmt} className="p-3 text-center rounded-lg bg-gray-100 border border-gray-200 text-sm font-medium text-gray-700">
                {fmt}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">Maximum file size: 25 MB</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Features</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>High Accuracy:</strong> OpenAI Whisper model trained on diverse audio</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Multilingual:</strong> Recognizes 99+ languages automatically</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Noise Handling:</strong> Works with background noise</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Fast Processing:</strong> Quick turnaround for most files</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Full Text:</strong> Get complete transcripts, not summaries</span></li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Podcasts</h3><p className="text-sm text-gray-600">Extract full episode transcripts for SEO and accessibility</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Meetings</h3><p className="text-sm text-gray-600">Convert recordings to searchable, shareable text</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Interviews</h3><p className="text-sm text-gray-600">Create transcripts for articles and articles</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Accessibility</h3><p className="text-sm text-gray-600">Generate captions for video content</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Accuracy Tips</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Clear Audio</h3><p className="text-sm text-gray-700">Higher quality recordings produce better transcriptions</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Minimize Noise</h3><p className="text-sm text-gray-700">Reduce background noise before uploading for best results</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Standard Speech</h3><p className="text-sm text-gray-700">Clear pronunciation works best; accents are handled well</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Edit Results</h3><p className="text-sm text-gray-700">Review transcripts and make manual corrections as needed</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Limitations</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Limited to 25 MB file size</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>May struggle with heavy accents or dialects</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Background music can reduce accuracy</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Multiple speakers may need manual editing</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Technical jargon may be misheard</span></li>
          </ul>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Transcribe Your Audio</h2>
          <p className="text-gray-700 mb-6">Convert speech to text instantly.</p>
          <button onClick={() => router.push('/transcribe')} className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            Launch Transcriber
          </button>
        </section>
      </div>
    </div>
    </>
  )
}
