import ChatbotPage from '@/components/chat/ChatbotPage'

export const metadata = {
  title: 'Mharomo AI - Chat, Images, Video & Music',
  description: 'Chat with multiple AI models. Generate images, videos, and music. All from one place. No sign-up required for chat.',
  openGraph: {
    title: 'Mharomo AI - Chat, Images, Video & Music',
    description: 'Chat with multiple AI models. Generate images, videos, and music. All in one place.',
    url: 'https://mharomo.systems/chat',
    type: 'website',
  },
}

export default function ChatPage() {
  return <ChatbotPage />
}
