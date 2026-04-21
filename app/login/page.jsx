'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Use full page navigation to ensure the session cookie is picked up
      // by all browsers (including mobile Safari on iPhone) before loading
      // the destination page.
      window.location.href = redirect
    } catch {
      setError('Something went wrong. Please try again.')
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
          <h1 className="text-xl font-semibold text-foreground">Sign in to your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2.5 bg-background border border-zinc-800 rounded-lg text-foreground text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
              placeholder="••••••"
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
            className="w-full py-2.5 bg-white text-black font-medium text-sm rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <Link href="/forgot-password" className="block text-xs text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}
