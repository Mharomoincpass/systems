'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
// import TiltCard from './TiltCard'

const services = [
  'Web Application Development',
  'E-commerce Solutions',
  'AI & Machine Learning',
  'Cloud Infrastructure',
  'API Development',
  'Other'
]

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: services[0],
    message: ''
  })
  const [status, setStatus] = useState('idle') // idle, submitting, success, error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to send message')

      setStatus('success')
      setFormData({ name: '', email: '', phone: '', serviceType: services[0], message: '' })
    } catch (error) {
      console.error('Contact error:', error)
      setStatus('error')
    }
  }

  return (
    <section className="py-20 bg-black relative overflow-hidden" id="contact-form">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">
            Contact <span className="text-zinc-500">Us</span>
          </h2>
          <p className="text-zinc-400">Tell us about what you want to build and we will get back to you.</p>
        </div>

        <div className="w-full">
          <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2" htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2" htmlFor="serviceType">Service Type</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
                >
                  {services.map((s) => (
                    <option key={s} value={s} className="bg-zinc-900">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-zinc-400 text-sm font-medium mb-2" htmlFor="message">Project Details</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors resize-none"
                placeholder="Describe your project goals, timeline, and requirements..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center text-sm"
              >
                Thank you! We've received your message and sent a confirmation email.
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center text-sm"
              >
                Something went wrong. Please try again later.
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
