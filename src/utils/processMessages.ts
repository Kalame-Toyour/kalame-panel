import { getDynamicContent } from './dynamicContent'

export function processMessagesWithDynamicContent(messages: any, domain?: string) {
  const content = getDynamicContent(domain)
  
  // Deep clone the messages to avoid mutating the original
  const processedMessages = JSON.parse(JSON.stringify(messages))
  
  // Function to recursively process nested objects
  const processObject = (obj: any): any => {
    if (typeof obj === 'string') {
      if (content.brandName === 'اُکیان') {
        return obj.replace(/کلمه/g, 'اوکیان')
      }
      return obj
    }
    
    if (Array.isArray(obj)) {
      return obj.map(processObject)
    }
    
    if (obj && typeof obj === 'object') {
      const processed: any = {}
      for (const [key, value] of Object.entries(obj)) {
        processed[key] = processObject(value)
      }
      return processed
    }
    
    return obj
  }
  
  return processObject(processedMessages)
}
