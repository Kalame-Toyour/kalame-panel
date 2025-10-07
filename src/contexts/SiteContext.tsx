'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface SiteConfig {
  name: string
  url: string
  gtmId: string
  googleVerification: string
  logo: string
  favicon: string
  themeColor: string
  metadata: {
    title: string
    description: string
    keywords: string[]
  }
}

const siteConfigs: Record<string, SiteConfig> = {
  'kalame.chat': {
    name: 'هوش مصنوعی کلمه',
    url: 'https://kalame.chat',
    gtmId: 'GTM-NZRSLF3P',
    googleVerification: 'google61a3ff9bd5a447a6',
    logo: '/kalame-logo.png',
    favicon: '/favicon.ico',
    themeColor: '#000000',
    metadata: {
      title: 'هوش مصنوعی کلمه: چت جی پی تی ۵ رایگان، ChatGPT-5 فارسی و دستیار هوش مصنوعی ایرانی',
      description: 'با هوش مصنوعی کلمه به صورت رایگان با قوی‌ترین مدل (ChatGPT) به فارسی چت کنید، عکس تولید کنید و از یک دستیار هوشمند فارسی‌زبان بهره ببرید و هر روز اعتبار رایگان دریافت کنید!',
      keywords: ['هوش مصنوعی', 'ChatGPT', 'چت جی پی تی', 'دستیار هوش مصنوعی', 'هوش مصنوعی فارسی', 'تولید عکس', 'چت رایگان', 'AI فارسی', 'ChatGPT-5', 'هوش مصنوعی ایرانی']
    }
  },
  'okian.ai': {
    name: 'اوکیان هوش مصنوعی',
    url: 'https://okian.ai',
    gtmId: 'GTM-NCWJ2BL5',
    googleVerification: 'googled2b7a47c05e2c4d2',
    logo: '/okian-logo.svg',
    favicon: '/okian-favicon.ico',
    themeColor: '#000000',
    metadata: {
      title: 'اوکیان هوش مصنوعی: پلتفرم پیشرفته هوش مصنوعی و چت جی پی تی',
      description: 'با اوکیان هوش مصنوعی قدرت هوش مصنوعی پیشرفته را تجربه کنید. با مدل‌های پیشرفته چت کنید، تصاویر تولید کنید و از دستیار هوشمند بهره ببرید.',
      keywords: ['هوش مصنوعی', 'اوکیان', 'ChatGPT', 'دستیار هوش مصنوعی', 'هوش مصنوعی فارسی', 'تولید تصویر', 'چت هوش مصنوعی', 'AI فارسی', 'پلتفرم هوش مصنوعی']
    }
  }
}

interface SiteContextType {
  currentSite: SiteConfig | null
  setCurrentSite: (site: SiteConfig | null) => void
  getSiteByDomain: (domain: string) => SiteConfig | null
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [currentSite, setCurrentSite] = useState<SiteConfig | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const site = getSiteByDomain(hostname)
      setCurrentSite(site)
    }
  }, [])

  const getSiteByDomain = (domain: string): SiteConfig | null => {
    // Handle both with and without www
    const cleanDomain = domain.replace(/^www\./, '')
    return siteConfigs[cleanDomain] || null
  }

  return (
    <SiteContext.Provider value={{ currentSite, setCurrentSite, getSiteByDomain }}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  const context = useContext(SiteContext)
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider')
  }
  return context
}
