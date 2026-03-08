import ChatbotPage from '@/components/chat/ChatbotPage'

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
  return <ChatbotPage />
}
