'use client'

import { useRouter } from 'next/navigation'

export default function MusicDocPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Documentation
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Music Generation</h1>
          <p className="text-lg text-gray-600">Create original, royalty-free music from text descriptions</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div><div className="text-sm font-medium text-gray-600">Duration</div><div className="text-2xl font-bold text-gray-900">5-60s</div></div>
          <div><div className="text-sm font-medium text-gray-600">Cost</div><div className="text-2xl font-bold text-gray-900">Low</div></div>
          <div><div className="text-sm font-medium text-gray-600">Rights</div><div className="text-2xl font-bold text-gray-900">Yours</div></div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            Generate unique, royalty-free music tracks from text descriptions. Perfect for background music in videos, podcasts, games, and projects. No copyright issues - all generated music is original and licensed for your use.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Features</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Text-to-Music:</strong> Describe the music you want to create</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Duration Control:</strong> Generate 5 to 60 second tracks</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Royalty Free:</strong> Use commercially without restrictions</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Multiple Genres:</strong> Electronic, classical, ambient, and more</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Original Content:</strong> Unique tracks every generation</span></li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">YouTube Videos</h3><p className="text-sm text-gray-600">Background music for content and tutorials</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Podcasts</h3><p className="text-sm text-gray-600">Intro, outro, and transition music</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Games</h3><p className="text-sm text-gray-600">In-game BGM and soundtracks</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Meditation</h3><p className="text-sm text-gray-600">Relaxation and focus music</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Prompt Examples</h2>
          <div className="space-y-2">
            <p className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700">&quot;Upbeat electronic dance music with heavy bass and synthesizers&quot;</p>
            <p className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700">&quot;Lo-fi hip hop beats for studying and relaxation&quot;</p>
            <p className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700">&quot;Energetic rock guitar solo with drums&quot;</p>
            <p className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700">&quot;Ambient soundscape with nature sounds&quot;</p>
            <p className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700">&quot;Classical jazz improvisation with saxophone&quot;</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Best Practices</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Specify Genre & Mood</h3><p className="text-sm text-gray-700">&quot;upbeat&quot;, &quot;chill&quot;, &quot;dramatic&quot; - set the tone early</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Include Instruments</h3><p className="text-sm text-gray-700">Mention specific instruments for targeted results</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Set Duration</h3><p className="text-sm text-gray-700">Specify desired length: &quot;30 second track&quot;</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Iterate</h3><p className="text-sm text-gray-700">Try variations until you get the right vibe</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Limitations</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>5-60 second maximum length per track</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>No vocals or lyrics support</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Results vary - may need multiple attempts</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Quality depends on prompt clarity</span></li>
          </ul>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Create Your Music Now</h2>
          <p className="text-gray-700 mb-6">Generate original, royalty-free tracks.</p>
          <button onClick={() => router.push('/music')} className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            Launch Music Generator
          </button>
        </section>
      </div>
    </div>
  )
}
