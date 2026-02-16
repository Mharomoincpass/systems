import Link from 'next/link'
import Script from 'next/script'

export const metadata = {
  title: 'AI Image Generator',
  description: 'Generate images from text prompts with affordable AI models and flexible sizes.',
}

const siteUrl = 'https://mharomo.systems'

export default function AIImageGeneratorPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Script
        id="json-ld-image"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'AI Image Generator',
            applicationCategory: 'AIApplication',
            operatingSystem: 'Web',
            description: 'Generate images from text prompts with affordable AI models and flexible sizes.',
            url: `${siteUrl}/ai-image-generator`,
            creator: { '@type': 'Person', name: 'Mharomo' },
          }),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-10">
          <Link href="/ai-tools" className="text-xs text-zinc-400 hover:text-white transition-colors">
            Back to AI Tools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">What is an AI Image Generator?</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            An AI image generator turns text prompts into images. You describe what you want, and the model creates a
            visual interpretation. This tool focuses on affordable models so you can iterate quickly without wasting
            budget, while still supporting higher-quality options when you need detail.
          </p>
        </div>

        <section className="space-y-4 text-sm sm:text-base text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">How it works</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Write a prompt describing the scene, style, and mood.</li>
            <li>Choose a model based on speed and quality needs.</li>
            <li>Pick a size like 512x512, 768x768, or 1024x1024.</li>
            <li>Generate and refine with small prompt edits.</li>
          </ul>
          <p>
            The image generator supports multiple models with different strengths. Flux and Z-Image are fast and great
            for rapid testing. Klein models provide balanced results. Imagen 4 is stronger on fine detail. GPT Image 1
            Mini follows prompts closely for structured results.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Use cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-zinc-300">
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Marketing visuals</h3>
              <p className="mt-2">Create thumbnails, ads, and social assets.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Concept art</h3>
              <p className="mt-2">Explore scenes, characters, and mood boards.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Product mockups</h3>
              <p className="mt-2">Generate product imagery for landing pages.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Content illustrations</h3>
              <p className="mt-2">Add custom visuals to articles and blogs.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Step-by-step example</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Prompt: &quot;Minimalist coffee shop interior, warm lighting, cinematic&quot;.</li>
            <li>Select Flux Schnell for speed.</li>
            <li>Generate, then refine: add &quot;wood textures&quot; and &quot;rainy window&quot;.</li>
            <li>Switch to Imagen 4 for higher detail.</li>
          </ol>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Comparison to alternatives</h2>
          <p>
            Many image tools offer a single model and fixed settings. This generator lets you choose the best model
            for each task and control output size. It is designed for fast iteration and predictable results.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">FAQ</h2>
          <div className="mt-4 space-y-4 text-sm text-zinc-300">
            <div>
              <h3 className="font-semibold text-white">Which model should I start with?</h3>
              <p className="mt-1">Start with Flux Schnell or Z-Image for quick drafts.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Can I control image size?</h3>
              <p className="mt-1">Yes. Choose from preset sizes or custom dimensions.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Are the images royalty free?</h3>
              <p className="mt-1">Yes. You can use the generated images commercially.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Where can I learn prompt tips?</h3>
              <p className="mt-1">Read the documentation or related blog posts.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href="/api/tools/launch?path=/images" className="px-5 py-2 rounded-lg bg-white text-black text-sm font-semibold">
            Try the tool
          </Link>
          <Link href="/blogs" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold">
            Read the blog
          </Link>
          <Link href="/systems/documentation/images" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold">
            View documentation
          </Link>
        </section>
      </div>
    </main>
  )
}
