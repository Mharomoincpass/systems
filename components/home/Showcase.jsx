'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const products = [
  {
    name: 'Multi Chat Models',
    category: 'AI Assistant',
    images: ['/images/grocliq.png'],
    desc: 'Multi-model chat assistant for fast, accurate answers and workflows. Chat with multiple AI models simultaneously for the best results.',
    url: '/ai-tools/mcm',
    color: 'from-zinc-800 to-black'
  },
  {
    name: 'AI Image Generator',
    category: 'Visual Creation',
    images: ['/images/opensignals.png'],
    desc: 'Create stunning images from text prompts with affordable AI models. Generate professional-quality visuals in seconds.',
    url: '/ai-image-generator',
    color: 'from-zinc-800 to-black'
  },
  {
    name: 'AI Video Generator',
    category: 'Video Creation',
    images: ['/images/incpass.png'],
    desc: 'Generate short videos from detailed text prompts. Create engaging video content for social media, marketing, and more.',
    url: '/ai-video-generator',
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
      
      // Full animation for all devices - adjusted parameters for mobile
      const scrollDistance = isMobile ? images.length * 40 : images.length * 60
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: isMobile ? "top 15%" : "top top", // Pin a bit lower on mobile
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
    })
  }, { scope: container })

  return (
    <section ref={container} className="relative bg-black z-10 overflow-hidden">
      <div className="container mx-auto px-6 py-32">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Featured <span className="text-zinc-500">AI Tools</span>
        </h2>
        <div className="w-full h-px bg-white/10 mt-8"></div>
      </div>

      <div className="w-full">
        {products.map((product, i) => (
          <div key={i} className="project-panel relative w-full min-h-[80vh] md:h-screen flex items-center justify-center bg-black overflow-hidden">
            
            <div className={`grid lg:grid-cols-[1.5fr_1fr] gap-8 md:gap-12 items-center w-full px-4 sm:px-6 lg:px-12 max-w-[90vw] ${i % 2 === 1 ? 'lg:grid-cols-[1fr_1.5fr]' : ''}`}>
                
                {/* Image Container - Absolutely positioned images stack */}
              <div className={`relative w-full aspect-video max-w-full ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                {product.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="project-img-card absolute inset-0 rounded-lg overflow-hidden border border-white/10"
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
                <Link
                  href={product.url}
                  className="inline-block px-8 py-3 border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  Try Now →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
