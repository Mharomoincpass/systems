'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1=email, 2=otp, 3=details
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const sendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send code')
        return
      }
      setStep(2)
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndCreate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, name, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed')
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'signup' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to resend')
        return
      }
      setError('')
    } catch {
      setError('Failed to resend code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 border border-border flex items-center justify-center bg-background">
              <span className="text-foreground text-sm font-bold">M</span>
            </div>
            <span className="text-foreground font-bold text-lg tracking-tight">
              Mharomo<span className="text-zinc-600 text-xs">.systems</span>
            </span>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Create your account</h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 w-8 rounded-full ${s <= step ? 'bg-white' : 'bg-card'}`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={sendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2.5 bg-background border border-zinc-800 rounded-lg text-foreground text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>
            {error && (
              <div className="bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black font-medium text-sm rounded-lg hover:bg-zinc-200 disabled:opacity-50"
            >
              {loading ? 'Sending code...' : 'Send verification code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3) }} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Verification code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                disabled={loading}
                className="w-full px-3 py-2.5 bg-background border border-zinc-800 rounded-lg text-foreground text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                placeholder="000000"
              />
              <p className="text-xs text-zinc-600 mt-1.5">Check {email} for the 6-digit code</p>
            </div>
            {error && (
              <div className="bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={code.length !== 6}
              className="w-full py-2.5 bg-white text-black font-medium text-sm rounded-lg hover:bg-zinc-200 disabled:opacity-50"
            >
              Continue
            </button>
            <button type="button" onClick={resendCode} disabled={loading} className="w-full text-xs text-muted-foreground hover:text-foreground disabled:opacity-50">
              Resend code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={verifyAndCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2.5 bg-background border border-zinc-800 rounded-lg text-foreground text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="w-full px-3 py-2.5 bg-background border border-zinc-800 rounded-lg text-foreground text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                placeholder="Min 6 characters"
              />
            </div>
            {error && (
              <div className="bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black font-medium text-sm rounded-lg hover:bg-zinc-200 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
