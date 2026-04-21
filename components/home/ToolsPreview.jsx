import Link from 'next/link'

const tools = [
  {
    title: 'AI Chat (MCM)',
    description: 'Chat with multiple top models in one thread and get smarter, side-by-side answers.',
    href: '/ai-tools/mcm',
  },
  {
    title: 'Image Generator',
    description: 'Turn chat prompts into polished images, concept art, and thumbnails in seconds.',
    href: '/ai-image-generator',
  },
  {
    title: 'Video Generator',
    description: 'Generate short videos for product demos, social clips, and creative storytelling.',
    href: '/ai-video-generator',
  },
  {
    title: 'Music Generator',
    description: 'Create original background tracks and audio moods directly from your instructions.',
    href: '/ai-music-generator',
  },
  {
    title: 'Text to Speech',
    description: 'Convert scripts into natural voiceovers for demos, reels, and tutorials.',
    href: '/text-to-speech',
  },
  {
    title: 'Speech to Text',
    description: 'Transcribe meetings, interviews, and notes into searchable text fast.',
    href: '/speech-to-text',
  },
]

export default function ToolsPreview() {
  return (
    <section className="relative bg-background py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-5xl font-black text-foreground">
            Chat-First <span className="text-muted-foreground">AI Suite</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Start with a conversation and branch into images, video, music, and voice from the same workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.title} className="p-6 rounded-xl border border-border bg-muted/50">
              <h3 className="text-xl font-semibold text-foreground">{tool.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{tool.description}</p>
              <Link
                href={tool.href}
                className="inline-flex items-center mt-4 text-sm font-semibold text-foreground hover:text-foreground"
              >
                Try now →
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-20 max-w-4xl mx-auto space-y-8 text-muted-foreground leading-relaxed border-t border-border pt-16">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Why Use This AI Chatbot?</h3>
            <p>
              Most AI platforms make you jump between separate products. This chatbot keeps everything in one conversation. You can brainstorm, generate assets, and ship outputs without breaking context. Ask once, iterate quickly, and produce text, visuals, and audio in a single continuous workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium text-foreground mb-2">For Content Creators</h4>
              <p className="text-sm">
                Build full content pipelines faster: draft scripts in chat, generate thumbnails, create voiceovers, and produce short videos from one prompt thread. Keep your tone, style, and context consistent from idea to publish.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-foreground mb-2">For Developers & Business</h4>
              <p className="text-sm">
                Speed up delivery with a practical AI copilot: analyze requirements, generate code and docs, transcribe calls into action items, and create launch assets for marketing. One chatbot handles both technical and creative tasks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
