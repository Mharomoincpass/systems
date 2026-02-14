'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const container = useRef(null)
  const textRef = useRef(null)
  const bgRef = useRef(null)

  useGSAP(() => {
    const tl = gsap.timeline()

    // Background reveal
    tl.fromTo(bgRef.current,
      { scale: 1.2, opacity: 0 },
      { scale: 1, opacity: 1, duration: 2, ease: "power3.out" }
    )

    // Text stagger reveal
    .fromTo(".hero-text-line",
      { y: 100, opacity: 0, rotateX: -20 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.1, ease: "power4.out" },
      "-=1.5"
    )
    
    // Subtitle reveal
    .fromTo(".hero-subtitle",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
      "-=0.8"
    )

    // Parallax effect on scroll
    ScrollTrigger.create({
      trigger: container.current,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        gsap.to(textRef.current, {
          y: self.progress * 200,
          opacity: 1 - self.progress,
          overwrite: true
        })
        gsap.to(bgRef.current, {
          y: self.progress * 100,
          scale: 1 + self.progress * 0.1,
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

      <div ref={textRef} className="relative z-20 text-center px-6 max-w-7xl mx-auto mix-blend-difference">
        <div className="overflow-hidden mb-2">
          <h1 className="hero-text-line text-7xl md:text-9xl font-black tracking-tighter text-white">
            SOFTWARE
          </h1>
        </div>
        <div className="overflow-hidden mb-6">
          <h1 className="hero-text-line text-7xl md:text-9xl font-black tracking-tighter text-zinc-500">
            DEVELOPER
          </h1>
        </div>
        
        <div className="hero-subtitle max-w-2xl mx-auto mt-8 backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-xl md:text-2xl text-zinc-400 font-light tracking-wide">
            Crafting <span className="text-white font-medium">elegant solutions</span> to <span className="text-zinc-300 font-medium">complex problems</span>
          </p>
          <div className="mt-8 flex justify-center gap-6">
            <div className="h-px w-12 bg-white/20"></div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-semibold">Scroll to Explore</p>
            <div className="h-px w-12 bg-white/20"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
