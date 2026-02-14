'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import Input from '@/components/Input'

export default function ChatInterface({ conversationId, hfToken }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(
          `/api/chat/messages?conversationId=${conversationId}`
        )
        const data = await response.json()
        if (data.success) {
          setMessages(data.messages)
        }
      } catch (err) {
        console.error('Failed to load messages:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (conversationId) {
      loadMessages()
    }
  }, [conversationId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!input.trim() || isStreaming) return

    setError(null)
    const userMessage = input
    setInput('')

    // Add user message to UI immediately
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        content: userMessage,
        role: 'user',
        createdAt: new Date().toISOString(),
      },
    ])

    setIsStreaming(true)

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content: userMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      let currentMessage = ''
      const placeholderId = Date.now().toString()

      // Add placeholder for assistant message
      setMessages((prev) => [
        ...prev,
        {
          _id: placeholderId,
          content: '',
          role: 'assistant',
          createdAt: new Date().toISOString(),
        },
      ])

      // Read the SSE stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)

              if (parsed.error) {
                setError(parsed.error)
                break
              }

              if (parsed.content) {
                currentMessage += parsed.content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg._id === placeholderId
                      ? { ...msg, content: currentMessage }
                      : msg
                  )
                )
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', line, e)
            }
          }
        }
      }

      setIsStreaming(false)
    } catch (err) {
      console.error('Send message error:', err)
      setError(err.message || 'Failed to send message. Please try again.')
      setIsStreaming(false)
      // Remove the last message that failed
      setMessages((prev) => prev.slice(0, -1))
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const shareMessage = (text) => {
    if (navigator.share) {
      navigator.share({
        title: 'Chat Message',
        text: text,
      })
    } else {
      copyToClipboard(text)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#030014] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm animate-pulse">Initializing Secure Session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-[#030014] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-[#030014]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/systems"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/50 hover:bg-gray-700 transition border border-gray-700 active:scale-90"
            title="Back to Applications"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current text-gray-400"
            >
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h1 className="font-bold text-lg">SLM Chat</h1>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full transition border border-gray-700 active:scale-95"
        >
          New Chat
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center p-8">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="text-xl font-bold text-gray-200 mb-2">Welcome to SLM</p>
            <p className="text-sm max-w-[240px]">
              Your private, secure AI assistant. How can I help you today?
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl group relative shadow-lg ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700/50'
                }`}
              >
                <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                  {message.content}
                </p>

                {/* Mobile-friendly actions (visible on tap/hover) */}
                <div
                  className={`absolute ${
                    message.role === 'user' ? '-left-12' : '-right-12'
                  } bottom-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pb-1`}
                >
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="bg-gray-800/80 backdrop-blur p-2 rounded-full text-xs border border-gray-700 active:bg-indigo-500"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {isStreaming && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-gray-800 px-4 py-4 rounded-2xl rounded-tl-none border border-gray-700/50">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-24 p-3 bg-red-900/40 border border-red-500/50 text-red-200 text-xs rounded-xl backdrop-blur-sm animate-in shake duration-300">
          <p className="font-bold mb-1 flex items-center gap-1">
            <span>⚠️</span> Connection Error
          </p>
          {error}
        </div>
      )}

      {/* Input Area - Sticky at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#030014]/90 backdrop-blur-lg border-t border-gray-800/50 px-4 py-4 pb-6">
        <form onSubmit={handleSendMessage} className="max-w-7xl mx-auto">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message SLM..."
              disabled={isStreaming}
              className="flex-1 bg-gray-900/50 text-white border border-gray-700/50 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50 text-[16px] placeholder:text-gray-500 transition-all shadow-inner"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-gray-800 text-white w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-90 shadow-lg shadow-indigo-600/20 shrink-0"
            >
              {isStreaming ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
