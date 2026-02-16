'use client'

import { useRouter } from 'next/navigation'
import Script from 'next/script'

export default function SLMDocPage() {
  const router = useRouter()

  return (
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-DEN9D68RFH"
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DEN9D68RFH');
          `,
        }}
      />
      <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Documentation
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">SLM Chat</h1>
          <p className="text-lg text-gray-600">Multi-agent AI assistant for conversation, coding, analysis, and creative tasks</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div><div className="text-sm font-medium text-gray-600">Agents</div><div className="text-2xl font-bold text-gray-900">6</div></div>
          <div><div className="text-sm font-medium text-gray-600">Cost</div><div className="text-2xl font-bold text-gray-900">Free</div></div>
          <div><div className="text-sm font-medium text-gray-600">Speed</div><div className="text-2xl font-bold text-gray-900">Instant</div></div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            SLM Chat provides access to multiple specialized AI agents optimized for different tasks. Each agent is pre-configured for specific use cases, from general conversation to technical assistance and creative work. All responses are instant and unlimited.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Agents</h2>
          <div className="space-y-4">
            {[
              { name: 'General Chat', desc: 'Conversation, answering questions, brainstorming' },
              { name: 'Code Assistant', desc: 'Programming help, debugging, code review' },
              { name: 'Research Agent', desc: 'Information synthesis, analysis, summaries' },
              { name: 'Creative Writer', desc: 'Content creation, storytelling, copywriting' },
              { name: 'Math Tutor', desc: 'Problem solving, equations, mathematical concepts' },
              { name: 'Technical Explainer', desc: 'Complex concepts explained simply' },
            ].map((agent, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{agent.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Features</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Unlimited Conversations:</strong> No limits on message count or conversation length</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Real-time Responses:</strong> Instant replies with no queue delays</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Multi-turn Context:</strong> Agents maintain conversation history</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Session Persistence:</strong> Your conversations are saved per session</span></li>
            <li className="flex gap-3"><span className="text-blue-600 font-bold">✓</span><span><strong>Code Formatting:</strong> Syntax highlighting for programming assistance</span></li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Learning & Education</h3><p className="text-sm text-gray-600">Get explanations of complex topics, solve math problems, understand coding concepts</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Development</h3><p className="text-sm text-gray-600">Debug code, review implementations, get programming assistance in any language</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Content Creation</h3><p className="text-sm text-gray-600">Brainstorm ideas, write content, edit and improve your writing</p></div>
            <div className="p-4 border border-gray-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">Research & Analysis</h3><p className="text-sm text-gray-600">Analyze information, synthesize data, explain complex systems</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Best Practices</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">📝 Be Specific</h3><p className="text-sm text-gray-700">Detailed prompts with context produce better results. Include what you&apos;re trying to achieve.</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">🔄 Use Context</h3><p className="text-sm text-gray-700">Reference previous messages and build on earlier answers for coherent conversations.</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">✏️ Iterate</h3><p className="text-sm text-gray-700">Ask follow-ups, request clarifications, or ask for different perspectives.</p></div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><h3 className="font-semibold text-gray-900 mb-2">🎯 Set Constraints</h3><p className="text-sm text-gray-700">Specify format (code, bullet points, essay), length, or tone in your request.</p></div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Limitations</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Knowledge cutoff: Information up to April 2024</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>No real-time information or internet access</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Session context is limited to current session only</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>May occasionally provide inaccurate information</span></li>
            <li className="flex gap-3"><span className="text-gray-400">•</span><span>Not suitable for financial, legal, or medical advice</span></li>
          </ul>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Chat?</h2>
          <p className="text-gray-700 mb-6">Start a conversation with one of our AI agents now.</p>
          <button onClick={() => router.push('/SLM')} className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            Launch SLM Chat
          </button>
        </section>
      </div>
    </div>
    </>
  )
}
