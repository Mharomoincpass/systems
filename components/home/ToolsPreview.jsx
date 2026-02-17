import Link from 'next/link'

const tools = [
  {
    title: 'AI Chat (MCM)',
    description: 'Compare multiple AI models in one chat for better answers.',
    href: '/ai-tools/mcm',
  },
  {
    title: 'Image Generator',
    description: 'Create images from text prompts with fast, affordable models.',
    href: '/ai-image-generator',
  },
  {
    title: 'Video Generator',
    description: 'Turn prompts into short videos for social and marketing.',
    href: '/ai-video-generator',
  },
  {
    title: 'Music Generator',
    description: 'Generate royalty-free music from simple descriptions.',
    href: '/ai-music-generator',
  },
  {
    title: 'Text to Speech',
    description: 'Create natural voice audio from written text.',
    href: '/text-to-speech',
  },
  {
    title: 'Speech to Text',
    description: 'Transcribe audio into accurate, searchable text.',
    href: '/speech-to-text',
  },
]

export default function ToolsPreview() {
  return (
    <section className="relative bg-black py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Free <span className="text-zinc-500">AI Tools</span>
          </h2>
          <p className="text-zinc-400 mt-3 max-w-2xl">
            Instant access to multi-modal tools for chat, images, video, music, and voice.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.title} className="p-6 rounded-xl border border-white/10 bg-white/5">
              <h3 className="text-xl font-semibold text-white">{tool.title}</h3>
              <p className="text-sm text-zinc-400 mt-2">{tool.description}</p>
              <Link
                href={tool.href}
                className="inline-flex items-center mt-4 text-sm font-semibold text-white hover:text-zinc-300"
              >
                Try now →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
