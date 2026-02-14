'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../MagneticButton'

gsap.registerPlugin(ScrollTrigger)

export default function CTA() {
  const container = useRef(null)

  return (
    <section ref={container} className="relative min-h-[80vh] flex flex-col items-center justify-center bg-black overflow-hidden border-t border-white/10">
      
      <div className="relative z-10 text-center px-6">
        <h2 className="text-6xl md:text-9xl font-black mb-10 text-white tracking-tighter">
            LET&apos;S <br/><span className="text-zinc-600">COLLABORATE</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <MagneticButton>
                <a href="mailto:mharomoezgs@gmail.com" className="px-12 py-5 bg-white text-black text-lg font-bold rounded-sm hover:bg-zinc-200 transition-all duration-300">
                    Start a Project
                </a>
            </MagneticButton>
            <MagneticButton>
                <a href="https://linkedin.com/in/mharomo-ezung-51b158191" target="_blank" rel="noopener noreferrer" className="px-12 py-5 border border-white/20 text-white text-lg font-bold rounded-sm hover:bg-white hover:text-black hover:border-transparent transition-all duration-300">
                    Connect
                </a>
            </MagneticButton>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-zinc-600 text-sm uppercase tracking-widest mb-3">
            © {new Date().getFullYear()} Mharomo Ezung
        </p>
        <div className="text-zinc-500 text-xs space-y-1">
          <p>Delhi, India | +91 6009 325 630</p>
          <p>mharomoezgs@gmail.com</p>
        </div>
      </div>
    </section>
  )
}
