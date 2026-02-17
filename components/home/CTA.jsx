'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../MagneticButton'

gsap.registerPlugin(ScrollTrigger)

export default function CTA() {
  const container = useRef(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStartSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      
      if (!response.ok) {
        throw new Error('Failed to start session')
      }
      
      window.location.href = '/systems'
    } catch (error) {
      console.error('Failed to start session:', error)
      setLoading(false)
    }
  }

  return (
    <section id="cta" ref={container} className="relative min-h-[100svh] py-24 sm:py-32 flex flex-col items-center justify-between bg-black overflow-hidden border-t border-white/10">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg aspect-square bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center px-6 w-full max-w-4xl">
        <h2 className="text-[14vw] sm:text-8xl md:text-9xl font-black mb-10 sm:mb-16 text-white tracking-tighter leading-[0.85] select-none">
            TRY <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-500 to-zinc-800 uppercase">
                FREE AI TOOLS
            </span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 justify-center items-center w-full sm:w-auto">
            <MagneticButton className="w-full sm:w-auto">
                <button 
                  onClick={handleStartSession}
                  disabled={loading}
                  className="w-full sm:w-auto min-w-[200px] px-10 py-5 bg-white text-black text-sm sm:text-base font-bold rounded-sm hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50 uppercase tracking-[0.25em]"
                >
                    {loading ? 'Starting...' : 'Try Free AI Tools'}
                </button>
            </MagneticButton>
            <MagneticButton className="w-full sm:w-auto">
                <a 
                  href="https://linkedin.com/in/mharomo-ezung-51b158191" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full sm:w-auto min-w-[200px] px-10 py-5 border border-white/20 text-white text-sm sm:text-base font-bold rounded-sm hover:bg-white hover:text-black hover:border-transparent transition-all duration-300 block text-center uppercase tracking-[0.25em]"
                >
                    Connect
                </a>
            </MagneticButton>
        </div>
      </div>

      <div className="relative z-10 w-full px-6 pb-8 pt-12">
        {/* Footer Links for SEO */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            <div>
              <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-4 font-semibold">AI Tools</h3>
              <ul className="space-y-2 text-zinc-600 text-xs">
                <li><Link href="/ai-tools" className="hover:text-white transition-colors">All Tools</Link></li>
                <li><Link href="/ai-tools/mcm" className="hover:text-white transition-colors">Multi Chat Models</Link></li>
                <li><Link href="/ai-image-generator" className="hover:text-white transition-colors">Image Generator</Link></li>
                <li><Link href="/ai-video-generator" className="hover:text-white transition-colors">Video Generator</Link></li>
                <li><Link href="/ai-music-generator" className="hover:text-white transition-colors">Music Generator</Link></li>
                <li><Link href="/speech-to-text" className="hover:text-white transition-colors">Speech to Text</Link></li>
                <li><Link href="/text-to-speech" className="hover:text-white transition-colors">Text to Speech</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-4 font-semibold">Blog</h3>
              <ul className="space-y-2 text-zinc-600 text-xs">
                <li><Link href="/blogs" className="hover:text-white transition-colors">All Posts</Link></li>
                <li><Link href="/blogs/free-ai-chat-guide" className="hover:text-white transition-colors">Free AI Chat Guide</Link></li>
                <li><Link href="/blogs/ai-photo-generator-free" className="hover:text-white transition-colors">AI Photo Generator</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-4 font-semibold">Resources</h3>
              <ul className="space-y-2 text-zinc-600 text-xs">
                <li><Link href="/systems/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-4 font-semibold">Connect</h3>
              <ul className="space-y-2 text-zinc-600 text-xs">
                <li><a href="https://linkedin.com/in/mharomo-ezung-51b158191" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="mailto:mharomoezgs@gmail.com" className="hover:text-white transition-colors">Email</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="w-8 h-px bg-zinc-800 mx-auto mb-8" />
        <p className="text-zinc-600 text-[9px] sm:text-[10px] uppercase tracking-[0.5em] mb-4 text-center">
            © {new Date().getFullYear()} MHAROMO EZUNG
        </p>
        <div className="text-zinc-500 text-[10px] sm:text-xs space-y-2 font-medium tracking-[0.1em] text-center">
          <p className="uppercase text-zinc-400">Delhi, India</p>
          <p className="text-zinc-600 lowercase font-light">mharomoezgs@gmail.com</p>
        </div>
      </div>
    </section>
  )
}
