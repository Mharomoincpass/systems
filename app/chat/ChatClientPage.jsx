'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import ChatInterface from '@/components/chat/ChatInterface'
import { DashboardNotificationProvider } from '@/components/dashboard/GlobalNotifications'

export default function PublicChatPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  
  const searchParams = useSearchParams()
  const conversationId = searchParams?.get('id') || null

  useEffect(() => {
    fetch('/api/user', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <DashboardNotificationProvider>
      <div className="h-[100dvh] w-full bg-black text-white overflow-hidden lg:pl-60">
        <Sidebar
          user={user}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarCollapsed(true)}
        />

        {/* Top mobile bar when sidebar is collapsed */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-14 bg-[#0f0f0f] border-b border-zinc-800/50 z-30 flex items-center px-4">
          <button onClick={() => setSidebarCollapsed(false)} className="p-2 -ml-2 text-zinc-400 hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="font-semibold text-sm ml-2">Mharomo</span>
        </div>

        <main className="w-full pt-14 lg:pt-0 relative h-full">
          <ChatInterface conversationId={conversationId} allowMediaGeneration={!!user} />
        </main>
      </div>
    </DashboardNotificationProvider>
  )
}