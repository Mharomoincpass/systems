'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import StorageIndicator from './StorageIndicator'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: 'grid' },
  { label: 'Mimir MCP(beta)', href: '/dashboard/mimir-mcp', icon: 'mimir' },
  { label: 'Chat', href: '/dashboard/chat', icon: 'chat' },
  { label: 'Images', href: '/dashboard/images', icon: 'image' },
  { label: 'Videos', href: '/dashboard/videos', icon: 'video' },
  { label: 'Music', href: '/dashboard/music', icon: 'music' },
  { label: 'Text to Speech', href: '/dashboard/tts', icon: 'speaker' },
  { label: 'Transcribe', href: '/dashboard/transcribe', icon: 'mic' },
  { label: 'Library', href: '/dashboard/library', icon: 'folder' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
]

const icons = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  ),
  mimir: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M8 2L3 5v3c0 3.5 2.2 5.5 5 6.5 2.8-1 5-3 5-6.5V5L8 2z" />
      <circle cx="8" cy="7" r="1.5" fill="currentColor" />
      <path d="M5.5 10.5c0-1.4 1.1-2 2.5-2s2.5.6 2.5 2" />
    </svg>
  ),
  chat: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M3 3h10a1 1 0 011 1v6a1 1 0 01-1 1H6l-3 3V4a1 1 0 011-1z" />
    </svg>
  ),
  image: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <circle cx="5.5" cy="5.5" r="1.5" />
      <path d="M14 11l-3-3-5 5" />
    </svg>
  ),
  video: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="2" y="3" width="8" height="10" rx="1" />
      <path d="M10 6l4-2v8l-4-2" />
    </svg>
  ),
  music: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M6 13V4l8-2v9" />
      <circle cx="4" cy="13" r="2" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  ),
  speaker: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M3 6h2l3-3v10L5 10H3a1 1 0 01-1-1V7a1 1 0 011-1z" />
      <path d="M11 5a4 4 0 010 6M13 3a7 7 0 010 10" />
    </svg>
  ),
  mic: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="6" y="2" width="4" height="7" rx="2" />
      <path d="M3 8a5 5 0 0010 0M8 13v2" />
    </svg>
  ),
  folder: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M2 4a1 1 0 011-1h3l2 2h5a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
  ),
  admin: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M8 2l5 3v4c0 3-2 5-5 6-3-1-5-3-5-6V5l5-3z" />
    </svg>
  ),
}

export default function Sidebar({ user, collapsed, onClose }) {
  const pathname = usePathname()
  const isAdmin = user?.role === 'admin'

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-black border-r border-zinc-800 z-50 flex flex-col transition-transform duration-200 ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-60' : 'translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-zinc-800 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 border border-zinc-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">
              Mharomo<span className="text-zinc-600 text-[10px]">.systems</span>
            </span>
          </Link>
          <button onClick={onClose} className="ml-auto lg:hidden text-zinc-400 hover:text-white p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {icons[item.icon]}
                {item.label}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="h-px bg-zinc-800 my-2" />
              <Link
                href="/dashboard/admin"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  pathname.startsWith('/dashboard/admin')
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {icons.admin}
                Admin
              </Link>
            </>
          )}
        </nav>

        {/* Storage */}
        <div className="border-t border-zinc-800">
          <StorageIndicator storageUsed={user?.storageUsed} storageLimit={user?.storageLimit} role={user?.role} />
        </div>
      </aside>
    </>
  )
}
