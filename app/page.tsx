
import { Navbar } from '@/components/Navbar'
import SmoothScroll from '@/components/SmoothScroll'
import CustomCursor from '@/components/CustomCursor'
import Hero from '@/components/home/Hero'
import ScrollStory from '@/components/home/ScrollStory'
import Features from '@/components/home/Features'
import Showcase from '@/components/home/Showcase'
import CTA from '@/components/home/CTA'

export default function Home() {
  return (
    <>
      <div className="hidden lg:block">
        <CustomCursor />
      </div>
      
      <SmoothScroll>
        <main className="bg-black text-white selection:bg-white selection:text-black">
          <Navbar />
          
          <div className="relative z-10">
            <Hero />
            <ScrollStory />
            <Features />
            <Showcase />
            <CTA />
          </div>

          {/* Noise overlay for texture */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </main>
      </SmoothScroll>
    </>
  )
}
