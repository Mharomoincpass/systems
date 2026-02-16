import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import { NotificationProvider } from '@/components/Notifications'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Mharomo.systems',
  description: 'Full-stack developer & tech lead. Building scalable systems with Node.js, React, Python, and AI.',
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#030014',
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
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
      </head>
      <body className={inter.className}>
        <NotificationProvider>
          <div className="hidden lg:block">
            <CustomCursor />
          </div>
          {children}
        </NotificationProvider>
      </body>
    </html>
  )
}
