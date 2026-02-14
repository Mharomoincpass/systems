'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

/*
 * ChatInterface — mobile-first chat like ChatGPT.
 *
 * Layout approach:
 *  - height: 100dvh (dynamic viewport — shrinks when iOS keyboard opens)
 *  - body overflow locked while chat is mounted
 *  - interactiveWidget=resizes-content in viewport meta for Chrome
 *  - NO position:fixed (breaks iOS — header scrolls off with keyboard)
 *  - NO visualViewport JS (causes jank)
 *  - Keyboard auto-dismisses after send, then scrolls to show response
 */

export default function ChatInterface({ conversationId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // ── lock body scroll while chat is mounted (no position:fixed — it kills keyboard on iOS) ──
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'

    return () => {
      html.style.overflow = prevHtml
      body.style.overflow = prevBody
    }
  }, [])

  // ── scroll helper ──
  const scrollToBottom = useCallback((instant = false) => {
    const el = scrollRef.current
    if (!el) return
    if (instant) {
      el.scrollTop = el.scrollHeight
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [])

  // ── load messages ──
  useEffect(() => {
    if (!conversationId) return
    let cancelled = false
    fetch(`/api/chat/messages?conversationId=${conversationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.success) setMessages(data.messages)
      })
      .catch((err) => console.error('Load messages failed:', err))
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [conversationId])

  // ── scroll on new messages ──
  useEffect(() => {
    scrollToBottom(isStreaming)
  }, [messages, scrollToBottom, isStreaming])

  // ── after stream finishes, wait for keyboard dismiss then scroll ──
  const prevStreaming = useRef(false)
  useEffect(() => {
    if (prevStreaming.current && !isStreaming) {
      // Stream just ended — keyboard may still be closing, wait then scroll
      const t = setTimeout(() => scrollToBottom(false), 350)
      return () => clearTimeout(t)
    }
    prevStreaming.current = isStreaming
  }, [isStreaming, scrollToBottom])

  // ── send ──
  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return

    setError(null)
    setInput('')

    // dismiss keyboard on mobile after sending
    if ('ontouchstart' in window) {
      inputRef.current?.blur()
    }

    const userId = `u_${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { _id: userId, content: text, role: 'user', createdAt: new Date().toISOString() },
    ])

    setIsStreaming(true)
    const asstId = `a_${Date.now()}`

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content: text }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Server error ${res.status}`)
      }

      // placeholder bubble
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
              const snap = fullText
              setMessages((prev) =>
                prev.map((m) => (m._id === asstId ? { ...m, content: snap } : m))
              )
            }
          } catch { /* partial JSON, skip */ }
        }
      }
    } catch (err) {
      console.error('Send error:', err)
      setError(err.message || 'Failed to send. Try again.')
      setMessages((prev) => prev.filter((m) => m._id !== asstId))
    } finally {
      setIsStreaming(false)
    }
  }

  const copy = (text) => navigator.clipboard?.writeText(text)

  // ── loading spinner ──
  if (isLoading) {
    return (
      <div className="slm-root" style={styles.root}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={styles.spinner} />
        </div>
      </div>
    )
  }

  return (
    <div className="slm-root" style={styles.root}>
      {/* ─── HEADER ─── */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/systems" style={styles.backBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#9ca3af">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={styles.statusDot} />
            <span style={{ fontWeight: 700, fontSize: 17 }}>SLM Chat</span>
          </div>
        </div>
        <button onClick={() => window.location.reload()} style={styles.newChatBtn}>
          New Chat
        </button>
      </div>

      {/* ─── MESSAGES ─── */}
      <div ref={scrollRef} style={styles.messageArea}>
        {messages.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🤖</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#e5e7eb', margin: '0 0 6px' }}>
              Welcome to SLM
            </p>
            <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 240, lineHeight: 1.5, margin: 0 }}>
              Your private AI assistant. Send a message to start.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 10,
              }}
            >
              <div
                onClick={() => copy(msg.content)}
                style={{
                  ...styles.bubble,
                  ...(msg.role === 'user' ? styles.userBubble : styles.asstBubble),
                }}
              >
                {msg.content || (
                  <span style={styles.typingDots}>
                    <span style={{ ...styles.dot, animationDelay: '-0.32s' }} />
                    <span style={{ ...styles.dot, animationDelay: '-0.16s' }} />
                    <span style={styles.dot} />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── ERROR ─── */}
      {error && <div style={styles.errorBar}>⚠️ {error}</div>}

      {/* ─── INPUT ─── */}
      <div style={styles.inputBar}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message SLM..."
            disabled={isStreaming}
            autoComplete="off"
            autoCorrect="off"
            enterKeyHint="send"
            style={styles.input}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            style={{
              ...styles.sendBtn,
              opacity: isStreaming || !input.trim() ? 0.4 : 1,
              background: isStreaming || !input.trim() ? '#1f2937' : '#4f46e5',
            }}
          >
            {isStreaming ? (
              <div style={styles.sendSpinner} />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </form>
      </div>

      {/* CSS — keyframes + root height with dvh fallback */}
      <style>{`
        .slm-root {
          height: 100vh;
          height: 100dvh;
        }
        @keyframes slm-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes slm-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

/* ────────────────────────────────
 *  All styles as plain JS objects
 *  → zero Tailwind, zero CSS-in-JS runtime
 * ──────────────────────────────── */
const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    background: '#030014',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid rgba(99,102,241,0.3)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'slm-spin 0.8s linear infinite',
  },

  /* header */
  header: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: '#030014',
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#22c55e',
  },
  newChatBtn: {
    fontSize: 12,
    padding: '6px 14px',
    borderRadius: 8,
    background: 'rgba(99,102,241,0.1)',
    color: '#818cf8',
    border: '1px solid rgba(99,102,241,0.2)',
    fontWeight: 500,
    cursor: 'pointer',
  },

  /* messages */
  messageArea: {
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    padding: '16px 12px',
  },
  empty: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    fontSize: 28,
  },

  /* bubble */
  bubble: {
    maxWidth: '88%',
    padding: '12px 16px',
    borderRadius: 20,
    fontSize: 15,
    lineHeight: 1.5,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  userBubble: {
    background: '#4f46e5',
    color: '#fff',
    borderTopRightRadius: 4,
  },
  asstBubble: {
    background: 'rgba(255,255,255,0.07)',
    color: '#e5e7eb',
    borderTopLeftRadius: 4,
    border: '1px solid rgba(255,255,255,0.07)',
  },
  typingDots: {
    display: 'flex',
    gap: 5,
  },
  dot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#818cf8',
    animation: 'slm-bounce 1.4s infinite ease-in-out',
  },

  /* error */
  errorBar: {
    margin: '0 12px 8px',
    padding: '10px 14px',
    background: 'rgba(127,29,29,0.4)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 12,
    color: '#fca5a5',
    fontSize: 13,
    flexShrink: 0,
  },

  /* input bar */
  inputBar: {
    flexShrink: 0,
    padding: '12px 12px',
    paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    background: '#030014',
  },
  input: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: '14px 20px',
    color: '#fff',
    fontSize: 16,  // 16px prevents iOS zoom
    outline: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
  },
  sendBtn: {
    flexShrink: 0,
    width: 48,
    height: 48,
    borderRadius: 16,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  sendSpinner: {
    width: 20,
    height: 20,
    border: '2.5px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'slm-spin 0.8s linear infinite',
  },
}
