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
    <section id="contact" ref={container} className="relative py-24 bg-background overflow-hidden border-t border-border">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg aspect-square bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full px-6">
        {/* Footer Links for SEO */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            <div>
              <h3 className="text-muted-foreground text-xs uppercase tracking-wider mb-4 font-semibold">Tool Categories</h3>
              <ul className="space-y-2 text-zinc-600 text-xs">
                <li><Link href="/ai-tools" className="hover:text-foreground transition-colors">All Tools</Link></li>
                <li><Link href="/ai-tools/mcm" className="hover:text-foreground transition-colors">Multi Chat Models</Link></li>
                <li><Link href="/ai-image-generator" className="hover:text-foreground transition-colors">Image Generator</Link></li>
                <li><Link href="/ai-video-generator" className="hover:text-foreground transition-colors">Video Generator</Link></li>
                <li><Link href="/ai-music-generator" className="hover:text-foreground transition-colors">Music Generator</Link></li>
                <li><Link href="/speech-to-text" className="hover:text-foreground transition-colors">Speech to Text</Link></li>
                <li><Link href="/text-to-speech" className="hover:text-foreground transition-colors">Text to Speech</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-muted-foreground text-xs uppercase tracking-wider mb-4 font-semibold">Latest Insights</h3>
              <ul className="space-y-2 text-zinc-600 text-xs">
                <li><Link href="/blogs" className="hover:text-foreground transition-colors">All Posts</Link></li>
                <li><Link href="/blogs/free-ai-chat-guide" className="hover:text-foreground transition-colors">Free AI Chat Guide</Link></li>
                <li><Link href="/blogs/ai-photo-generator-free" className="hover:text-foreground transition-colors">AI Photo Generator</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-muted-foreground text-xs uppercase tracking-wider mb-4 font-semibold">Platform Links</h3>
              <ul className="space-y-2 text-zinc-600 text-xs">
                <li><Link href="/systems/documentation" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
                <li><a href="https://pollinations.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Powered by Pollinations.ai</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-muted-foreground text-xs uppercase tracking-wider mb-4 font-semibold">Contact Info</h3>
              <ul className="space-y-2 text-zinc-600 text-xs">
                <li><a href="https://linkedin.com/in/mharomo-ezung-51b158191" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a></li>
                <li><a href="https://github.com/Mharomoincpass" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
                <li><a href="https://x.com/mharomo" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">X (Twitter)</a></li>
                <li><button onClick={() => window.location.href = 'mailto:' + 'mharomolotha6' + '@' + 'gmail.com'} className="hover:text-foreground transition-colors text-left">Email</button></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="w-8 h-px bg-card mx-auto mb-8" />
        <p className="text-zinc-600 text-[9px] sm:text-[10px] uppercase tracking-[0.5em] mb-4 text-center">
          © {new Date().getFullYear()} AI CHATBOT PLATFORM
        </p>
        <div className="text-muted-foreground text-[10px] sm:text-xs space-y-2 font-medium tracking-[0.1em] text-center">
          <p className="uppercase text-muted-foreground">Delhi, India</p>
          <button onClick={() => window.location.href = 'mailto:' + 'mharomolotha6' + '@' + 'gmail.com'} className="text-zinc-600 lowercase font-light hover:text-muted-foreground transition-colors">
            mharomolotha6<span className="hidden">null</span>@gmail.com
          </button>
        </div>
      </div>
    </section>
  )
}
