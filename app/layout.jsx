import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import { NotificationProvider } from '@/components/Notifications'
import AnalyticsTracker from '@/components/AnalyticsTracker'

const inter = Inter({ subsets: ['latin'] })

const siteName = 'AI Tools and Systems'
const siteDescription = 'AI tools and systems for chat, images, video, music, transcription, and speech.'
const siteUrl = 'https://mharomo.systems'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: '/',
    siteName,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
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
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mharomo.systems',
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description: 'Smart AI tools and custom software solutions for businesses. Specializing in AI chat, image generation, video creation, and data integration.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'mharomolotha6@gmail.com',
      areaServed: 'Worldwide',
    },
    sameAs: [
      'https://linkedin.com/in/mharomo-ezung-51b158191',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Delhi',
      addressCountry: 'India',
    },
  }
  
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
        
        {/* Google AdSense - Must be in head for verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7139373644000528"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <AnalyticsTracker />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  )
}
