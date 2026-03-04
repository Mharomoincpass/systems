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
    image: '/images/grocliq.png',
    desc: 'GEO monitoring platform with AI agents that automate the SEO process and track brand presence across search engines.',
    url: 'https://grocliq.ai/',
  },
  {
    name: 'OpenSignals.ai',
    category: 'Ad Intelligence',
    image: '/images/opensignals.png',
    desc: 'Competitor ad analysis platform with AI-powered video, image, and paid ads generation for market research.',
    url: 'https://opensignals.ai/',
  },
  {
    name: 'Incpass',
    category: 'Process Automation',
    image: '/images/incpass.png',
    desc: 'Business process automation platform streamlining workflows, compliance, and operational efficiency.',
    url: 'https://incpass.co/',
  },
]

export default function Showcase() {
  const container = useRef(null)

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    gsap.from('.project-card', {
      scrollTrigger: {
        trigger: container.current,
        start: 'top 80%',
        once: true,
      },
      y: 36,
      opacity: 0,
      stagger: 0.14,
      duration: 0.75,
      ease: 'power2.out',
    })
  }, { scope: container })

  return (
    <section id="projects" ref={container} className="relative bg-black z-10 overflow-hidden py-20 sm:py-28 border-t border-white/10">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Top <span className="text-zinc-500">Projects by yours truly</span>
        </h2>
        <div className="w-full h-px bg-white/10 mt-8 mb-12"></div>

        <div className="grid gap-8 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.name} className="project-card rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="relative w-full aspect-video overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                <h3 className="text-3xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-4">{product.category}</p>
                <p className="text-zinc-400 leading-relaxed mb-6">{product.desc}</p>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2.5 border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  View Project →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
