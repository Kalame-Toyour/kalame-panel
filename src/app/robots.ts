import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getDynamicContent } from '@/utils/dynamicContent'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const host = headersList.get('host') || 'okian.ai'
  const domain = host.replace(/^www\./, '')
  const content = getDynamicContent(domain)
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/private/',
      ],
    },
    sitemap: `https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}/sitemap.xml`,
  }
}
