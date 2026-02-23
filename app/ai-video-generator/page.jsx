import Link from 'next/link'
import Script from 'next/script'

export const metadata = {
  title: 'AI Video Generator',
  description: 'Generate short videos from text prompts using Grok Video.',
}

const siteUrl = 'https://mharomo.systems'

export default function AIVideoGeneratorPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Script
        id="json-ld-video"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'AI Video Generator',
            applicationCategory: 'AIApplication',
            operatingSystem: 'Web',
            description: 'Generate short videos from text prompts using Advanced AI Models.',
            url: `${siteUrl}/ai-video-generator`,
            creator: { '@type': 'Person', name: 'Mharomo' },
          }),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-10">
          <Link href="/ai-tools" className="text-xs text-zinc-400 hover:text-white transition-colors">
            Back to AI Tools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">What is an AI Video Generator?</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            An AI video generator creates short video clips from text. Describe the scene, the motion, and the
            camera behavior, and the model turns that description into a playable clip. This tool uses Advanced AI Models
            for fast, creative iterations.
          </p>
        </div>

        <section className="space-y-4 text-sm sm:text-base text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">How it works</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Write a motion-focused prompt with action verbs.</li>
            <li>Set a target duration (2 to 10 seconds).</li>
            <li>Generate and refine with more specific details.</li>
          </ul>
          <p>
            Duration is best-effort. The model prioritizes a coherent clip over exact length. For tighter timing,
            keep prompts short and avoid multiple unrelated actions.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Use cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-zinc-300">
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Social clips</h3>
              <p className="mt-2">Create short clips for reels and highlights.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Product previews</h3>
              <p className="mt-2">Show a product motion or environment.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Storyboards</h3>
              <p className="mt-2">Generate quick scenes for concept testing.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Creative experiments</h3>
              <p className="mt-2">Explore stylized motion and atmosphere.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Step-by-step example</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Prompt: &quot;Close-up of raindrops on a window, slow pan, soft bokeh&quot;.</li>
            <li>Set duration to 4 seconds.</li>
            <li>Refine with &quot;low light&quot; or &quot;neon city reflections&quot;.</li>
          </ol>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Comparison to alternatives</h2>
          <p>
            Many video tools require complex settings or long render times. This generator focuses on fast, creative
            iteration with simple inputs. It is ideal for quick prototypes and short clips.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">FAQ</h2>
          <div className="mt-4 space-y-4 text-sm text-zinc-300">
            <div>
              <h3 className="font-semibold text-white">Can I control the exact length?</h3>
              <p className="mt-1">Length is best-effort. The model may return a slightly different duration.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">What prompts work best?</h3>
              <p className="mt-1">Use action verbs and a clear camera direction.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Is the output downloadable?</h3>
              <p className="mt-1">Yes. You can download the MP4 directly after generation.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Where can I learn more?</h3>
              <p className="mt-1">Check the documentation or related blog posts.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href="/api/tools/launch?path=/videos" className="px-5 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 ease-out">
            Try the tool
          </Link>
          <Link href="/blogs" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 ease-out">
            Read the blog
          </Link>
          <Link href="/systems/documentation/videos" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 ease-out">
            View documentation
          </Link>
        </section>
      </div>
    </main>
  )
}
