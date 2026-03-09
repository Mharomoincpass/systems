'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user')
        if (!res.ok) {
          router.push('/login')
          return
        }
        const data = await res.json()
        if (data.user?.role !== 'admin') {
          router.push('/chat')
          return
        }
        setUser(data.user)
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const adminNav = [
    { label: 'Overview', href: '/dashboard/admin' },
    { label: 'Users', href: '/dashboard/admin/users' },
    { label: 'Media', href: '/dashboard/admin/media' },
    { label: 'Audit Logs', href: '/dashboard/admin/audit' },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Admin sidebar */}
      <aside className="w-52 shrink-0 border-r border-zinc-800 flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-zinc-800">
          <Link href="/chat" className="flex items-center gap-2">
            <div className="w-7 h-7 border border-zinc-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">
              Admin
            </span>
          </Link>
        </div>
        <nav className="flex-1 py-2 px-2">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm mb-0.5 ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-zinc-800 p-3">
          <Link href="/chat" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg">
            ← Back to Chat
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
