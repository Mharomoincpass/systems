'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-white/10'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 border border-white/20 flex items-center justify-center bg-black group-hover:bg-white transition-colors duration-500 overflow-hidden">
            <span className="relative z-10 text-white font-bold text-lg group-hover:text-black transition-colors duration-500">M</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Mharomo<span className="text-zinc-600 text-sm">.systems</span>
          </span>
        </Link>
      </div>
    </nav>
  )
}
