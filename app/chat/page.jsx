import { Suspense } from 'react'
import PublicChatPage from './ChatClientPage'

export const metadata = {
  title: 'AI Chat - Free Multi-Model Chatbot | Mharomo',
  description: 'Chat with multiple AI models for free. No sign-up required. Switch between OpenAI, Gemini, Mistral, and more.',
  openGraph: {
    title: 'AI Chat - Free Multi-Model Chatbot | Mharomo',
    description: 'Chat with multiple AI models for free. No sign-up required.',
    url: 'https://mharomo.systems/chat',
    type: 'website',
  },
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" /></div>}>
      <PublicChatPage />
    </Suspense>
  )
}
