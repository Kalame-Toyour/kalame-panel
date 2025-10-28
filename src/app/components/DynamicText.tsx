'use client'

import { useDynamicContent } from '@/utils/dynamicContent'

interface DynamicTextProps {
  children: string
  className?: string
}

export default function DynamicText({ children, className = '' }: DynamicTextProps) {
  const content = useDynamicContent()

  // Map of text replacements based on current brand
  const getDisplayText = (text: string) => {
    if (content.brandName === 'اُکیان') {
      // Replace "کلمه" with "اوکیان" for Okian brand
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
