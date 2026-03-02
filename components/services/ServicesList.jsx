'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// import TiltCard from '../TiltCard'

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    title: 'Web Application Development',
    description: 'Scalable, high-performance web apps using modern frameworks like Next.js and React. We build everything from SaaS platforms to internal business tools.',
    tags: ['Next.js', 'React', 'Node.js', 'PostgreSQL']
  },
  {
    title: 'AI & Machine Learning',
    description: 'Integrate cutting-edge AI capabilities into your software. Chatbots, predictive analytics, and automated content generation powered by LLMs.',
    tags: ['OpenAI API', 'TensorFlow', 'NLP', 'Computer Vision']
  },
  {
    title: 'E-commerce Solutions',
    description: 'Custom e-commerce platforms designed to convert. We handle everything from storefront design to secure payment gateway integration.',
    tags: ['Shopify', 'Stripe', 'Custom Cart', 'Inventory']
  },
  {
    title: 'Cloud Infrastructure',
    description: 'Secure, scalable cloud architecture design and management. We ensure your applications are always online and performing at their best.',
    tags: ['AWS', 'Google Cloud', 'Docker', 'Kubernetes']
  },
  {
    title: 'API Development & Integration',
    description: 'Robust RESTful and GraphQL APIs that connect your systems. We build secure endpoints for mobile apps, third-party integrations, and microservices.',
    tags: ['REST', 'GraphQL', 'Swagger', 'Microservices']
  }
]

export default function ServicesList() {
  const container = useRef(null)

  useGSAP(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const cards = gsap.utils.toArray('.service-card')
    
    gsap.from(cards, {
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%",
      },
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "power2.out"
    })
  }, { scope: container })

  return (
    <section ref={container} className="relative py-20 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <div key={idx} className="service-card h-full">
              <div className="h-full p-8 rounded-2xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-white/20 transition-all duration-300 flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-zinc-400 mb-6 flex-grow leading-relaxed">{service.description}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {service.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-3 py-1 rounded-full bg-white/5 text-zinc-300 text-xs font-medium border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
