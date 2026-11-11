import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { cn } from "@/lib/utils";
import { body, display, geist } from "@/lib/fonts";

const siteName = 'MHAROMO Systems'
const siteDescription =
  'Software and web development services — custom software, modern websites, and product platforms built to ship.'
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
    icon: [
      { url: '/brand/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/brand/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
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
    '@type': ['Organization', 'ProfessionalService'],
    name: 'MHAROMO Systems',
    url: siteUrl,
    logo: `${siteUrl}/brand/logo-full.png`,
    description:
      'Software and web development services for Wokha, Kohima, Dimapur, and Nagaland — custom software, modern websites, and product platforms.',
    telephone: '+916009325630',
    email: 'mharomolotha6@gmail.com',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: '+916009325630',
      email: 'mharomolotha6@gmail.com',
      areaServed: ['IN', 'Nagaland', 'Wokha', 'Kohima', 'Dimapur'],
      availableLanguage: ['English', 'Nagamese'],
    },
    sameAs: [
      'https://linkedin.com/in/mharomo-ezung-51b158191',
      'https://wa.me/916009325630',
    ],
    areaServed: [
      { '@type': 'State', name: 'Nagaland' },
      { '@type': 'City', name: 'Wokha' },
      { '@type': 'City', name: 'Kohima' },
      { '@type': 'City', name: 'Dimapur' },
      { '@type': 'City', name: 'Mokokchung' },
    ],
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Nagaland',
      addressCountry: 'IN',
    },
    knowsAbout: [
      'Web development',
      'Custom software',
      'Website design',
      'Local SEO',
      'Ecommerce websites',
    ],
  }
  
  return (
    <html lang="en" className={cn("font-sans", geist.variable, display.variable, body.variable)}>
      <head>
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
