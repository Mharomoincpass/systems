import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
  themeColor: '#ffffff',
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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <script
          src="https://api.grocliq.ai/api/leads/lw.js"
          data-site="69e71f6a87fa068035f76dd4"
          async
        ></script>
      </head>
      <body className="font-sans">
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-DEN9D68RFH"
        ></script>
        <script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-DEN9D68RFH');
            `,
          }}
        ></script>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7139373644000528"
          crossOrigin="anonymous"
        ></script>
        <AnalyticsTracker />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        ></script>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
