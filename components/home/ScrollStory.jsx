'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollStory() {
  const container = useRef(null)
  const storyRef = useRef(null)

  useGSAP(() => {
    const sections = gsap.utils.toArray('.story-section')
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: "+=300%", // Scroll distance
        scrub: 1,
        pin: true,
        snap: 1 / (sections.length - 1)
      }
    })

    sections.forEach((section, i) => {
        if (i === 0) return // Skip first section
        
        tl.fromTo(section, 
            { opacity: 0, scale: 0.8, z: -100 },
            { opacity: 1, scale: 1, z: 0, duration: 1, ease: "power2.inOut" }
        )
        // Fade out previous
        .to(sections[i-1], 
            { opacity: 0, scale: 1.2, filter: "blur(10px)", duration: 0.5 }, 
            "<"
        )
    })

  }, { scope: container })

  return (
    <section ref={container} className="relative h-screen bg-black overflow-hidden text-white perspective-1000">
      <div ref={storyRef} className="relative w-full h-full flex items-center justify-center">
        
        {/* Section 1 */}
        <div className="story-section absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-100">
            <h2 className="text-6xl md:text-8xl font-bold text-white mb-6">
                Backend
            </h2>
            <p className="text-2xl md:text-3xl text-zinc-500 max-w-3xl">
                Scaling systems with <span className="text-white">Node.js</span>, <span className="text-white">Python</span>, & <span className="text-white">Cloud</span>.
            </p>
        </div>

        {/* Section 2 */}
        <div className="story-section absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-0 translate-z-[-100px]">
            <h2 className="text-6xl md:text-8xl font-bold text-white mb-6">
                Frontend
            </h2>
            <p className="text-2xl md:text-3xl text-zinc-500 max-w-3xl">
                Building stunning UIs with <span className="text-white">React</span>, <span className="text-white">Next.js</span>, & <span className="text-white">Tailwind</span>.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 opacity-50">
                <div className="border border-white/10 p-4 rounded bg-white/5 text-zinc-400">React.js</div>
                <div className="border border-white/10 p-4 rounded bg-white/5 text-zinc-400">Next.js</div>
            </div>
        </div>

        {/* Section 3 */}
        <div className="story-section absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-0 translate-z-[-100px]">
             <h2 className="text-6xl md:text-8xl font-bold text-white mb-6">
                AI/ML
            </h2>
             <p className="text-2xl md:text-3xl text-zinc-500 max-w-3xl">
                Integrating <span className="text-white">Vertex AI</span>, <span className="text-white">Embeddings</span>, & <span className="text-white">NLP</span>.
            </p>
             <div className="mt-8 text-xl font-mono text-zinc-500">
                &lt;Intelligent Systems /&gt;
            </div>
        </div>

      </div>
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  )
}
