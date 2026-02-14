'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

export default function SystemsPage() {
  const [sessionToken, setSessionToken] = useState(null)
  const [lastActivityTime, setLastActivityTime] = useState(Date.now())
  const activityTimeoutRef = useRef(null)

  useEffect(() => {
    // Get token from cookie
    const cookies = document.cookie.split('; ')
    const token = cookies.find(c => c.startsWith('sessionToken='))?.split('=')[1]
    setSessionToken(token)

    if (!token) return

    // Debounced activity handler
    const handleActivity = () => {
      const now = Date.now()
      setLastActivityTime(now)

      // Clear existing timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }

      // Ping server after 2 seconds of inactivity
      activityTimeoutRef.current = setTimeout(() => {
        pingSession(token)
        console.log('📍 Activity detected - Session pinged')
      }, 2000)
    }

    // Track various user interactions
    const events = ['mousemove', 'scroll', 'click', 'keydown', 'touchstart', 'touchmove']

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Initial ping
    pingSession(token)

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }
    }
  }, [])

  const pingSession = async (token) => {
    try {
      const response = await fetch('/api/session/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: token }),
      })

      if (response.ok) {
        console.log('✅ Session activity updated')
      }
    } catch (error) {
      console.error('Failed to ping session:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white p-4 sm:p-6 md:p-8">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 tracking-tight">Applications</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link href="/SLM" className="group relative overflow-hidden bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 hover:border-indigo-400/50 transition-all duration-300 hover:scale-[1.02] block backdrop-blur-sm shadow-lg hover:shadow-indigo-500/20">
            {/* Gradient glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 blur transition duration-300"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white group-hover:text-indigo-200 transition-colors">SLM Chat</h2>
              <p className="text-sm sm:text-base text-gray-300 group-hover:text-gray-200 transition-colors">Open application</p>
              
              <div className="mt-4 flex items-center text-indigo-400 text-sm font-medium group-hover:gap-2 transition-all">
                <span>Launch</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Activity indicator */}
        <div className="mt-8 text-xs text-gray-500 flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 w-fit">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <p>Session active</p>
        </div>
      </div>
    </div>
  )
}

