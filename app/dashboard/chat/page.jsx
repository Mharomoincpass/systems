'use client'

import { useEffect, useState } from 'react'
import ChatInterface from '@/components/chat/ChatInterface'

export default function DashboardChatPage() {
  const [conversationId, setConversationId] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        const data = await response.json()
        if (data.success) {
          setConversationId(data.conversationId)
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeChat()
  }, [])

  if (isInitializing) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-zinc-400 text-sm">
        Initializing chat...
      </div>
    )
  }

  if (!conversationId) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-red-400 text-sm">
        Failed to initialize chat. Please refresh.
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ChatInterface conversationId={conversationId} />
    </div>
  )
}
