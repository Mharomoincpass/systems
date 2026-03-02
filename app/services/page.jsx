import { Navbar } from '@/components/Navbar'
import SmoothScroll from '@/components/SmoothScroll'
import ServicesHero from '@/components/services/ServicesHero'
import ServicesList from '@/components/services/ServicesList'
import ContactForm from '@/components/ContactForm'
import CTA from '@/components/home/CTA'

export const metadata = {
  title: 'Software Development Services | Mharomo Systems',
  description: 'Expert software development services including Web Apps, E-commerce, AI Integration, and Cloud Solutions.',
}

export default function ServicesPage() {
  return (
    <>
      <SmoothScroll>
        <main className="bg-black text-white min-h-screen selection:bg-blue-500 selection:text-white">
          <Navbar />
          <ServicesHero />
          <ServicesList />
          <ContactForm />
          <CTA />
        </main>
      </SmoothScroll>
    </>
  )
}
