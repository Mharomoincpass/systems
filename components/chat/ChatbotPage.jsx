'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

const MODELS = [
  { id: 'openai-fast', name: 'GPT Fast', desc: 'Quick responses' },
  { id: 'openai', name: 'GPT Standard', desc: 'Balanced' },
  { id: 'openai-large', name: 'GPT Large', desc: 'Most capable' },
  { id: 'mistral', name: 'Mistral', desc: 'Open-source' },
  { id: 'gemini', name: 'Gemini 2.0', desc: 'Google AI' },
  { id: 'gemini-search', name: 'Gemini Search', desc: 'Web access' },
  { id: 'qwen-coder', name: 'Qwen Coder', desc: 'Code expert' },
]

const SUGGESTIONS = [
  { icon: '✨', text: 'Explain quantum computing simply' },
  { icon: '💻', text: 'Write a Python function to sort a list' },
  { icon: '📝', text: 'Help me write a professional email' },
  { icon: '🎨', text: 'Give me creative story ideas' },
]

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export default function ChatbotPage() {
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState('openai-fast')
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const [signupFeature, setSignupFeature] = useState('')

  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const streamTextRef = useRef('')
  const streamRafRef = useRef(null)
  const modelPickerRef = useRef(null)

  // Check auth status
  useEffect(() => {
    fetch('/api/user')
      .then(response => response.ok ? response.json() : null)
      .then(userData => { if (userData?.user) setUser(userData.user) })
      .catch(() => {})
  }, [])

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mharomo_conversations')
      if (saved) {
        const parsed = JSON.parse(saved)
        setConversations(parsed)
      }
    } catch {}
  }, [])

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem('mharomo_conversations', JSON.stringify(conversations))
      } catch {}
    }
  }, [conversations])

  // Load active conversation messages
  useEffect(() => {
    if (activeConversationId) {
      const conv = conversations.find(c => c.id === activeConversationId)
      setMessages(conv?.messages || [])
    } else {
      setMessages([])
    }
  }, [activeConversationId, conversations])

  // iOS keyboard fix
  useEffect(() => {
    const updateLayout = () => {
      const vv = window.visualViewport
      if (!vv || !containerRef.current) return
      window.scrollTo(0, 0)
      containerRef.current.style.height = `${vv.height}px`
      containerRef.current.style.top = `${vv.offsetTop}px`
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      })
    }

    const fallback = () => {
      if (!containerRef.current) return
      window.scrollTo(0, 0)
      containerRef.current.style.height = `${window.innerHeight}px`
      containerRef.current.style.top = '0px'
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      })
    }

    if (window.visualViewport) {
      updateLayout()
      window.visualViewport.addEventListener('resize', updateLayout)
      window.visualViewport.addEventListener('scroll', updateLayout)
    } else {
      fallback()
      window.addEventListener('resize', fallback)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateLayout)
        window.visualViewport.removeEventListener('scroll', updateLayout)
      } else {
        window.removeEventListener('resize', fallback)
      }
    }
  }, [])

  // Lock body scroll on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  // Close model picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target)) {
        setShowModelPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const scrollToBottom = useCallback((instant = false) => {
    const el = scrollRef.current
    if (!el) return
    if (instant) el.scrollTop = el.scrollHeight
    else el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [])

  // Scroll on messages update
  useEffect(() => {
    requestAnimationFrame(() => scrollToBottom(isStreaming))
  }, [messages, isStreaming, scrollToBottom])

  const startNewChat = () => {
    setActiveConversationId(null)
    setMessages([])
    setError(null)
    setInput('')
    setSidebarOpen(false)
    inputRef.current?.focus()
  }

  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeConversationId === id) {
      setActiveConversationId(null)
      setMessages([])
    }
  }

  const handleSend = async (e, overrideText) => {
    if (e) e.preventDefault()
    const text = (overrideText || input).trim()
    if (!text || isStreaming) return

    setError(null)
    setInput('')

    if (window.innerWidth < 768) inputRef.current?.blur()

    let convId = activeConversationId
    if (!convId) {
      convId = generateId()
      const title = text.slice(0, 50) + (text.length > 50 ? '...' : '')
      const newConv = { id: convId, title, messages: [], model: selectedModel, createdAt: new Date().toISOString() }
      setConversations(prev => [newConv, ...prev])
      setActiveConversationId(convId)
    }

    const userMsg = { id: generateId(), role: 'user', content: text, createdAt: new Date().toISOString() }
    const asstId = generateId()

    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)
    streamTextRef.current = ''

    // Build context
    const contextMessages = messages.slice(-10).map(msg => ({ role: msg.role, content: msg.content }))

    try {
      const res = await fetch('/api/chat/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          model: selectedModel,
          messages: contextMessages,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Server error ${res.status}`)
      }

      setMessages(prev => [...prev, { id: asstId, role: 'assistant', content: '', createdAt: new Date().toISOString() }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const parsed = JSON.parse(line.slice(6))
            if (parsed.error) { setError(parsed.error); break }
            if (parsed.content) {
              fullText += parsed.content
              streamTextRef.current = fullText
              if (!streamRafRef.current) {
                streamRafRef.current = requestAnimationFrame(() => {
                  const snap = streamTextRef.current
                  streamRafRef.current = null
                  setMessages(prev => prev.map(m => m.id === asstId ? { ...m, content: snap } : m))
                })
              }
            }
          } catch {}
        }
      }

      if (streamRafRef.current) {
        cancelAnimationFrame(streamRafRef.current)
        streamRafRef.current = null
      }
      if (streamTextRef.current) {
        const snap = streamTextRef.current
        setMessages(prev => prev.map(m => m.id === asstId ? { ...m, content: snap } : m))
      }

      // Save to conversations
      const asstMsg = { id: asstId, role: 'assistant', content: streamTextRef.current || fullText, createdAt: new Date().toISOString() }
      setConversations(prev =>
        prev.map(c =>
          c.id === convId
            ? { ...c, messages: [...c.messages, userMsg, asstMsg] }
            : c
        )
      )
    } catch (err) {
      setError(err.message || 'Failed to send')
      setMessages(prev => prev.filter(m => m.id !== asstId))
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  const copyText = (text) => {
    navigator.clipboard?.writeText(text)
  }

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]

  // Simple markdown-like renderer
  const renderContent = (text) => {
    if (!text) return null

    // Split by code blocks
    const parts = text.split(/(```[\s\S]*?```)/g)

    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n')
        const lang = lines[0]?.trim() || ''
        const code = (lang ? lines.slice(1) : lines).join('\n').trim()
        return (
          <div key={i} className="my-3 rounded-xl overflow-hidden border border-zinc-700/50">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/80 text-xs text-zinc-400">
              <span>{lang || 'code'}</span>
              <button onClick={() => copyText(code)} className="hover:text-white transition-colors">Copy</button>
            </div>
            <pre className="p-4 overflow-x-auto bg-zinc-900/80 text-sm leading-relaxed">
              <code className="text-zinc-200">{code}</code>
            </pre>
          </div>
        )
      }

      // Process inline formatting
      return (
        <span key={i}>
          {part.split('\n').map((line, j) => {
            // Headers
            if (line.startsWith('### ')) return <h3 key={j} className="text-base font-semibold mt-4 mb-2 text-white">{line.slice(4)}</h3>
            if (line.startsWith('## ')) return <h2 key={j} className="text-lg font-semibold mt-4 mb-2 text-white">{line.slice(3)}</h2>
            if (line.startsWith('# ')) return <h1 key={j} className="text-xl font-bold mt-4 mb-2 text-white">{line.slice(2)}</h1>

            // Bullet points
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return <div key={j} className="flex gap-2 ml-2 my-0.5"><span className="text-zinc-500 mt-0.5">•</span><span>{renderInline(line.slice(2))}</span></div>
            }
            // Numbered
            const numMatch = line.match(/^(\d+)\.\s(.*)/)
            if (numMatch) {
              return <div key={j} className="flex gap-2 ml-2 my-0.5"><span className="text-zinc-500 min-w-[1.2em]">{numMatch[1]}.</span><span>{renderInline(numMatch[2])}</span></div>
            }

            // Empty line
            if (!line.trim()) return <br key={j} />

            return <p key={j} className="my-0.5">{renderInline(line)}</p>
          })}
        </span>
      )
    })
  }

  const renderInline = (text) => {
    // Bold
    const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[13px] font-mono">{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  return (
    <div ref={containerRef} className="fixed inset-0 flex bg-[#0a0a0a] text-white font-sans overflow-hidden" style={{ height: '100dvh' }}>
      {/* Signup Prompt Modal */}
      {showSignupPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full text-center animate-scale-in">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-2xl border border-indigo-500/30">
              🔒
            </div>
            <h3 className="text-lg font-semibold mb-2">Sign up to unlock</h3>
            <p className="text-sm text-zinc-400 mb-6">
              {signupFeature === 'image-gen' && 'Create stunning AI-generated images'}
              {signupFeature === 'video-gen' && 'Generate AI videos from text'}
              {signupFeature === 'audio-gen' && 'Create AI music and audio'}
              {signupFeature === 'image-to-video' && 'Transform images into videos'}
              {!signupFeature && 'Access premium AI features'}
              {' '}by creating a free account.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowSignupPrompt(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white border border-zinc-700 rounded-xl hover:border-zinc-600 transition-all">
                Maybe later
              </button>
              <Link href="/signup" className="flex-1 px-4 py-2.5 text-sm font-medium bg-white text-black rounded-xl hover:bg-zinc-200 transition-all text-center">
                Sign up free
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Log in</Link>
            </p>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 h-full w-[280px] bg-[#0f0f0f] border-r border-zinc-800/50 z-50 flex flex-col transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-800/50">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
              M
            </div>
            <span className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors">Mharomo</span>
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={startNewChat} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all" title="New chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all md:hidden">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-xs text-zinc-500">No conversations yet</p>
              <p className="text-xs text-zinc-600 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div key={conv.id} className={`group flex items-center gap-1 rounded-lg mb-0.5 transition-all ${activeConversationId === conv.id ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}>
                <button
                  onClick={() => { setActiveConversationId(conv.id); setSidebarOpen(false) }}
                  className="flex-1 text-left px-3 py-2.5 text-sm truncate text-zinc-300"
                >
                  {conv.title}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id) }}
                  className="p-1.5 mr-1 rounded text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar footer - tools & user */}
        <div className="border-t border-zinc-800/50 p-3 space-y-1">
          {/* Premium features (gated) */}
          {[
            { icon: '🖼️', label: 'Image Generation', feature: 'image-gen' },
            { icon: '🎬', label: 'Video Generation', feature: 'video-gen' },
            { icon: '🎵', label: 'Audio Generation', feature: 'audio-gen' },
          ].map(item => (
            <button
              key={item.feature}
              onClick={() => {
                if (user) {
                  window.location.href = `/dashboard/${item.feature === 'image-gen' ? 'images' : item.feature === 'video-gen' ? 'videos' : 'music'}`
                } else {
                  setSignupFeature(item.feature)
                  setShowSignupPrompt(true)
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {!user && <span className="ml-auto text-xs text-zinc-600">🔒</span>}
            </button>
          ))}

          <div className="h-px bg-zinc-800/50 my-2" />

          {user ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
              <Link href="/dashboard" className="p-1.5 rounded text-zinc-500 hover:text-white transition-colors" title="Dashboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </Link>
            </div>
          ) : (
            <div className="flex gap-2 px-1">
              <Link href="/login" className="flex-1 px-3 py-2 text-sm text-center text-zinc-400 hover:text-white border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all">
                Log in
              </Link>
              <Link href="/signup" className="flex-1 px-3 py-2 text-sm text-center bg-white text-black rounded-lg hover:bg-zinc-200 transition-all font-medium">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="shrink-0 h-12 flex items-center justify-between px-3 border-b border-zinc-800/50 bg-[#0a0a0a]">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all md:hidden">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>

            {/* Model picker */}
            <div className="relative" ref={modelPickerRef}>
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
              >
                <span>{currentModel.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${showModelPicker ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {showModelPicker && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-in">
                  <div className="p-2">
                    {MODELS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedModel(m.id); setShowModelPicker(false) }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${selectedModel === m.id ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${selectedModel === m.id ? 'bg-indigo-400' : 'bg-zinc-600'}`} />
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-zinc-500">{m.desc}</p>
                        </div>
                        {selectedModel === m.id && (
                          <svg className="ml-auto text-indigo-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={startNewChat}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              title="New chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-4">
            {messages.length === 0 ? (
              /* Welcome screen */
              <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-8rem)] text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400 sm:w-10 sm:h-10">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <path d="M9 9h.01M15 9h.01" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">How can I help you?</h1>
                <p className="text-sm sm:text-base text-zinc-500 mb-8 max-w-md">
                  Chat with multiple AI models for free. No sign-up required.
                </p>

                {/* Suggestion chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(null, s.text)}
                      className="flex items-center gap-3 px-4 py-3 text-left text-sm text-zinc-300 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-zinc-700 rounded-xl transition-all group"
                    >
                      <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">{s.icon}</span>
                      <span className="group-hover:text-white transition-colors">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message list */
              <div className="space-y-6 py-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 shrink-0 mt-1 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                    )}
                    <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                      <div className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed break-words ${
                        msg.role === 'user'
                          ? 'bg-indigo-600/90 text-white rounded-tr-md'
                          : 'bg-zinc-900/80 text-zinc-200 border border-zinc-800/50 rounded-tl-md'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose-chat">
                            {msg.content ? renderContent(msg.content) : (
                              <div className="flex items-center gap-2 py-1">
                                <div className="flex gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.32s]" />
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.16s]" />
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                                </div>
                                <span className="text-xs text-zinc-500">Thinking...</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        )}
                      </div>
                      {/* Copy button for assistant messages */}
                      {msg.role === 'assistant' && msg.content && (
                        <div className="flex items-center gap-1 mt-1.5 ml-1">
                          <button onClick={() => copyText(msg.content)} className="p-1 rounded text-zinc-500 hover:text-zinc-300 transition-colors" title="Copy">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Streaming indicator */}
                {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 shrink-0 mt-1 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/50 rounded-tl-md">
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.32s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.16s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                        </div>
                        <span className="text-xs text-zinc-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        {/* Input area */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0a0a] border-t border-zinc-800/30 pb-[max(12px,env(safe-area-inset-bottom))]">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto w-full relative">
            <div className="relative flex items-end bg-zinc-900/80 border border-zinc-700/50 rounded-2xl focus-within:border-zinc-600 focus-within:bg-zinc-900 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  // Auto-resize
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder="Message Mharomo..."
                disabled={isStreaming}
                rows={1}
                autoComplete="off"
                className="flex-1 bg-transparent resize-none px-4 py-3 text-sm sm:text-[15px] text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50 max-h-[200px] leading-relaxed"
                style={{ minHeight: '44px' }}
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className={`shrink-0 m-1.5 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  isStreaming || !input.trim()
                    ? 'text-zinc-600 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-lg'
                }`}
              >
                {isStreaming ? (
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-600 text-center mt-2">
              Free AI chat powered by Pollinations. {!user && <Link href="/signup" className="text-indigo-400/70 hover:text-indigo-400">Sign up</Link>}{!user && ' for image, video & audio generation.'}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
