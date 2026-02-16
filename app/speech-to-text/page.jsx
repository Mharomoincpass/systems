import Link from 'next/link'
import Script from 'next/script'

export const metadata = {
  title: 'Speech to Text',
  description: 'Convert audio to text with fast, accurate transcription.',
}

const siteUrl = 'https://mharomo.systems'

export default function SpeechToTextPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Script
        id="json-ld-stt"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Speech to Text',
            applicationCategory: 'AIApplication',
            operatingSystem: 'Web',
            description: 'Convert audio to text with fast, accurate transcription.',
            url: `${siteUrl}/speech-to-text`,
            creator: { '@type': 'Person', name: 'Mharomo' },
          }),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-10">
          <Link href="/ai-tools" className="text-xs text-zinc-400 hover:text-white transition-colors">
            Back to AI Tools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">What is Speech to Text?</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            Speech to text converts spoken audio into written text. It is useful for transcripts, captions,
            and searchable notes. This tool focuses on high accuracy with a simple upload-and-transcribe flow.
          </p>
        </div>

        <section className="space-y-4 text-sm sm:text-base text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">How it works</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Upload an audio file such as MP3, WAV, M4A, or FLAC.</li>
            <li>Start transcription and wait for the text output.</li>
            <li>Copy, edit, or export the final transcript.</li>
          </ul>
          <p>
            For best results, use clear recordings with minimal background noise. Long recordings can be split into
            smaller segments for faster processing and improved accuracy.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Use cases</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-zinc-300">
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Podcast transcripts</h3>
              <p className="mt-2">Turn audio episodes into readable text for SEO and accessibility.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Meeting notes</h3>
              <p className="mt-2">Capture and search key points from calls.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Research interviews</h3>
              <p className="mt-2">Quickly transcribe interviews for analysis.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white">Video captions</h3>
              <p className="mt-2">Create subtitles for recorded content.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Step-by-step example</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Upload a 10-minute MP3 recording.</li>
            <li>Start transcription and wait for the results.</li>
            <li>Copy the transcript into your notes or editor.</li>
          </ol>
        </section>

        <section className="mt-10 space-y-4 text-sm text-zinc-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Comparison to alternatives</h2>
          <p>
            Many transcription tools require complex setup or expensive plans. This tool is designed for quick,
            affordable transcription with a clean UI and fast turnaround.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">FAQ</h2>
          <div className="mt-4 space-y-4 text-sm text-zinc-300">
            <div>
              <h3 className="font-semibold text-white">Which formats are supported?</h3>
              <p className="mt-1">MP3, WAV, M4A, and FLAC are supported.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">How accurate is the transcription?</h3>
              <p className="mt-1">Accuracy is high for clear audio and standard speech.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Is there a file size limit?</h3>
              <p className="mt-1">Yes. Keep files under 50 MB for reliable processing.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Where can I learn more?</h3>
              <p className="mt-1">Check the documentation or blog for tips.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href="/api/tools/launch?path=/transcribe" className="px-5 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 ease-out">
            Try the tool
          </Link>
          <Link href="/blogs" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 ease-out">
            Read the blog
          </Link>
          <Link href="/systems/documentation/transcribe" className="px-5 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 ease-out">
            View documentation
          </Link>
        </section>
      </div>
    </main>
  )
}
