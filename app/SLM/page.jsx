'use client'

import { useEffect, useState } from 'react'
import ChatInterface from '@/components/chat/ChatInterface'

export default function SLMPage() {
  const [conversationId, setConversationId] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Always create a new conversation on mount/refresh
        const response = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: null }), // Anonymous
        })

        const data = await response.json()
        if (data.success) {
          // We don't save to localStorage anymore to ensure refresh starts fresh
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
      <div className="w-full h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-gray-500">Initializing chat...</div>
      </div>
    )
  }

  if (!conversationId) {
    return (
      <div className="w-full h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-red-500">Failed to initialize chat. Please refresh.</div>
      </div>
    )
  }

  return <ChatInterface conversationId={conversationId} />
}
