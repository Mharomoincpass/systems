'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const products = [
  {
    name: 'Grocliq GEO',
    category: 'SEO & Automation',
    images: ['/images/grocliq.png', '/images/grocliqq.png', '/images/grocliqqq.png', '/images/grocliqqqq.png'],
    desc: 'GEO monitoring platform with AI agents that automate the SEO process and track brand presence across search engines.',
    url: 'https://grocliq.ai/',
    color: 'from-zinc-800 to-black'
  },
  {
    name: 'OpenSignals.ai',
    category: 'Ad Intelligence',
    images: ['/images/opensignals.png', '/images/opensignalss.png'],
    desc: 'Competitor ad analysis platform with AI-powered video, image, and paid ads generation for market research.',
    url: 'https://opensignals.ai/',
    color: 'from-zinc-800 to-black'
  },
  {
    name: 'Incpass',
    category: 'Process Automation',
    images: ['/images/incpass.png', '/images/incpasss.png'],
    desc: 'Business process automation platform streamlining workflows, compliance, and operational efficiency.',
    url: 'https://incpass.co/',
    color: 'from-zinc-800 to-black'
  }
]

export default function Showcase() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const panels = gsap.utils.toArray('.project-panel')
    
    panels.forEach((panel: any, i) => {
      const images = gsap.utils.toArray('.project-img-card', panel)
      
      // Set initial states for all images
      gsap.set(images, { opacity: 0, scale: 0.9 })
      gsap.set(images[0] as gsap.TweenTarget, { opacity: 1, scale: 1 }) // First image visible
      
      // Create a timeline for this project's images
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "top top",
          end: `+=${images.length * 60}%`, // Reduced scroll distance
          scrub: 1,
          pin: true, 
          pinSpacing: true,
          anticipatePin: 1
        }
      })

      // Animate images one by one
      images.forEach((img: any, idx) => {
        if (idx === 0) return // Skip first (already visible)
        
        tl.to(images[idx - 1] as gsap.TweenTarget, 
          { opacity: 0, scale: 1.1, duration: 0.5 },
          "+=0.5"
        )
        .fromTo(img, 
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1 },
          "<"
        )
      })
    })
  }, { scope: container })

  return (
    <section ref={container} className="relative bg-black z-10 overflow-hidden">
      <div className="container mx-auto px-6 py-32">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Selected <span className="text-zinc-500">Works</span>
        </h2>
        <div className="w-full h-px bg-white/10 mt-8"></div>
      </div>

      <div className="w-full">
        {products.map((product, i) => (
          <div key={i} className="project-panel relative w-full h-screen flex items-center justify-center bg-black overflow-hidden">
            
            <div className={`grid lg:grid-cols-[1.5fr_1fr] gap-12 items-center w-full px-6 lg:px-12 max-w-[90vw] ${i % 2 === 1 ? 'lg:grid-cols-[1fr_1.5fr]' : ''}`}>
                
                {/* Image Container - Absolutely positioned images stack */}
              <div className={`relative w-full aspect-video ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                {product.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="project-img-card absolute inset-0 rounded-sm overflow-hidden border border-white/10"
                  >
                    <Image 
                      src={img} 
                      alt={`${product.name} screenshot ${idx + 1}`}
                      fill
                      className="object-contain bg-zinc-900/50"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  ))}
                </div>
                
                {/* Project Info */}
                <div className={`project-info ${i % 2 === 1 ? 'lg:order-1 lg:text-right' : ''}`}>
                  <div className="project-info-content space-y-8">
                    <span className="inline-block px-3 py-1 border border-white/20 text-white text-xs tracking-widest uppercase">
                      {product.category}
                    </span>
                    <h3 className="text-5xl md:text-7xl font-bold text-white">
                      {product.name}
                    </h3>
                    <p className="text-xl text-zinc-500 leading-relaxed">
                      {product.desc}
                    </p>
                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="group/btn relative inline-flex items-center gap-2 text-white font-semibold tracking-wide hover:text-zinc-300 transition-colors">
                      <span>Visit Website</span>
                      <span className="w-8 h-px bg-white group-hover/btn:w-12 transition-all"></span>
                    </a>
                  </div>
                </div>
                
              </div>
          </div>
        ))}
      </div>
    </section>
  )
}
