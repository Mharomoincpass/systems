'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DocumentationPage() {
  const router = useRouter()

  const agents = [
    { id: 'slm', name: 'SLM Chat', desc: 'Conversational AI assistant', path: '/agents/documentation/slm' },
    { id: 'images', name: 'Image Generation', desc: 'Text-to-image with multiple models', path: '/agents/documentation/images' },
    { id: 'videos', name: 'Video Generation', desc: 'AI-powered video creation', path: '/agents/documentation/videos' },
    { id: 'music', name: 'Music Generation', desc: 'Royalty-free music from text', path: '/agents/documentation/music' },
    { id: 'transcribe', name: 'Transcription', desc: 'Speech-to-text conversion', path: '/agents/documentation/transcribe' },
    { id: 'tts', name: 'Text-to-Speech', desc: 'Natural voice synthesis', path: '/agents/documentation/tts' },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Agents
        </button>

        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Documentation</h1>
          <p className="text-sm text-gray-500">Reference guides for each agent — features, usage, and best practices.</p>
        </div>

        <div className="space-y-1">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={agent.path}
              className="group flex items-center justify-between p-3 sm:p-4 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div>
                <h2 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{agent.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{agent.desc}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <div className="mt-10 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Getting Started</h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Select an agent from the <Link href="/agents" className="text-blue-600 hover:underline">/agents</Link> page to begin</li>
            <li>• Check your credit balance before generating content</li>
            <li>• Each model has different cost and performance trade-offs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
