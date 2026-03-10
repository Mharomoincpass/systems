'use client'

import { useSearchParams } from 'next/navigation'
import ChatInterface from '@/components/chat/ChatInterface'

export default function DashboardChatPage() {
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('id') || null

  return (
    <div className="h-full w-full">
      <ChatInterface conversationId={conversationId} allowMediaGeneration />
    </div>
  )
}
