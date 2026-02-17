'use client'

import { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CTA() {
  const container = useRef(null)

  return (
    <section id="contact" ref={container} className="relative py-24 bg-black overflow-hidden border-t border-white/10">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg aspect-square bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full px-6">
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
