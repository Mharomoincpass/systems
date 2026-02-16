'use client'

import { useRouter } from 'next/navigation'

export default function ImagesDocPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Documentation
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Image Generation</h1>
          <p className="text-lg text-gray-600">Create stunning images from text descriptions using state-of-the-art AI models</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div><div className="text-sm font-medium text-gray-600">Models</div><div className="text-2xl font-bold text-gray-900">4</div></div>
          <div><div className="text-sm font-medium text-gray-600">Speed</div><div className="text-2xl font-bold text-gray-900">5-60s</div></div>
          <div><div className="text-sm font-medium text-gray-600">Resolution</div><div className="text-2xl font-bold text-gray-900">1024x1024</div></div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            Generate high-quality images from text descriptions using cutting-edge AI models. Choose between speed and quality depending on your needs. All generated images are royalty-free and yours to use.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Models</h2>
          <div className="space-y-4">
            {[
              { name: 'FLUX Schnell', speed: 'Fastest', quality: 'Good', cost: 'Free', desc: 'Ultra-fast, great for quick iterations' },
              { name: 'Z-Image Turbo', speed: 'Very Fast', quality: 'Good', cost: 'Low', desc: 'Optimized for speed without sacrificing quality' },
              { name: 'Klein 4B', speed: 'Fast', quality: 'High', cost: 'Medium', desc: 'Balanced option for most use cases' },
              { name: 'Imagen-4', speed: 'Medium', quality: 'Highest', cost: 'High', desc: 'Google\'s model for maximum quality' },
            ].map((model, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">{model.cost}</span>
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
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Text-to-Image:</strong> Create images from detailed descriptions</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Multiple Models:</strong> Choose the best model for your needs</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>High Resolution:</strong> Generate images up to 1024x1024 pixels</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Instant Generation:</strong> Most images ready in seconds</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Royalty Free:</strong> All images are yours to use commercially</span></li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Social Media</h3><p className="text-sm text-gray-600">Create posts, thumbnails, and graphics</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Marketing</h3><p className="text-sm text-gray-600">Product mockups, ads, promotional content</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Design</h3><p className="text-sm text-gray-600">Concept art, illustration, UI elements</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Content</h3><p className="text-sm text-gray-600">Blog headers, featured images, covers</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Prompt Writing Tips</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Be Descriptive</h3><p className="text-sm text-gray-700">Include details: colors, style, mood, composition</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Specify Style</h3><p className="text-sm text-gray-700">Add art style: &quot;photorealistic&quot;, &quot;oil painting&quot;, &quot;pixel art&quot;, &quot;3D render&quot;</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Set Mood</h3><p className="text-sm text-gray-700">Describe atmosphere: &quot;cinematic&quot;, &quot;moody&quot;, &quot;bright and cheerful&quot;</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Add References</h3><p className="text-sm text-gray-700">Mention similar works or artists for style inspiration</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Best Practices</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-3"><span className="text-gray-400">•</span><span><strong>Start with FLUX:</strong> Free, fast model - good for testing prompts</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span><strong>Iterate:</strong> Try variations and adjust prompts based on results</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span><strong>Compare Models:</strong> Use same prompt across models to find best fit</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span><strong>Edit Results:</strong> Use image editors to refine generated images</span></li>
          </ul>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Create Your First Image</h2>
          <p className="text-gray-700 mb-6">Turn your ideas into stunning visuals.</p>
          <button onClick={() => router.push('/images')} className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            Launch Image Generator
          </button>
        </section>
      </div>
    </div>
  )
}
