'use client'

import { useRouter } from 'next/navigation'

export default function TopBar({ user, onToggleSidebar }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="h-14 border-b border-zinc-800 bg-black flex items-center justify-between px-4 shrink-0">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 text-zinc-400 hover:text-white"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400 hidden sm:block">{user?.email}</span>
        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <span className="text-xs text-white font-medium">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-zinc-500 hover:text-white px-2 py-1"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
