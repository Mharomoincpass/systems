'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      router.push('/monitor')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 sm:p-6">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="absolute top-1/4 -left-32 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-[128px]" />
      
      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-4 transition-all duration-300 hover:border-white/20">
            <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base transition-all duration-300">Enter 6-digit access code</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="• • • • • •"
            maxLength="6"
            className="w-full bg-white/10 border border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 md:py-4 text-white placeholder-gray-500 text-lg sm:text-xl md:text-2xl tracking-[0.5em] text-center focus:outline-none focus:border-white/30 focus:bg-white/[0.15] mb-4 sm:mb-6 transition-all duration-300"
            disabled={loading}
          />

          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl transition-all duration-300">
              <p className="text-red-400 text-xs sm:text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || password.length !== 6}
            className="w-full bg-white text-black font-semibold py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-xs sm:text-sm md:text-base shadow-lg shadow-white/20 hover:shadow-white/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                Authenticating...
              </span>
            ) : (
              'Access Monitor'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
