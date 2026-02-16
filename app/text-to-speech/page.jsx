import Link from 'next/link'
import Script from 'next/script'

export const metadata = {
  title: 'Text to Speech',
  description: 'Generate natural-sounding voice audio from text with multiple voices.',
}

const siteUrl = 'https://mharomo.systems'

export default function TextToSpeechPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Script
        id="json-ld-tts"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Text to Speech',
            applicationCategory: 'AIApplication',
            operatingSystem: 'Web',
            description: 'Generate natural-sounding voice audio from text with multiple voices.',
            url: `${siteUrl}/text-to-speech`,
            creator: { '@type': 'Person', name: 'Mharomo' },
          }),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-10">
          <Link href="/ai-tools" className="text-xs text-zinc-400 hover:text-white transition-colors">
            Back to AI Tools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">What is Text to Speech?</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            Text to speech converts written text into natural-sounding audio. It is useful for narration,
            voiceovers, and accessibility. This tool offers curated voices with a simple input-and-generate flow.
          </p>
        </div>

        <section className="space-y-4 text-sm sm:text-base text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">How it works</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Paste or write text up to 5000 characters.</li>
            <li>Select a voice that matches your tone.</li>
            <li>Generate audio and download instantly.</li>
          </ul>
          <p>
            For longer scripts, split your text into smaller sections and generate multiple clips. This keeps
            pacing consistent and reduces errors.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Use cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-zinc-300">
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Video narration</h3>
              <p className="mt-2">Add clean voiceovers to tutorials and demos.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Product walkthroughs</h3>
              <p className="mt-2">Explain features with consistent narration.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Accessibility</h3>
              <p className="mt-2">Create audio versions of written content.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Podcasts</h3>
              <p className="mt-2">Generate segments or announcements quickly.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Step-by-step example</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Paste a 60-second script.</li>
            <li>Select the &quot;Rachel&quot; voice.</li>
            <li>Generate and download the audio.</li>
          </ol>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Comparison to alternatives</h2>
          <p>
            Traditional voice recording takes time and equipment. Text to speech gives you fast, consistent
            audio with no recording setup, ideal for rapid content production.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">FAQ</h2>
          <div className="mt-4 space-y-4 text-sm text-zinc-300">
            <div>
              <h3 className="font-semibold text-white">How many voices are available?</h3>
              <p className="mt-1">Six curated voices are available in the tool.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Is there a character limit?</h3>
              <p className="mt-1">Yes. Up to 5000 characters per request.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Can I use the audio commercially?</h3>
              <p className="mt-1">Yes. Audio is royalty free for your projects.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Where can I learn more?</h3>
              <p className="mt-1">Visit documentation or explore related blog posts.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href="/api/tools/launch?path=/tts" className="px-5 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 ease-out">
            Try the tool
          </Link>
          <Link href="/blogs" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 ease-out">
            Read the blog
          </Link>
          <Link href="/systems/documentation/tts" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 ease-out">
            View documentation
          </Link>
        </section>
      </div>
    </main>
  )
}
