'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAction = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      
      if (!response.ok) throw new Error('Failed to start session')
      
      window.location.href = '/systems'
    } catch (error) {
      console.error('Failed to start session:', error)
      setLoading(false)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-white/10'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 border border-white/20 flex items-center justify-center bg-black group-hover:bg-white transition-colors duration-500 overflow-hidden">
            <span className="relative z-10 text-white text-sm sm:text-lg font-bold group-hover:text-black transition-colors duration-500">M</span>
          </div>
          <span className="text-white font-bold text-sm sm:text-xl tracking-tight">
            Mharomo<span className="text-zinc-600 text-xs sm:text-sm">.systems</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/blogs"
            className="text-xs sm:text-sm text-zinc-300 hover:text-white transition-colors"
          >
            Blogs
          </Link>
          <button 
            onClick={handleAction}
            disabled={loading}
            className="group relative flex items-center gap-2 px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white transition-all duration-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-white group-hover:text-black text-xs sm:text-sm font-medium transition-colors duration-500 whitespace-nowrap">
              {loading ? 'Starting...' : 'Check Systems'}
            </span>
            {!loading && (
              <svg 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-black transition-all duration-500 group-hover:translate-x-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
