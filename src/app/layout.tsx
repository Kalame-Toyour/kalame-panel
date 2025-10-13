import './globals.css'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import StructuredData from './components/StructuredData'
import GoogleTagManager from './components/GoogleTagManager'
import GTMPageTracker from './components/GTMPageTracker'
import ServerGTM, { ServerGTMNoScript } from './components/ServerGTM'
import DynamicHead from './components/DynamicHead'
import DynamicStyles from './components/DynamicStyles'
import JWTExpirationHandler from './components/JWTExpirationHandler'
import SessionProviderWrapper from './components/SessionProviderWrapper'
import { SiteProvider } from '@/contexts/SiteContext'
import { getServerDynamicContent } from '@/utils/serverDynamicContent'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getServerDynamicContent()
  
  return {
    metadataBase: new URL(`https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}`),
    title: {
      default: content.title,
      template: `%s | ${content.siteName}`
    },
    description: content.description,
    keywords: content.brandName === 'کلمه' 
      ? ['هوش مصنوعی', 'ChatGPT', 'چت جی پی تی', 'دستیار هوش مصنوعی', 'هوش مصنوعی فارسی', 'تولید عکس', 'چت رایگان', 'AI فارسی', 'ChatGPT-5', 'هوش مصنوعی ایرانی']
      : ['هوش مصنوعی', 'اوکیان', 'ChatGPT', 'دستیار هوش مصنوعی', 'هوش مصنوعی فارسی', 'تولید تصویر', 'چت هوش مصنوعی', 'AI فارسی', 'پلتفرم هوش مصنوعی'],
    authors: [{ name: `تیم ${content.brandName}` }],
    creator: content.brandName,
    publisher: content.brandName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      url: `https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}`,
      siteName: content.siteName,
      title: content.title,
      description: content.description,
      images: [
        {
          url: content.logo,
          width: 1200,
          height: 630,
          alt: `${content.siteName} - دستیار هوش مصنوعی فارسی`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: [content.logo],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    alternates: {
      canonical: `https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}`,
      languages: {
        'fa-IR': `https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}/fa`,
        'en-US': `https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}/en`,
      },
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Server-side Google Tag Manager */}
        <ServerGTM />
        
        {/* Dynamic Head Elements */}
        <DynamicHead />
        
        <link rel="manifest" href="/api/manifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <StructuredData />
      </head>
      <body>
        {/* Server-side Google Tag Manager (noscript) */}
        <ServerGTMNoScript />
        
        <SiteProvider>
          <SessionProviderWrapper>
            <GoogleTagManager />
            <DynamicStyles />
            <JWTExpirationHandler />
            <Suspense fallback={null}>
              <GTMPageTracker />
            </Suspense>
            {children}
          </SessionProviderWrapper>
        </SiteProvider>
      </body>
    </html>
  )
}
