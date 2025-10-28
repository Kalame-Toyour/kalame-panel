import { useDynamicContent } from './dynamicContent'

export function useDynamicTranslations() {
  const content = useDynamicContent()

  const getDynamicText = (text: string): string => {
    if (content.brandName === 'اُکیان') {
      // Replace "کلمه" with "اوکیان" for Okian brand
      return text.replace(/کلمه/g, 'اوکیان')
    }
    
    return text
  }

  return { getDynamicText }
}

// Helper function for server-side usage
export function getDynamicTextServer(text: string, brandName: string): string {
  if (brandName === 'اُکیان') {
    // Replace "کلمه" with "اوکیان" for Okian brand
    return text.replace(/کلمه/g, 'اوکیان')
  }
  
  return text
}
