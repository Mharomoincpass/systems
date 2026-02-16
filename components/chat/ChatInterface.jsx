'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

export default function ChatInterface({ conversationId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState('openai-fast')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const streamTextRef = useRef('')
  const streamRafRef = useRef(null)
  const scrollRafRef = useRef(null)

  const models = [
    { id: 'openai', name: 'OpenAI GPT', info: 'Standard & Smart' },
    { id: 'openai-fast', name: 'OpenAI Fast', info: 'Optimized for speed' },
    { id: 'openai-large', name: 'OpenAI Large', info: 'Highest intelligence' },
    { id: 'mistral', name: 'Mistral', info: 'Fast open-weights' },
    { id: 'gemini', name: 'Gemini 2.0', info: 'Google - Logic & Creative' },
    { id: 'gemini-search', name: 'Gemini Search', info: 'Real-time Web Access' },
    { id: 'qwen-coder', name: 'Qwen Coder', info: 'Specialized in Programming' },
  ]

  // Dynamically set container height and position based on visualViewport (iOS keyboard fix)
  useEffect(() => {
    const updateLayout = () => {
      const vv = window.visualViewport
      if (!vv || !containerRef.current) return

      // Force window to top — prevents iOS from scrolling the page behind the keyboard
      window.scrollTo(0, 0)

      // Set container height to exactly the visible viewport
      containerRef.current.style.height = `${vv.height}px`

      // Offset the container to match where the visual viewport actually is
      containerRef.current.style.top = `${vv.offsetTop}px`

      // After resizing, scroll the chat messages to the bottom so user sees latest messages
      requestAnimationFrame(() => {
        const el = scrollRef.current
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    }

    const fallbackUpdate = () => {
      if (!containerRef.current) return
      window.scrollTo(0, 0)
      containerRef.current.style.height = `${window.innerHeight}px`
      containerRef.current.style.top = '0px'

      requestAnimationFrame(() => {
        const el = scrollRef.current
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    }

    if (window.visualViewport) {
      updateLayout()
      window.visualViewport.addEventListener('resize', updateLayout)
      window.visualViewport.addEventListener('scroll', updateLayout)
    } else {
      fallbackUpdate()
      window.addEventListener('resize', fallbackUpdate)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateLayout)
        window.visualViewport.removeEventListener('scroll', updateLayout)
      } else {
        window.removeEventListener('resize', fallbackUpdate)
      }
    }
  }, [])

  // Lock body scroll to prevent background scrolling (mobile only)
  // DO NOT use position:fixed on body — it breaks input visibility on iOS
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.innerWidth >= 768) return

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  // Scroll helper
  const scrollToBottom = useCallback((instant = false) => {
    const el = scrollRef.current
    if (!el) return
    if (instant) {
      el.scrollTop = el.scrollHeight
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [])

  // Load messages
  useEffect(() => {
    if (!conversationId) return
    let cancelled = false
    setIsLoading(true)

    fetch(`/api/chat/messages?conversationId=${conversationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.success) {
          setMessages(data.messages)
        }
      })
      .catch((err) => console.error('Load messages failed:', err))
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [conversationId])

  // Scroll on new messages
  useEffect(() => {
    if (scrollRafRef.current) return
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null
      scrollToBottom(isStreaming)
    })
  }, [messages, isStreaming, scrollToBottom])

  // Send message
  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return

    setError(null)
    setInput('')

    // Dismiss keyboard on mobile
    if (window.innerWidth < 768) {
      inputRef.current?.blur()
    }

    const userId = `u_${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { _id: userId, content: text, role: 'user', createdAt: new Date().toISOString() },
    ])

    setIsStreaming(true)
    const asstId = `a_${Date.now()}`
    streamTextRef.current = ''

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content: text, model: selectedModel }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Server error ${res.status}`)
      }

      // Add assistant placeholder
      setMessages((prev) => [
        ...prev,
        { _id: asstId, content: '', role: 'assistant', createdAt: new Date().toISOString() },
      ])

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
                  setMessages((prev) =>
                    prev.map((m) => (m._id === asstId ? { ...m, content: snap } : m))
                  )
                })
              }
            }
          } catch { /* skip partial */ }
        }
      }
      if (streamRafRef.current) {
        cancelAnimationFrame(streamRafRef.current)
        streamRafRef.current = null
      }
      if (streamTextRef.current) {
        const snap = streamTextRef.current
        setMessages((prev) =>
          prev.map((m) => (m._id === asstId ? { ...m, content: snap } : m))
        )
      }
    } catch (err) {
      console.error('Send error:', err)
      setError(err.message || 'Failed to send')
      setMessages((prev) => prev.filter((m) => m._id !== asstId))
    } finally {
      setIsStreaming(false)
    }
  }

  const copy = (text) => navigator.clipboard?.writeText(text)

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white z-50">
        {/* Noise texture overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-3">
          <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <p className="text-xs sm:text-sm text-gray-400">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 top-0 flex flex-col bg-black text-white font-sans overflow-hidden"
      style={{ height: '100dvh' }}
    >
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[100] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      {/* Header */}
      <div className="shrink-0 bg-black/50 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/systems" className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 active:scale-95 transition-all duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-white">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-bold text-base sm:text-lg">Multi Chat Models</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="block px-2 py-1.5 text-xs font-medium bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id} className="bg-black">
                  {model.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/15 hover:border-white/30 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 overscroll-contain space-y-3 sm:space-y-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-3xl mx-auto w-full space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-4 text-3xl backdrop-blur-sm">
                🤖
              </div>
              <h3 className="text-lg font-bold text-gray-200 mb-2">Welcome to Multi Chat Models</h3>
              <p className="text-sm text-gray-400 max-w-[240px]">
                Your private AI assistant. Send a message to start.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  onClick={() => copy(msg.content)}
                  className={`max-w-[88%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed break-words whitespace-pre-wrap transition-all duration-300 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02]'
                      : 'bg-white/5 text-gray-200 border border-white/10 backdrop-blur-sm rounded-tl-sm hover:bg-white/[0.07] hover:border-white/20 hover:scale-[1.02]'
                  }`}
                >
                  {msg.content || (
                    <div className="flex items-center gap-2 py-1">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.32s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.16s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                      </div>
                      <span className="text-xs text-gray-400 font-medium">Multi Chat Models is thinking...</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-[88%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed break-words whitespace-pre-wrap bg-white/5 text-gray-200 border border-white/10 backdrop-blur-sm rounded-tl-sm">
                <div className="flex items-center gap-2 py-1">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.32s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.16s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Multi Chat Models is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 sm:py-3 mx-3 sm:mx-4 mb-2 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg sm:rounded-xl text-red-300 text-xs sm:text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 p-3 sm:p-4 bg-black/50 backdrop-blur-xl border-t border-white/10 pb-[max(12px,env(safe-area-inset-bottom))]">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto w-full flex gap-2 sm:gap-3 items-center px-0 sm:px-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Multi Chat Models..."
            disabled={isStreaming}
            autoComplete="off"
            autoCorrect="off"
            enterKeyHint="send"
            className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-300 ${
              isStreaming || !input.trim()
                ? 'bg-white/10 text-gray-500 opacity-50 cursor-not-allowed'
                : 'bg-white text-black hover:bg-gray-200 active:scale-95 hover:scale-105'
            }`}
          >
            {isStreaming ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}