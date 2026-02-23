'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import ChatInterface from '@/components/chat/ChatInterface'

export default function MCMPage() {
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
      <>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-DEN9D68RFH"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-DEN9D68RFH');
            `,
          }}
        />
        <div className="w-full h-screen bg-black flex items-center justify-center">
        {/* Noise texture overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-3">
          <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <p className="text-xs sm:text-sm text-gray-400">Initializing chat...</p>
        </div>
      </div>
      </>
    )
  }

  if (!conversationId) {
    return (
      <>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-DEN9D68RFH"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-DEN9D68RFH');
            `,
          }}
        />
        <div className="w-full h-screen bg-black flex items-center justify-center">
        {/* Noise texture overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <div className="relative z-10 text-center px-4">
          <p className="text-red-400 text-sm sm:text-base mb-4">Failed to initialize chat. Please refresh.</p>
          <Link href="/ai-tools" className="inline-block px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 font-medium text-sm sm:text-base transition-all duration-300 hover:scale-105">
            Go Back
          </Link>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-DEN9D68RFH"
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DEN9D68RFH');
          `,
        }}
      />
      <ChatInterface conversationId={conversationId} />
    </>
  )
}
