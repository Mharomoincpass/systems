'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const tools = [
  { label: 'Chat', href: '/dashboard/chat', desc: 'AI conversation' },
  { label: 'Images', href: '/dashboard/images', desc: 'Generate images' },
  { label: 'Videos', href: '/dashboard/videos', desc: 'Generate videos' },
  { label: 'Music', href: '/dashboard/music', desc: 'Generate music' },
  { label: 'Text to Speech', href: '/dashboard/tts', desc: 'Convert text to audio' },
  { label: 'Transcribe', href: '/dashboard/transcribe', desc: 'Audio to text' },
]

export default function DashboardOverview() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">Dashboard</h1>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Images', value: stats?.images ?? '—' },
          { label: 'Videos', value: stats?.videos ?? '—' },
          { label: 'Audio', value: stats?.audio ?? '—' },
          { label: 'Library', value: stats?.total ?? '—' },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className="text-xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tools grid */}
      <h2 className="text-sm font-medium text-zinc-400 mb-3">Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 group"
          >
            <h3 className="text-sm font-medium text-white group-hover:text-white mb-1">
              {tool.label}
            </h3>
            <p className="text-xs text-zinc-500">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
