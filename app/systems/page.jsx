'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import CreditsDisplay from '@/components/CreditsDisplay'

export default function SystemsPage() {
  const activityTimeoutRef = useRef(null)
  const lastActivityRef = useRef(0)

  useEffect(() => {
    const handleActivity = () => {
      const now = Date.now()
      if (now - lastActivityRef.current < 300) return
      lastActivityRef.current = now
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current)
      activityTimeoutRef.current = setTimeout(() => {
        pingSession()
      }, 2000)
    }

    const events = ['mousemove', 'scroll', 'click', 'keydown', 'touchstart', 'touchmove']
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }))
    pingSession()

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity))
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current)
    }
  }, [])

  const pingSession = async () => {
    try {
      await fetch('/api/session/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Failed to ping session:', error)
    }
  }

  const systems = [
    { href: '/MCM', name: 'Multi Chat Models', desc: 'AI assistant', icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    )},
    { href: '/images', name: 'Images', desc: 'Image generation', icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    )},
    { href: '/videos', name: 'Videos', desc: 'Video generation', icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </>
    )},
    { href: '/music', name: 'Music', desc: 'Music generation', icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    )},
    { href: '/transcribe', name: 'Transcribe', desc: 'Speech to text', icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    )},
    { href: '/tts', name: 'Text-to-Speech', desc: 'Voice synthesis', icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    )},
  ]

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
      <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] sm:opacity-[0.03] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white/90">Systems</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-[11px] text-gray-500">Session active</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/systems/documentation" className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors">
              Docs
            </Link>
            <span className="text-gray-700">|</span>
            <CreditsDisplay />
          </div>
        </div>

        {/* Systems Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {systems.map((system) => (
            <Link
              key={system.href}
              href={system.href}
              className="group flex flex-col justify-between p-3 sm:p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
            >
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {system.icon}
                  </svg>
                </div>
                <h2 className="text-[13px] sm:text-sm font-medium text-white/80 mb-0.5">{system.name}</h2>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-snug">{system.desc}</p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-600 group-hover:text-gray-400 transition-colors">
                <span>Open</span>
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

