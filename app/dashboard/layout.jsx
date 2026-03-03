'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import { DashboardNotificationProvider } from '@/components/dashboard/GlobalNotifications'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user')
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <DashboardNotificationProvider>
      <div className="min-h-screen bg-black text-white">
        <Sidebar
          user={user}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarCollapsed(true)}
        />

        <div className="lg:ml-60 flex flex-col min-h-screen">
          <TopBar
            user={user}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className="flex-1 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardNotificationProvider>
  )
}
