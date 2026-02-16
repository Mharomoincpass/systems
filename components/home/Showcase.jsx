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
  const container = useRef(null)

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const panels = gsap.utils.toArray('.project-panel')
    
    panels.forEach((panel, i) => {
      const images = gsap.utils.toArray('.project-img-card', panel)
      
      // Set initial states for all images
      gsap.set(images, { opacity: 0, scale: 0.9 })
      gsap.set(images[0], { opacity: 1, scale: 1 }) // First image visible
      
      // On mobile, only animate the first image if there are multiple
      if (isMobile && images.length > 1) {
        // Simple fade-in animation for mobile
        gsap.from(images[0], {
          scrollTrigger: {
            trigger: panel,
            start: "top 80%",
          },
          opacity: 0,
          scale: 0.95,
          duration: 0.8,
          ease: "power2.out"
        })
      } else if (!isMobile) {
        // Full animation for desktop
        const scrollDistance = images.length * 60
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: "top top",
            end: `+=${scrollDistance}%`,
            scrub: 1,
            pin: true, 
            pinSpacing: true,
            anticipatePin: 1
          }
        })

        // Animate images one by one
        images.forEach((img, idx) => {
          if (idx === 0) return // Skip first (already visible)
          
          tl.to(images[idx - 1], 
            { opacity: 0, scale: 1.1, duration: 0.5 },
            "+=0.5"
          )
          .fromTo(img, 
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 1 },
            "<"
          )
        })
      }
    })
  }, { scope: container })

  return (
    <section ref={container} className="relative bg-black z-10 overflow-hidden">
      <div className="container mx-auto px-6 py-32">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Top <span className="text-zinc-500">Projects by yours truly</span>
        </h2>
        <div className="w-full h-px bg-white/10 mt-8"></div>
      </div>

      <div className="w-full">
        {products.map((product, i) => (
          <div key={i} className="project-panel relative w-full min-h-[70vh] md:h-screen flex items-center justify-center bg-black overflow-hidden">
            
            <div className={`grid lg:grid-cols-[1.5fr_1fr] gap-12 items-center w-full px-6 lg:px-12 max-w-[90vw] ${i % 2 === 1 ? 'lg:grid-cols-[1fr_1.5fr]' : ''}`}>
                
                {/* Image Container - Absolutely positioned images stack */}
              <div className={`relative w-full aspect-video ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                {product.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`project-img-card absolute inset-0 rounded-lg overflow-hidden border border-white/10${idx === 0 ? '' : ' hidden md:block'}`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - ${idx}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Text Content */}
              <div className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">
                  {product.name}
                </h3>
                <p className="text-sm uppercase tracking-widest text-zinc-500 mb-6">
                  {product.category}
                </p>
                <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                  {product.desc}
                </p>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  View Project →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
