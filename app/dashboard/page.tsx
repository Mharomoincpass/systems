'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user')
      if (!response.ok) throw new Error('Failed to fetch user')
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030014]">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030014]">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#030014]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white font-bold text-lg">
              Mharomo<span className="text-indigo-400">.dev</span>
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white glass glass-hover rounded-lg transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-2 block">Dashboard</span>
          <h1 className="text-4xl font-bold text-white">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
        </div>

        {/* User info card */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 animate-glow">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Email</div>
            <div className="text-white font-medium">{user?.email}</div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Name</div>
            <div className="text-white font-medium">{user?.name || 'Not set'}</div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Member since</div>
            <div className="text-white font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🚀', label: 'New Project', desc: 'Start building' },
              { icon: '🤖', label: 'AI Models', desc: 'Manage models' },
              { icon: '📊', label: 'Analytics', desc: 'View insights' },
              { icon: '⚙️', label: 'Settings', desc: 'Configuration' },
            ].map((action, i) => (
              <button
                key={i}
                className="glass glass-hover rounded-xl p-4 text-left transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="text-2xl mb-2 block">{action.icon}</span>
                <span className="text-white font-medium text-sm block">{action.label}</span>
                <span className="text-gray-500 text-xs">{action.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
