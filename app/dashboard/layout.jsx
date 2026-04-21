'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user', { cache: 'no-store' })
        if (!res.ok) {
          router.push('/login')
          return
        }
        const data = await res.json()
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const isChatPage = pathname === '/dashboard/chat'

  return (
    <div className="h-[100dvh] w-full bg-background text-foreground overflow-hidden lg:pl-60">
      <Suspense fallback={<div className="w-60 h-full bg-background" />}>
        <Sidebar
          user={user}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarCollapsed(true)}
        />
      </Suspense>

      {/* Top mobile bar when sidebar is collapsed */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-14 bg-card border-b border-border z-30 flex items-center px-4">
        <button onClick={() => setSidebarCollapsed(false)} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <span className="font-semibold text-sm ml-2">Mharomo</span>
      </div>

      <main className="w-full pt-14 lg:pt-0 relative h-full overflow-y-auto">
        {isChatPage ? (
          children
        ) : (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        )}
      </main>
    </div>
  )
}
