'use client'

import { useSite } from '@/contexts/SiteContext'
import { useEffect } from 'react'

export default function DynamicStyles() {
  const { currentSite } = useSite()

  useEffect(() => {
    if (!currentSite) return


    // Create or update CSS variables based on the current site
    const root = document.documentElement
    const body = document.body
    
    if (currentSite.url === 'https://okian.ai' || currentSite.url.includes('localhost') || currentSite.url.includes('127.0.0.1')) {
      // Set Okian.ai specific colors (#7700e8)
      root.style.setProperty('--primary', '270 100% 45%') // #7700e8 in HSL
      root.style.setProperty('--primary-foreground', '0 0% 100%')
      root.style.setProperty('--primary-hover', '270 100% 40%')
      root.style.setProperty('--primary-light', '270 100% 95%')
      root.style.setProperty('--accent', '270 100% 45%')
      root.style.setProperty('--accent-foreground', '0 0% 100%')
      root.style.setProperty('--ring', '270 100% 45%')
      // Set data-brand attribute for CSS targeting
      body.setAttribute('data-brand', 'okian')
    } else {
      // Reset to default colors for kalame.chat
      root.style.setProperty('--primary', '221 83% 53%') // #2563eb in HSL
      root.style.setProperty('--primary-foreground', '210 20% 98%')
      root.style.setProperty('--primary-hover', '221 83% 47%')
      root.style.setProperty('--primary-light', '221 83% 96%')
      root.style.setProperty('--accent', '221 83% 53%')
      root.style.setProperty('--accent-foreground', '220.9 39.3% 11%')
      root.style.setProperty('--ring', '221 83% 53%')
      // Set data-brand attribute for CSS targeting
      body.setAttribute('data-brand', 'kalame')
    }
  }, [currentSite])

  return null
}
