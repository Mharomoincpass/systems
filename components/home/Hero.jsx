'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const [loading, setLoading] = useState(false)
  const container = useRef(null)
  const textRef = useRef(null)
  const bgRef = useRef(null)

  const handleStartSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      
      if (!response.ok) {
        throw new Error('Failed to start session')
      }
      
      window.location.href = '/systems'
    } catch (error) {
      console.error('Failed to start session:', error)
      setLoading(false)
    }
  }

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const tl = gsap.timeline()

    // Background reveal - adjusted for mobile
    tl.fromTo(bgRef.current,
      { scale: isMobile ? 1.1 : 1.2, opacity: 0 },
      { scale: 1, opacity: 1, duration: isMobile ? 1.5 : 2, ease: "power3.out" }
    )

    // Text stagger reveal - reduced animation on mobile
    .fromTo(".hero-text-line",
      { y: isMobile ? 50 : 100, opacity: 0, rotateX: isMobile ? 0 : -20 },
      { y: 0, opacity: 1, rotateX: 0, duration: isMobile ? 1 : 1.2, stagger: 0.1, ease: "power4.out" },
      "-=1.5"
    )
    
    // Subtitle reveal
    .fromTo(".hero-subtitle",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
      "-=0.8"
    )

    // Parallax effect on scroll - reduced intensity on mobile
    ScrollTrigger.create({
      trigger: container.current,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        const parallaxIntensity = isMobile ? 0.5 : 1
        gsap.to(textRef.current, {
          y: self.progress * 200 * parallaxIntensity,
          opacity: 1 - self.progress,
          overwrite: true
        })
        gsap.to(bgRef.current, {
          y: self.progress * 100 * parallaxIntensity,
          scale: 1 + self.progress * 0.1 * parallaxIntensity,
          overwrite: true
        })
      }
    })
  }, { scope: container })

  return (
    <section ref={container} className="relative h-screen flex items-center justify-center overflow-hidden z-0 bg-black">
      {/* Dynamic Background */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/20 to-black z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.03),transparent_50%)]" />
        
        {/* Animated grid/mesh illusion */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      </div>

      <div ref={textRef} className="relative z-20 text-center px-4 sm:px-6 max-w-7xl mx-auto mix-blend-difference">
        <div className="overflow-hidden mb-2 mt-6">
          <h1 className="hero-text-line text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white">
            Free AI Tools
          </h1>
        </div>
        <div className="overflow-hidden mb-6 sm:mb-8">
          <h1 className="hero-text-line text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-zinc-500">
            for Chat, Images, Video, Music and Voice
          </h1>
        </div>

        <div className="hero-subtitle max-w-3xl mx-auto mt-6 sm:mt-8 backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-xl border border-white/10">
          <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 font-light tracking-wide">
            Generate images, videos, music, voice, and text using multiple AI models in one place.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleStartSession}
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Try AI Tools'}
            </button>
            <Link
              href="#projects"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white hover:text-black transition"
            >
              View Projects
            </Link>
            <Link
              href="/author"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white hover:text-black transition"
            >
              About Me
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 flex justify-center gap-6">
            <div className="h-px w-12 bg-white/20"></div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-semibold">Scroll to Explore</p>
            <div className="h-px w-12 bg-white/20"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
