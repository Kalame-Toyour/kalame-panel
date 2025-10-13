import { Metadata } from 'next'

export function generateMetadata(domain: string): Metadata {
  const siteConfigs: Record<string, any> = {
    'kalame.chat': {
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
        google: 'google61a3ff9bd5a447a6',
      },
      alternates: {
        canonical: 'https://kalame.chat',
        languages: {
          'fa-IR': 'https://kalame.chat/fa',
          'en-US': 'https://kalame.chat/en',
        },
      },
    },
    'okian.ai': {
      metadataBase: new URL('https://okian.ai'),
      title: {
        default: 'اوکیان هوش مصنوعی: پلتفرم پیشرفته هوش مصنوعی و چت جی پی تی',
        template: '%s | اوکیان هوش مصنوعی'
      },
      description: 'با اوکیان هوش مصنوعی قدرت هوش مصنوعی پیشرفته را تجربه کنید. با مدل‌های پیشرفته چت کنید، تصاویر تولید کنید و از دستیار هوشمند بهره ببرید.',
      keywords: ['هوش مصنوعی', 'اوکیان', 'ChatGPT', 'دستیار هوش مصنوعی', 'هوش مصنوعی فارسی', 'تولید تصویر', 'چت هوش مصنوعی', 'AI فارسی', 'پلتفرم هوش مصنوعی'],
      authors: [{ name: 'تیم اوکیان' }],
      creator: 'اوکیان',
      publisher: 'اوکیان',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      openGraph: {
        type: 'website',
        locale: 'fa_IR',
        url: 'https://okian.ai',
        siteName: 'اوکیان هوش مصنوعی',
        title: 'اوکیان هوش مصنوعی: پلتفرم پیشرفته هوش مصنوعی و چت جی پی تی',
        description: 'با اوکیان هوش مصنوعی قدرت هوش مصنوعی پیشرفته را تجربه کنید. با مدل‌های پیشرفته چت کنید، تصاویر تولید کنید و از دستیار هوشمند بهره ببرید.',
        images: [
          {
            url: '/okian-logo.svg',
            width: 1200,
            height: 630,
            alt: 'اوکیان هوش مصنوعی - پلتفرم پیشرفته هوش مصنوعی',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'اوکیان هوش مصنوعی: پلتفرم پیشرفته هوش مصنوعی و چت جی پی تی',
        description: 'با اوکیان هوش مصنوعی قدرت هوش مصنوعی پیشرفته را تجربه کنید. با مدل‌های پیشرفته چت کنید، تصاویر تولید کنید و از دستیار هوشمند بهره ببرید.',
        images: ['/okian-logo.svg'],
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
        google: 'googled2b7a47c05e2c4d2',
      },
      alternates: {
        canonical: 'https://okian.ai',
        languages: {
          'fa-IR': 'https://okian.ai/fa',
          'en-US': 'https://okian.ai/en',
        },
      },
    }
  }

  // Default to okian.ai for localhost, otherwise fallback to kalame.chat
  if (domain === 'localhost' || domain === '127.0.0.1') {
    return siteConfigs['okian.ai']
  }
  
  return siteConfigs[domain] || siteConfigs['kalame.chat']
}
