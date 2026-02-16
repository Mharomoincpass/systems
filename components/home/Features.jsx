'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TiltCard from '../TiltCard'

gsap.registerPlugin(ScrollTrigger)

const skills = [
  { category: 'Backend', items: ['Node.js', 'Python', 'CodeIgniter', 'Express.js']},
  { category: 'Frontend', items: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
  { category: 'Cloud & DevOps', items: ['AWS EC2', 'Google Cloud', 'Azure', 'Docker'] },
  { category: 'AI & Data', items: ['Vertex AI', 'Gemini', 'Hugging Face', 'NLP'] },
]

export default function Features() {
  const container = useRef(null)

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (reduceMotion || isMobile) return

    // Horizontal scroll for specific expertise cards or just a nice stagger
    const cards = gsap.utils.toArray('.feature-card');
    
    gsap.from(cards, {
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%",
      },
      y: 100,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      ease: "power4.out"
    })
  }, { scope: container })

  return (
    <section ref={container} className="relative py-32 bg-black overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
                Technical <span className="text-zinc-500">Arsenal</span>
            </h2>
             <div className="w-full h-px bg-white/10 mt-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill, idx) => (
            <TiltCard key={idx} className="feature-card">
              <div className="p-8 rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-white/20 transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-6">{skill.category}</h3>
                <div className="flex flex-wrap gap-3">
                  {skill.items.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
