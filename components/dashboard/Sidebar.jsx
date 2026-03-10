'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import StorageIndicator from './StorageIndicator'
import CreditsDisplay from '@/components/CreditsDisplay'

const icons = {
  chat: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M3 3h10a1 1 0 011 1v6a1 1 0 01-1 1H6l-3 3V4a1 1 0 011-1z" />
    </svg>
  ),
  mimir: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M8 2L3 5v3c0 3.5 2.2 5.5 5 6.5 2.8-1 5-3 5-6.5V5L8 2z" />
      <circle cx="8" cy="7" r="1.5" fill="currentColor" />
      <path d="M5.5 10.5c0-1.4 1.1-2 2.5-2s2.5.6 2.5 2" />
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
  more: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="2" r="1" />
      <circle cx="8" cy="8" r="1" />
      <circle cx="8" cy="14" r="1" />
    </svg>
  )
}

export default function Sidebar({ user, collapsed, onClose }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdmin = user?.role === 'admin'
  const brandName = user ? 'Mharomo' : 'systems'
  const brandInitial = user ? 'M' : 'S'
  const [conversations, setConversations] = useState([])
  const [loadingConv, setLoadingConv] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const loadConversations = useCallback(() => {
    if (user) {
      fetch('/api/chat/conversations')
        .then(res => res.json())
        .then(data => {
          if (data.success) setConversations(data.conversations)
        })
        .catch(console.error)
        .finally(() => setLoadingConv(false))
    } else {
      setConversations([])
      setLoadingConv(false)
    }
  }, [user])

  useEffect(() => {
    loadConversations()
    const handleUpdate = () => loadConversations()
    window.addEventListener('mharomo_chat_updated', handleUpdate)
    return () => window.removeEventListener('mharomo_chat_updated', handleUpdate)
  }, [pathname, searchParams, loadConversations]) // Refresh on navigation and query params

  const deleteConversation = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()

    setConversations(prev => {
      const filtered = prev.filter(c => c._id !== id)
      if (!user) {
        localStorage.setItem('mharomo_conversations', JSON.stringify(filtered))
      }
      return filtered
    })

    if (user) {
      try {
        await fetch(`/api/chat/conversations?id=${id}`, { method: 'DELETE' })
      } catch (err) {
        console.error(err)
      }
    }

    if ((pathname === `/dashboard/chat` || pathname === `/chat`) && document.location.search.includes(id)) {
      router.push(user ? '/dashboard/chat' : '/chat')
    }
  }

  const startNewChat = () => {
    onClose()
    router.push(user ? '/dashboard/chat' : '/chat')
  }

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-[#0f0f0f] border-r border-zinc-800/50 z-50 flex flex-col transition-transform duration-200 ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-60' : 'translate-x-0'
        }`}
      >
        {/* Header - New Chat */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-800/50 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
              {brandInitial}
            </div>
            <span className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors">{brandName}</span>
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={startNewChat} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all" title="New chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all lg:hidden">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conversation History (logged-in users only) */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {user ? (
            loadingConv ? (
              <div className="text-center py-4 text-xs text-zinc-500">Loading history...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">No recent chats</div>
            ) : (
              <div className="space-y-0.5">
                <div className="px-2 py-1 mb-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Recent</div>
                {conversations.map((conv, index) => {
                  const id = conv._id || conv.id
                  const isActive = searchParams?.get('id') === id
                  const rawTitle = (conv.title || '').trim()
                  const titleOccurrences = conversations.filter((c) => (c.title || '').trim() === rawTitle).length
                  const isGeneric = !rawTitle || rawTitle.toLowerCase() === 'new chat'
                  const hasDuplicateTitle = titleOccurrences > 1

                  let displayTitle = rawTitle || 'Untitled Chat'
                  if (isGeneric || hasDuplicateTitle) {
                    const ts = conv.updatedAt || conv.createdAt
                    const stamp = ts
                      ? new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : `#${index + 1}`
                    displayTitle = `${displayTitle} (${stamp})`
                  }

                  return (
                    <div key={id} className="relative group">
                      <Link
                        href={user ? `/dashboard/chat?id=${id}` : `/chat?id=${id}`}
                        onClick={onClose}
                        className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 truncate pr-8 ${
                          isActive
                            ? 'bg-zinc-800/80 text-white font-medium shadow-sm border border-zinc-700/50'
                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'
                        }`}
                        title={displayTitle}
                      >
                        {displayTitle}
                      </Link>
                      <button
                        onClick={(e) => deleteConversation(id, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                        title="Delete chat"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            <div className="text-center py-8 px-3 text-xs text-zinc-500">
              Log in to save chat history and access your profile tools.
            </div>
          )}
        </div>

        {/* Bottom Area */}
        <div className="border-t border-zinc-800/50 mt-auto bg-[#0f0f0f] relative shrink-0">
          {user ? (
            <>
              <div className="px-4 py-3 border-b border-zinc-800/50">
                <CreditsDisplay />
                <div className="mt-2">
                  <StorageIndicator storageUsed={user?.storageUsed} storageLimit={user?.storageLimit} role={user?.role} />
                </div>
              </div>

              <div className="p-2 relative">
                {userMenuOpen && (
                  <div className="absolute bottom-full left-2 right-2 mb-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-2 space-y-0.5">
                      <Link href="/dashboard/library" onClick={() => { setUserMenuOpen(false); onClose() }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                        {icons.folder} Library
                      </Link>
                      <Link href="/dashboard/mimir-mcp" onClick={() => { setUserMenuOpen(false); onClose() }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                        {icons.mimir} Mimir MCP
                      </Link>
                      <Link href="/dashboard/settings" onClick={() => { setUserMenuOpen(false); onClose() }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                        {icons.settings} Settings
                      </Link>
                      {isAdmin && (
                        <>
                          <div className="h-px bg-zinc-800 my-1 mx-2" />
                          <Link href="/dashboard/admin" onClick={() => { setUserMenuOpen(false); onClose() }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                            {icons.admin} Admin Panel
                          </Link>
                        </>
                      )}
                      <div className="h-px bg-zinc-800 my-1 mx-2" />
                      <button
                        onClick={async () => {
                          await fetch('/api/auth/logout', { method: 'POST' })
                          router.push('/login')
                        }}
                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                          <path d="M6 14H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h3M11 12l4-4-4-4M15 8H5" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-semibold">{user?.email?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                    <div className="text-left truncate">
                      <div className="text-sm font-medium text-zinc-200 truncate">{user?.name || user?.email || 'User'}</div>
                      <div className="text-[10px] text-zinc-500">{user?.role === 'admin' ? 'Administrator' : 'Free Plan'}</div>
                    </div>
                  </div>
                  <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {icons.more}
                  </div>
                </button>
              </div>
            </>
          ) : (
            <div className="p-4">
              <Link href="/signup" className="block w-full text-center px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors">
                Sign Up Free
              </Link>
              <Link href="/login" className="block w-full text-center px-4 py-2 mt-2 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                Log In
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
