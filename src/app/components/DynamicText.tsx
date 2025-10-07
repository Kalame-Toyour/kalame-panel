'use client'

import { useSite } from '@/contexts/SiteContext'

interface DynamicTextProps {
  children: string
  className?: string
}

export default function DynamicText({ children, className = '' }: DynamicTextProps) {
  const { currentSite } = useSite()

  // Map of text replacements based on current site
  const getDisplayText = (text: string) => {
    if (!currentSite) return text
    
    if (currentSite.url === 'https://okian.ai') {
      // Replace "کلمه" with "اوکیان" for Okian.ai
      return text.replace(/کلمه/g, 'اوکیان')
    }
    
    return text
  }

  return (
    <span className={className}>
      {getDisplayText(children)}
    </span>
  )
}
