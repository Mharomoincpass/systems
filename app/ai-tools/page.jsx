import Link from 'next/link'

export const metadata = {
  title: 'AI Tools',
  description: 'Explore AI tools for chat, images, video, music, speech-to-text, and text-to-speech.',
}

const tools = [
  {
    href: '/ai-tools/mcm',
    title: 'Multi Chat Models (MCM)',
    desc: 'Multi-model chat assistant for fast, accurate answers and workflows.',
  },
  {
    href: '/ai-image-generator',
    title: 'AI Image Generator',
    desc: 'Create images from text prompts with affordable model options.',
  },
  {
    href: '/ai-video-generator',
    title: 'AI Video Generator',
    desc: 'Generate short videos from detailed text prompts.',
  },
  {
    href: '/ai-music-generator',
    title: 'AI Music Generator',
    desc: 'Make royalty-free music from text descriptions.',
  },
  {
    href: '/speech-to-text',
    title: 'Speech to Text',
    desc: 'Transcribe audio to text with high accuracy.',
  },
  {
    href: '/text-to-speech',
    title: 'Text to Speech',
    desc: 'Generate natural-sounding voice audio from text.',
  },
]

export default function AIToolsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-10">
          <Link href="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">AI Tools</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-2">
            Public landing pages for each tool. Learn how they work, explore use cases, and try them.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              <h2 className="text-lg font-semibold">{tool.title}</h2>
              <p className="text-sm text-zinc-400 mt-2">{tool.desc}</p>
              <div className="text-xs text-zinc-500 mt-3">Read more</div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-xs text-zinc-500">
          Looking for technical details? Visit the{' '}
          <Link href="/systems/documentation" className="text-zinc-300 hover:text-white">
            documentation
          </Link>
          .
        </div>
      </div>
    </main>
  )
}
