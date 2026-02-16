import Link from 'next/link'
import Script from 'next/script'

export const metadata = {
  title: 'AI Music Generator',
  description: 'Generate royalty-free music from text prompts for videos, podcasts, and apps.',
}

const siteUrl = 'https://mharomo.systems'

export default function AIMusicGeneratorPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Script
        id="json-ld-music"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'AI Music Generator',
            applicationCategory: 'AIApplication',
            operatingSystem: 'Web',
            description: 'Generate royalty-free music from text prompts for videos, podcasts, and apps.',
            url: `${siteUrl}/ai-music-generator`,
            creator: { '@type': 'Person', name: 'Mharomo' },
          }),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-10">
          <Link href="/ai-tools" className="text-xs text-zinc-400 hover:text-white transition-colors">
            Back to AI Tools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">What is an AI Music Generator?</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            An AI music generator creates original music from text prompts. You describe a mood, genre, and
            instrumentation, and the model returns a track. This tool is designed for fast, royalty-free
            music generation for content creators and product teams.
          </p>
        </div>

        <section className="space-y-4 text-sm sm:text-base text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">How it works</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Describe the mood, genre, and key instruments.</li>
            <li>Pick a duration between 5 and 60 seconds.</li>
            <li>Generate and iterate until it fits your project.</li>
          </ul>
          <p>
            Music generation focuses on quick iteration. If you need a longer soundtrack, create multiple segments
            and stitch them together in a video editor.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Use cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-zinc-300">
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">YouTube intros</h3>
              <p className="mt-2">Create short, unique intro music.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Podcast beds</h3>
              <p className="mt-2">Generate subtle background music.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Product demos</h3>
              <p className="mt-2">Add soundtracks to launches or walkthroughs.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Mood boards</h3>
              <p className="mt-2">Create musical references for creative direction.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Step-by-step example</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Prompt: &quot;Lo-fi hip hop beat, warm vinyl texture, mellow tempo&quot;.</li>
            <li>Set duration to 30 seconds.</li>
            <li>Refine with &quot;soft piano&quot; or &quot;jazzy sax&quot;.</li>
          </ol>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Comparison to alternatives</h2>
          <p>
            Traditional music libraries provide fixed tracks. This generator gives you custom, original audio from
            a simple prompt. It is faster for prototypes and removes licensing friction.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">FAQ</h2>
          <div className="mt-4 space-y-4 text-sm text-zinc-300">
            <div>
              <h3 className="font-semibold text-white">Can I use the music commercially?</h3>
              <p className="mt-1">Yes. The tracks are royalty free for your projects.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">What genres work best?</h3>
              <p className="mt-1">Clear genre labels and instrument cues produce the best results.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Can I generate longer tracks?</h3>
              <p className="mt-1">Use multiple segments and stitch them together in post-production.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Where can I learn more?</h3>
              <p className="mt-1">Read documentation or explore blog posts for examples.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href="/api/tools/launch?path=/music" className="px-5 py-2 rounded-lg bg-white text-black text-sm font-semibold">
            Try the tool
          </Link>
          <Link href="/blogs" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold">
            Read the blog
          </Link>
          <Link href="/systems/documentation/music" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold">
            View documentation
          </Link>
        </section>
      </div>
    </main>
  )
}
