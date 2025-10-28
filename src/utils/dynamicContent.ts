export interface DynamicContent {
  brandName: string
  logo: string
  favicon: string
  appleTouchIcon: string
  siteName: string
  description: string
  title: string
  shortName: string
}

export function getDynamicContent(domain?: string): DynamicContent {
  // For kalame.chat domain only
  if (domain === 'kalame.chat') {
    return {
      brandName: 'کلمه',
      logo: '/kalame-logo.png',
      favicon: '/favicon.ico',
      appleTouchIcon: '/kalame-logo.png',
      siteName: 'هوش مصنوعی کلمه',
      description: 'با هوش مصنوعی کلمه به صورت رایگان با قوی‌ترین مدل (ChatGPT) به فارسی چت کنید، عکس تولید کنید و از یک دستیار هوشمند فارسی‌زبان بهره ببرید و هر روز اعتبار رایگان دریافت کنید!',
      title: 'هوش مصنوعی کلمه: چت جی پی تی ۵ رایگان، ChatGPT-5 فارسی و دستیار هوش مصنوعی ایرانی',
      shortName: 'کلمه'
    }
  }

  // Default to Okian for all other domains (including localhost, okian.ai, etc.)
  return {
    brandName: 'اُکیان',
    logo: '/okian-logo.svg',
    favicon: '/okian-favicon.ico',
    appleTouchIcon: '/okian-logo.svg',
    siteName: 'اوکیان هوش مصنوعی',
    description: 'با اوکیان هوش مصنوعی قدرت هوش مصنوعی پیشرفته را تجربه کنید. با مدل‌های پیشرفته چت کنید، تصاویر تولید کنید و از دستیار هوشمند بهره ببرید.',
    title: 'اوکیان هوش مصنوعی: پلتفرم پیشرفته هوش مصنوعی و چت جی پی تی',
    shortName: 'اوکیان'
  }
}

// Client-side hook for dynamic content
export function useDynamicContent(): DynamicContent {
  if (typeof window === 'undefined') {
    return getDynamicContent('okian.ai') // Default to Okian for SSR
  }
  
  const hostname = window.location.hostname
  const domain = hostname.replace(/^www\./, '')
  return getDynamicContent(domain)
}
