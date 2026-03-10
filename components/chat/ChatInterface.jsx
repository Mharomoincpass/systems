'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ChatMediaRenderer, { ToolProgress, ToolError } from './ChatMediaRenderer'

const MEDIA_SUGGESTIONS = [
  { icon: '🖼️', text: 'Do you want to generate an image? I can create one from your idea.' },
  { icon: '🎬', text: 'Need a video? Tell me the scene and I can generate one.' },
  { icon: '🎵', text: 'Want music generation? Share the vibe, mood, and style.' },
  { icon: '🎙️', text: 'Need voice or transcription? I can do TTS and audio-to-text too.' },
]

const TEXT_ONLY_SUGGESTIONS = [
  { icon: '✨', text: 'Explain quantum computing simply' },
  { icon: '💻', text: 'Write a Python function to sort a list' },
  { icon: '📝', text: 'Help me write a professional email' },
  { icon: '🎯', text: 'Give me a 7-day productivity plan' },
]

function makeConversationTitle(rawText, existingConversations = []) {
  const text = (rawText || '').replace(/\s+/g, ' ').trim()
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const timeLabel = `${hh}:${mm}`

  const maxBaseLength = 36
  const baseText = text
    ? (text.length > maxBaseLength ? `${text.slice(0, maxBaseLength).trim()}...` : text)
    : 'Untitled chat'

  let candidate = `${baseText} - ${timeLabel}`
  const titles = new Set(existingConversations.map((c) => c.title))
  let n = 2
  while (titles.has(candidate)) {
    candidate = `${baseText} - ${timeLabel} (${n})`
    n += 1
  }

  return candidate
}

function sanitizeAssistantText(text) {
  if (typeof text !== 'string' || !text) return ''

  // Remove complete and partial tool call tags so internals are never shown in UI.
  return text
    .replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, '')
    .replace(/<tool_call>[\s\S]*$/gi, '')
    .replace(/<\/tool_call>/gi, '')
    .trimEnd()
}

function sanitizeMessage(message) {
  if (!message || message.role !== 'assistant') return message
  return {
    ...message,
    content: sanitizeAssistantText(message.content || ''),
  }
}

