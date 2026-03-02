'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function ServicesHero() {
  const container = useRef(null)

  useGSAP(() => {
    const tl = gsap.timeline()
    
    tl.from('.hero-title', {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
    })
    .from('.hero-subtitle', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
    }, '-=0.5')
  }, { scope: container })

  return (
    <section ref={container} className="relative pt-32 pb-20 px-6 min-h-[50vh] flex flex-col justify-center bg-black overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]"></div>
        </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter uppercase">
          Build <span className="text-zinc-600">Better</span><br />
          Software <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Solutions</span>
        </h1>
        <p className="hero-subtitle text-xl md:text-2xl text-zinc-400 max-w-2xl font-light leading-relaxed">
          We transform complex challenges into elegant, scalable digital products. From web applications to AI integration, we build the future of your business.
        </p>
      </div>
    </section>
  )
}
