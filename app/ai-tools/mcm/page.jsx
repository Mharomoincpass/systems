import Link from 'next/link'
import Script from 'next/script'

export const metadata = {
  title: 'Multi Chat Models (MCM)',
  description: 'Multi-model chat assistant for fast answers, coding help, and research workflows.',
}

const siteUrl = 'https://mharomo.systems'

export default function MultiChatModelsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Script
        id="json-ld-mcm"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Multi Chat Models (MCM)',
            applicationCategory: 'AIApplication',
            operatingSystem: 'Web',
            description: 'Multi-model chat assistant for fast answers, coding help, and research workflows.',
            url: `${siteUrl}/ai-tools/mcm`,
            creator: { '@type': 'Person', name: 'Mharomo' },
          }),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-10">
          <Link href="/ai-tools" className="text-xs text-zinc-400 hover:text-white transition-colors">
            Back to AI Tools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">What is Multi Chat Models (MCM)?</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            Multi Chat Models (MCM) is a multi-model AI assistant that lets you choose the best model for your task.
            Use it for everyday questions, coding help, research summaries, and content drafting. The focus is
            speed, clarity, and reliable answers with a simple UI.
          </p>
        </div>

        <section className="space-y-4 text-sm sm:text-base text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">How it works</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Select a model that matches your use case (fast, large, or specialized).</li>
            <li>Send a message and stream responses in real time.</li>
            <li>Switch models mid-session to compare outputs or optimize cost.</li>
            <li>Copy responses, keep context, and iterate quickly.</li>
          </ul>
          <p>
            The system is optimized for interaction speed and clarity. Streaming updates are batched to keep the UI smooth.
            If you want detailed reasoning, choose a larger model. If you want quick drafts, use the fast model.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Use cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-zinc-300">
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Coding help</h3>
              <p className="mt-2">Explain errors, generate snippets, or review logic with a fast feedback loop.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Research summaries</h3>
              <p className="mt-2">Turn long notes into concise, structured summaries.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Product writing</h3>
              <p className="mt-2">Draft product copy, specs, and feature lists.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Brainstorming</h3>
              <p className="mt-2">Generate ideas, variations, and alternatives quickly.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Step-by-step example</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open the Multi Chat Models tool.</li>
            <li>Pick a fast model for quick iteration.</li>
            <li>Ask: &quot;Summarize this design doc into 5 bullets.&quot;</li>
            <li>Switch to a larger model and ask for a more detailed summary.</li>
            <li>Copy the result or refine with a follow-up question.</li>
          </ol>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Comparison to alternatives</h2>
          <p>
            Many chat tools lock you into a single model. Multi Chat Models gives you multiple model choices in one place.
            This means you can trade speed for depth without switching platforms. It is ideal for teams or power users who
            need different outputs for different tasks.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">FAQ</h2>
          <div className="mt-4 space-y-4 text-sm text-zinc-300">
            <div>
              <h3 className="font-semibold text-white">Is Multi Chat Models free to try?</h3>
              <p className="mt-1">Yes. You can explore the tool and test models with available credits.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Can I switch models mid-chat?</h3>
              <p className="mt-1">Yes. Switch models anytime to compare responses or improve accuracy.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Does it support code formatting?</h3>
              <p className="mt-1">Yes. Responses support structured text and code blocks.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Where can I learn more?</h3>
              <p className="mt-1">Visit the documentation or read related posts on the blog.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href="/api/tools/launch?path=/MCM" className="px-5 py-2 rounded-lg bg-white text-black text-sm font-semibold">
            Try the tool
          </Link>
          <Link href="/blogs" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold">
            Read the blog
          </Link>
          <Link href="/systems/documentation/mcm" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold">
            View documentation
          </Link>
        </section>
      </div>
    </main>
  )
}
