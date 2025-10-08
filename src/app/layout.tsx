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

export const metadata: Metadata = {
  metadataBase: new URL('https://kalame.chat'),
  title: {
    default: 'هوش مصنوعی کلمه: چت جی پی تی ۵ رایگان، ChatGPT-5 فارسی و دستیار هوش مصنوعی ایرانی',
    template: '%s | هوش مصنوعی کلمه'
  },
  description: 'با هوش مصنوعی کلمه به صورت رایگان با قوی‌ترین مدل (ChatGPT) به فارسی چت کنید، عکس تولید کنید و از یک دستیار هوشمند فارسی‌زبان بهره ببرید و هر روز اعتبار رایگان دریافت کنید!',
  keywords: ['هوش مصنوعی', 'ChatGPT', 'چت جی پی تی', 'دستیار هوش مصنوعی', 'هوش مصنوعی فارسی', 'تولید عکس', 'چت رایگان', 'AI فارسی', 'ChatGPT-5', 'هوش مصنوعی ایرانی'],
  authors: [{ name: 'تیم کلمه' }],
  creator: 'کلمه',
  publisher: 'کلمه',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://kalame.chat',
    siteName: 'هوش مصنوعی کلمه',
    title: 'هوش مصنوعی کلمه: چت جی پی تی ۵ رایگان، ChatGPT-5 فارسی و دستیار هوش مصنوعی ایرانی',
    description: 'با هوش مصنوعی کلمه به صورت رایگان با قوی‌ترین مدل (ChatGPT) به فارسی چت کنید، عکس تولید کنید و از یک دستیار هوشمند فارسی‌زبان بهره ببرید و هر روز اعتبار رایگان دریافت کنید!',
    images: [
      {
        url: '/kalame-logo.png',
        width: 1200,
        height: 630,
        alt: 'هوش مصنوعی کلمه - دستیار هوش مصنوعی فارسی',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'هوش مصنوعی کلمه: چت جی پی تی ۵ رایگان، ChatGPT-5 فارسی و دستیار هوش مصنوعی ایرانی',
    description: 'با هوش مصنوعی کلمه به صورت رایگان با قوی‌ترین مدل (ChatGPT) به فارسی چت کنید، عکس تولید کنید و از یک دستیار هوشمند فارسی‌زبان بهره ببرید و هر روز اعتبار رایگان دریافت کنید!',
    images: ['/kalame-logo.png'],
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
    canonical: 'https://kalame.chat',
    languages: {
      'fa-IR': 'https://kalame.chat/fa',
      'en-US': 'https://kalame.chat/en',
    },
  },
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
        
        <link rel="manifest" href="/manifest.json" />
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
