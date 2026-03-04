'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollStory() {
  const container = useRef(null)

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    gsap.from('.story-card', {
      scrollTrigger: {
        trigger: container.current,
        start: 'top 80%',
        once: true,
      },
      y: 32,
      opacity: 0,
      stagger: 0.12,
      duration: 0.7,
      ease: 'power2.out',
    })
  }, { scope: container })

  return (
    <section ref={container} className="relative bg-black overflow-hidden text-white py-20 sm:py-24 border-t border-white/10 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-3">
        <div className="story-card rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8 text-center transition-transform duration-300 hover:-translate-y-1">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Backend</h2>
          <p className="text-base sm:text-lg text-zinc-400">
            Scaling systems with <span className="text-white">Node.js</span>, <span className="text-white">Python</span>, and <span className="text-white">Cloud</span>.
          </p>
        </div>

        <div className="story-card rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8 text-center transition-transform duration-300 hover:-translate-y-1">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frontend</h2>
          <p className="text-base sm:text-lg text-zinc-400">
            Building stunning UIs with <span className="text-white">React</span>, <span className="text-white">Next.js</span>, and <span className="text-white">Tailwind</span>.
          </p>
        </div>

        <div className="story-card rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8 text-center transition-transform duration-300 hover:-translate-y-1">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">AI/ML</h2>
          <p className="text-base sm:text-lg text-zinc-400">
            Integrating <span className="text-white">Vertex AI</span>, <span className="text-white">Embeddings</span>, and <span className="text-white">NLP</span>.
          </p>
        </div>
      </div>
    </section>
  )
}
