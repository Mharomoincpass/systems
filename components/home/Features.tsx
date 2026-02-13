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
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, i) => (
            <TiltCard key={i} className="feature-card h-full">
              <div className="h-full p-8 rounded-sm bg-black border border-white/10 hover:border-white transition-colors duration-500 group">
                <div className="w-12 h-12 border border-white/20 mb-6 flex items-center justify-center text-white font-mono text-xl group-hover:bg-white group-hover:text-black transition-all">
                    0{i + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">{skill.category}</h3>
                <ul className="space-y-4">
                    {skill.items.map((item, j) => (
                        <li key={j} className="text-zinc-500 flex items-center gap-3 group-hover:text-white transition-colors">
                            <span className="w-1 h-1 rounded-full bg-zinc-500 group-hover:bg-white transition-colors"></span>
                            {item}
                        </li>
                    ))}
                </ul>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
