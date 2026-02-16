'use client'

import { useRouter } from 'next/navigation'
import Script from 'next/script'

export default function VideosDocPage() {
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
          <h1 className="text-4xl font-bold mb-2">Video Generation</h1>
          <p className="text-lg text-gray-600">Create videos from text prompts using cutting-edge AI models</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div><div className="text-sm font-medium text-gray-600">Models</div><div className="text-2xl font-bold text-gray-900">1</div></div>
          <div><div className="text-sm font-medium text-gray-600">Target Length</div><div className="text-2xl font-bold text-gray-900">2-10s</div></div>
          <div><div className="text-sm font-medium text-gray-600">Output</div><div className="text-2xl font-bold text-gray-900">MP4</div></div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            Generate short videos from detailed text descriptions. The current model focuses on fast iterations for creative exploration and quick content creation.
          </p>
        </section>
            [
              { name: 'Grok Video', speed: 'Fast', quality: 'High', desc: 'Text-to-video generation optimized for quick results' },
            ].map((model, i) => (
            {[
              { name: 'LTX-2', speed: 'Fast', quality: 'High', desc: 'Open-source model optimized for speed' },
              { name: 'Seedance', speed: 'Faster', quality: 'Good', desc: 'Ultra-fast generation for quick iteration' },
            ].map((model, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">Featured</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{model.desc}</p>
                <div className="flex gap-4 text-xs text-gray-600">
                  <span>⚡ {model.speed}</span>
                  <span>✨ {model.quality}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Features</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Text-to-Video:</strong> Generate videos from descriptions</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Short Clips:</strong> Best for 2-10 second outputs</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>MP4 Output:</strong> Ready to share or edit</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Instant Download:</strong> Save and edit immediately</span></li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Marketing</h3><p className="text-sm text-gray-600">Product demos, ads, promotional content</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Social Media</h3><p className="text-sm text-gray-600">TikTok, Reels, YouTube Shorts</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Education</h3><p className="text-sm text-gray-600">Explainer videos, tutorials, courses</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Creative</h3><p className="text-sm text-gray-600">Animation, art, experimental media</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Motion Prompt Tips</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Be Specific</h3><p className="text-sm text-gray-700">Describe camera movement and subject motion clearly</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Use Action Verbs</h3><p className="text-sm text-gray-700">&quot;spinning&quot;, &quot;flowing&quot;, &quot;zooming&quot;, &quot;panning&quot; - descriptive movement</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Set Pacing</h3><p className="text-sm text-gray-700">Specify speed: &quot;slow&quot;, &quot;moderate&quot;, &quot;fast&quot;, &quot;energetic&quot;</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Camera Directions</h3><p className="text-sm text-gray-700">&quot;pan left&quot;, &quot;dolly in&quot;, &quot;orbit around&quot;, &quot;static wide shot&quot;</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Best Practices</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-3"><span className="text-gray-400">•</span><span><strong>Start Short:</strong> Begin with 2-6 second clips before longer ones</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span><strong>Detail-Oriented:</strong> More specific prompts = better results</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span><strong>Iterate:</strong> Small prompt changes can improve results</span></li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Limitations</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Target duration is 2-10 seconds and may vary by prompt</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Length control is best-effort and not guaranteed</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Text rendering may be inconsistent</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Processing can take up to a minute</span></li>
          </ul>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Create Your First Video</h2>
          <p className="text-gray-700 mb-6">Generate stunning videos from text prompts.</p>
          <button onClick={() => router.push('/videos')} className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            Launch Video Generator
          </button>
        </section>
      </div>
    </div>
    </>
  )
}
