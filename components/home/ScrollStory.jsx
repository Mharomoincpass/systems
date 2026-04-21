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
    <section ref={container} className="relative bg-background overflow-hidden text-foreground py-20 sm:py-24 border-t border-border border-b border-border">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-3">
        <div className="story-card rounded-xl border border-border bg-muted/50 p-6 sm:p-8 text-center transition-transform duration-300 hover:-translate-y-1">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Backend</h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Scaling systems with <span className="text-foreground">Node.js</span>, <span className="text-foreground">Python</span>, and <span className="text-foreground">Cloud</span>.
          </p>
        </div>

        <div className="story-card rounded-xl border border-border bg-muted/50 p-6 sm:p-8 text-center transition-transform duration-300 hover:-translate-y-1">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Frontend</h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Building stunning UIs with <span className="text-foreground">React</span>, <span className="text-foreground">Next.js</span>, and <span className="text-foreground">Tailwind</span>.
          </p>
        </div>

        <div className="story-card rounded-xl border border-border bg-muted/50 p-6 sm:p-8 text-center transition-transform duration-300 hover:-translate-y-1">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">AI/ML</h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Integrating <span className="text-foreground">Vertex AI</span>, <span className="text-foreground">Embeddings</span>, and <span className="text-foreground">NLP</span>.
          </p>
        </div>
      </div>
    </section>
  )
}
