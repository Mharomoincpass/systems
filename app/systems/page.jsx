'use client'

import { useEffect, useState, useRef } from 'react'

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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Applications</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-lg p-4 sm:p-6 hover:border-indigo-400/50 transition">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">App 1</h2>
            <p className="text-sm sm:text-base text-gray-300">Coming soon</p>
          </div>
        </div>

        {/* Activity indicator */}
        <div className="mt-8 text-xs text-gray-500">
          <p>🟢 Session active · Tracking: Mouse, Scroll, Touch, Keyboard</p>
        </div>
      </div>
    </div>
  )
}

