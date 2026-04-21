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
    window.location.href = '/dashboard'
  }

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const isLowPower =
      (typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory <= 4)
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

    if (!isMobile && !isLowPower) {
      const setTextY = gsap.quickSetter(textRef.current, 'y', 'px')
      const setBgY = gsap.quickSetter(bgRef.current, 'y', 'px')

      ScrollTrigger.create({
        trigger: container.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = self.progress
          setTextY(progress * 60)
          setBgY(progress * 30)
        },
      })
    }

  }, { scope: container })

  return (
    <section ref={container} className="relative min-h-screen flex items-center justify-center overflow-x-hidden z-0 bg-background pt-20 sm:pt-24 pb-6 sm:pb-8">
      {/* Dynamic Background */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/20 to-black z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.03),transparent_50%)]" />
        
        {/* Animated grid/mesh illusion */}
        <div className="absolute inset-0 opacity-10 bg-noise"></div>
      </div>

      <div ref={textRef} className="relative z-20 text-center px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="overflow-hidden mb-4 sm:mb-6">
          <h1 className="hero-text-line text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl font-black tracking-tighter text-foreground leading-[0.95]">
            One AI Chatbot <span className="block text-muted-foreground mt-2 sm:mt-3 text-[0.88em]">for Chat, Code, Images, Video, Music & Voice</span>
          </h1>
        </div>

        <div className="hero-subtitle max-w-4xl mx-auto mt-4 sm:mt-6 backdrop-blur-sm bg-muted/50 p-5 sm:p-6 rounded-xl border border-border">
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-light tracking-wide mb-5 sm:mb-6">
            This AI chatbot is your all-in-one teammate. Ask anything in plain language, switch between top models, generate visuals, create music, transcribe recordings, and produce natural voice output without juggling separate apps.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleStartSession}
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Chatting'}
            </button>
            <Link
              href="#projects"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-white hover:text-black transition"
            >
              View Projects
            </Link>
            <Link
              href="/systems/documentation"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-white hover:text-black transition"
            >
              How It Works
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 flex justify-center gap-6">
            <div className="h-px w-12 bg-white/20"></div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">Scroll to Explore</p>
            <div className="h-px w-12 bg-white/20"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
