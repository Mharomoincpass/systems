import { Navbar } from '@/components/Navbar'
import SmoothScroll from '@/components/SmoothScroll'
import ServicesHero from '@/components/services/ServicesHero'
import ServicesList from '@/components/services/ServicesList'
import ContactForm from '@/components/ContactForm'
import CTA from '@/components/home/CTA'

const siteUrl = 'https://mharomo.systems'

export const metadata = {
  title: 'Software Development Services: Web, AI & Cloud | Mharomo Systems',
  description: 'Expert software development services. We build scalable web applications, e-commerce platforms, AI-driven solutions, and robust cloud infrastructure for your business.',
  keywords: ['software development', 'web development', 'AI integration', 'cloud computing', 'e-commerce solutions', 'API development', 'Next.js development', 'Mharomo Systems'],
  openGraph: {
    title: 'Software Development Services | Mharomo Systems',
    description: 'Custom software solutions tailored to your business needs. Web, AI, and Cloud expertise.',
    url: `${siteUrl}/services`,
    siteName: 'Mharomo Systems',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Software Development Services | Mharomo Systems',
    description: 'Custom software solutions tailored to your business needs. Web, AI, and Cloud expertise.',
  },
  alternates: {
    canonical: `${siteUrl}/services`,
  },
}

export default function ServicesPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Software Development Services - Mharomo Systems',
    url: `${siteUrl}/services`,
    description: 'Professional software development services including web apps, AI integration, and cloud architecture.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Services',
          item: `${siteUrl}/services`,
        },
      ],
    },
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Software Development',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Mharomo Systems',
      url: siteUrl,
    },
    areaServed: 'Worldwide',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Software Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Web Application Development',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'AI & Machine Learning Integration',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Cloud Infrastructure Solutions',
          },
        },
      ],
    },
  }

  return (
    <>
      <SmoothScroll>
        <main className="bg-black text-white min-h-screen selection:bg-white selection:text-black">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
          />
          <Navbar />
          
          <div className="relative z-10">
            <ServicesHero />
            <ServicesList />
            <ContactForm />
            <CTA />
          </div>

          {/* Noise overlay for texture consistency */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] sm:opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </main>
      </SmoothScroll>
    </>
  )
}