export default function ChatInterface({ conversationId, allowMediaGeneration = false }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState('openai-fast')
  
  // Image Upload State
  const [attachments, setAttachments] = useState([])
  const [audioAttachments, setAudioAttachments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

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

  const suggestions = allowMediaGeneration ? MEDIA_SUGGESTIONS : TEXT_ONLY_SUGGESTIONS

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
    if (!conversationId) {
      setMessages([])
      setIsLoading(false)
      return
    }

    if (!isDashboard) {
      // Load from local storage for public route
      try {
        const saved = localStorage.getItem('mharomo_conversations')
        if (saved) {
          const parsed = JSON.parse(saved)
          const conv = parsed.find(c => c.id === conversationId || c._id === conversationId)
          if (conv) {
            setMessages((conv.messages || []).map(sanitizeMessage))
          } else {
            setMessages([])
          }
        } else {
          setMessages([])
        }
      } catch (e) {
        console.error('Local load failed:', e)
      }
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    fetch(`/api/chat/messages?conversationId=${conversationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.success) {
          setMessages((data.messages || []).map(sanitizeMessage))
        }
      })
      .catch((err) => console.error('Load messages failed:', err))
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [conversationId, isDashboard])

  // Scroll on new messages
  useEffect(() => {
    if (scrollRafRef.current) return
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null
      scrollToBottom(isStreaming)
    })
  }, [messages, isStreaming, scrollToBottom])

  // --- Upload Functions ---
  const uploadImage = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported')
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Data = e.target.result
      try {
        const res = await fetch('/api/upload/temp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64Data })
        })
        const data = await res.json()
        if (data.success) {
          setAttachments(prev => [...prev, data.url])
        } else {
          setError(data.error || 'Failed to upload image')
        }
      } catch (err) {
        setError('Failed to upload image')
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const uploadAudio = async (file) => {
    if (!file.type.startsWith('audio/')) {
      setError('Only audio files are supported for transcription uploads')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Audio file must be smaller than 50MB')
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Data = e.target.result
      try {
        const res = await fetch('/api/upload/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioData: base64Data }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok && data.success) {
          setAudioAttachments((prev) => [...prev, data.url])
        } else {
          setError(data.error || data.message || 'Failed to upload audio')
        }
      } catch {
        setError('Failed to upload audio')
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePaste = (e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault()
        const file = items[i].getAsFile()
        if (file) uploadImage(file)
        break
      }
    }
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const removeAudioAttachment = (index) => {
    setAudioAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Send message
  const handleSend = async (e, directText = null) => {
    if (e) e.preventDefault()
    const text = directText || input.trim()
    if ((!text && attachments.length === 0 && audioAttachments.length === 0) || isStreaming) return

    setError(null)
    setInput('')

    // Dismiss keyboard on mobile
    if (window.innerWidth < 768) {
      inputRef.current?.blur()
    }

    const userId = `u_${Date.now()}`
    
    // Add user media preview locally before sending to API
    const userMediaPreview = [
      ...attachments.map((url) => ({ type: 'image', url, prompt: 'Upload' })),
      ...audioAttachments.map((url) => ({ type: 'audio', url, prompt: 'Audio upload' })),
    ]

    const newMessages = [
      ...messages,
      { _id: userId, content: text, role: 'user', createdAt: new Date().toISOString(), media: userMediaPreview }
    ]
    setMessages(newMessages)

    setIsStreaming(true)
    
    // Capture current attachments to send, then clear UI
    const currentAttachments = [...attachments]
    const currentAudioAttachments = [...audioAttachments]
    setAttachments([])
    setAudioAttachments([])
    
    const asstId = `a_${Date.now()}`
    streamTextRef.current = ''

    try {
      const isPublicMode = !isDashboard
      
      let activeConvId = conversationId
      let needsRedirect = false
      let endpoint = '/api/chat/stream'
      let payload = {}

      if (isPublicMode) {
        endpoint = '/api/chat/public'
        payload = {
          content: text,
          model: selectedModel,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          attachments: currentAttachments,
          audioAttachments: currentAudioAttachments,
        }
      } else {
        if (!activeConvId) {
          // Create new conversation on the fly
          const res = await fetch('/api/chat/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          })
          const data = await res.json()
          if (data.success) {
            activeConvId = data.conversationId
            needsRedirect = true
          } else {
            throw new Error('Failed to create conversation')
          }
        }
        payload = {
          conversationId: activeConvId,
          content: text,
          model: selectedModel,
          attachments: currentAttachments,
          audioAttachments: currentAudioAttachments,
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const friendlyMessage = err.message || err.error || `Server error ${res.status}`
        setError(friendlyMessage)
        setMessages((prev) => prev.filter((m) => m._id !== asstId))
        setIsStreaming(false)
        return
      }

      // Add assistant placeholder with media support
      setMessages((prev) => [
        ...prev,
        { _id: asstId, content: '', role: 'assistant', createdAt: new Date().toISOString(), media: [], toolProgress: null, toolError: null },
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
            if (parsed.done) break
            if (parsed.error) { setError(parsed.error); break }

            // Handle agentic SSE event types
            if (parsed.type === 'replace_content') {
              fullText = parsed.content || ''
              streamTextRef.current = sanitizeAssistantText(fullText)
              setMessages((prev) =>
                prev.map((m) => (m._id === asstId ? { ...m, content: sanitizeAssistantText(fullText) } : m))
              )
              continue
            }

            if (parsed.type === 'tool_start') {
              // Show generation progress indicator
              setMessages((prev) =>
                prev.map((m) => (m._id === asstId ? { ...m, toolProgress: parsed.tool } : m))
              )
              continue
            }

            if (parsed.type === 'tool_result') {
              // Tool completed — attach media to message
              const result = parsed.result
              const mediaType =
                parsed.tool === 'generate_image' ? 'image' :
                parsed.tool === 'generate_video' ? 'video' :
                (parsed.tool === 'generate_music' || parsed.tool === 'generate_tts') ? 'audio' : null

              if (mediaType && result?.url) {
                const mediaItem = {
                  type: mediaType,
                  url: result.url,
                  prompt: result.prompt || result.text || '',
                  model: result.model || parsed.tool,
                  metadata: result,
                }
                setMessages((prev) =>
                  prev.map((m) => (m._id === asstId ? { ...m, media: [...(m.media || []), mediaItem], toolProgress: null } : m))
                )
              } else if (parsed.tool === 'transcribe_audio' && result?.transcription) {
                // Transcription result — append text to message
                const transcriptionText = fullText
                  ? fullText + '\n\n**Transcription:**\n' + result.transcription
                  : '**Transcription:**\n' + result.transcription
                streamTextRef.current = transcriptionText
                setMessages((prev) =>
                  prev.map((m) => (m._id === asstId ? { ...m, content: transcriptionText, toolProgress: null } : m))
                )
              } else {
                setMessages((prev) =>
                  prev.map((m) => (m._id === asstId ? { ...m, toolProgress: null } : m))
                )
              }
              continue
            }

            if (parsed.type === 'tool_error') {
              setMessages((prev) =>
                prev.map((m) => (m._id === asstId ? { ...m, toolProgress: null, toolError: parsed.error } : m))
              )
              continue
            }

            // Normal text streaming
            if (parsed.content) {
              fullText += parsed.content
              streamTextRef.current = sanitizeAssistantText(fullText)
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
        const snap = sanitizeAssistantText(streamTextRef.current)
        let finalMessages = null
        setMessages((prev) => {
          finalMessages = prev.map((m) => (m._id === asstId ? { ...m, content: snap } : m))
          return finalMessages
        })

        if (!isDashboard && finalMessages) {
          // Save to localStorage outside the state updater to keep render pure.
          try {
            const saved = localStorage.getItem('mharomo_conversations')
            const parsed = saved ? JSON.parse(saved) : []
            let convId = conversationId

            if (!convId) {
              convId = `c_${Date.now()}`
              parsed.unshift({ id: convId, title: makeConversationTitle(text, parsed), messages: finalMessages })
              window.history.replaceState(null, '', `/chat?id=${convId}`)
            } else {
              const idx = parsed.findIndex((c) => c.id === convId || c._id === convId)
              if (idx > -1) {
                parsed[idx].messages = finalMessages
              } else {
                parsed.unshift({ id: convId, title: makeConversationTitle(text, parsed), messages: finalMessages })
              }
            }

            localStorage.setItem('mharomo_conversations', JSON.stringify(parsed))
            window.dispatchEvent(new Event('mharomo_chat_updated'))
          } catch (e) {
            console.error('Failed to save to localStorage', e)
          }
        }
      }

      if (needsRedirect && !isPublicMode) {
        window.history.replaceState(null, '', `/dashboard/chat?id=${activeConvId}`)
        window.dispatchEvent(new Event('mharomo_chat_updated'))
      }
    } catch (err) {
      // Avoid noisy dev overlays for expected UX errors; surface in-chat instead.
      if (err?.message && !String(err.message).toLowerCase().includes('signup_required')) {
        console.warn('Send error:', err)
      }
      setError(err.message || 'Failed to send')
      setMessages((prev) => prev.filter((m) => m._id !== asstId))
    } finally {
      setIsStreaming(false)
    }
  }

  const copy = (text) => navigator.clipboard?.writeText(text)

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black text-white z-20">
        {!isDashboard && <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>}
        
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
      className={`h-full w-full flex flex-col bg-black text-white font-sans overflow-hidden relative`}
    >
      {!isDashboard && <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>}
      
      {/* Header */}
      <div className="shrink-0 bg-black/50 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 hidden lg:flex">
            <Link href="/" className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/10 border border-white/20 hover:border-white/30 transition">
              <span className="font-bold text-white text-xs">M</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="font-bold text-base sm:text-lg">Multi Chat Models</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
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
        <div className={`max-w-3xl mx-auto w-full ${messages.length === 0 ? 'min-h-full flex items-center justify-center' : 'space-y-4'}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-8 py-10">
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-4 text-3xl backdrop-blur-sm">
                🤖
              </div>
              <h3 className="text-lg font-bold text-gray-200 mb-2">Welcome to Multi Chat Models</h3>
              <p className="text-sm text-gray-400 max-w-[280px]">
                Your AI assistant that can chat, generate images, videos, music, and more. Just ask!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-lg w-full">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(null, suggestion.text)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                    <span className="text-sm text-gray-300">{suggestion.text}</span>
                  </button>
                ))}
              </div>
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
                      ? 'bg-zinc-800 text-white rounded-tr-sm'
                      : 'bg-zinc-900 text-gray-200 border border-zinc-800 rounded-tl-sm'
                  }`}
                >
                  {(msg.role === 'assistant' ? sanitizeAssistantText(msg.content) : msg.content) || (
                    !msg.media?.length && !msg.toolProgress && !msg.toolError && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.32s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.16s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                        </div>
                        <span className="text-xs text-gray-400 font-medium">Multi Chat Models is thinking...</span>
                      </div>
                    )
                  )}
                  {msg.toolProgress && <ToolProgress tool={msg.toolProgress} />}
                  {msg.toolError && <ToolError tool="generation" error={msg.toolError} />}
                  {msg.media?.length > 0 && <ChatMediaRenderer media={msg.media} />}
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
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-2">
          
          {/* Image Previews */}
          {(attachments.length > 0 || audioAttachments.length > 0) && (
            <div className="flex gap-2 px-2 overflow-x-auto pb-1">
              {attachments.map((url, i) => (
                <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
                  <img src={url} alt="upload" className="w-full h-full object-cover" />
                  <button onClick={() => removeAttachment(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
              {audioAttachments.map((url, i) => (
                <div key={`audio-${i}`} className="relative w-48 h-16 shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2">
                  <audio src={url} controls className="w-full h-10" preload="metadata" />
                  <button onClick={() => removeAudioAttachment(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
              {isUploading && (
                <div className="w-16 h-16 shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-2 sm:gap-3 items-end px-0 sm:px-2">
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.type.startsWith('audio/')) {
                  uploadAudio(file)
                } else {
                  uploadImage(file)
                }
                e.target.value = ''
              }} 
              accept="image/*,audio/*,.mp3,.wav,.ogg,.m4a,.flac" 
              className="hidden" 
            />
            
            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming || isUploading}
              className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
              title="Attach image or audio"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
              placeholder="Message Multi Chat Models... (Attach image/audio or paste images with Ctrl+V)"
              disabled={isStreaming}
              rows={1}
              className="flex-1 max-h-32 min-h-[40px] sm:min-h-[48px] resize-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 leading-relaxed"
            />
            <button
              type="submit"
              disabled={isStreaming || isUploading || (!input.trim() && attachments.length === 0 && audioAttachments.length === 0)}
              className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-300 ${
                isStreaming || isUploading || (!input.trim() && attachments.length === 0 && audioAttachments.length === 0)
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
    </div>
  )
}