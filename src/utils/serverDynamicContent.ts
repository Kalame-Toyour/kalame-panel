import { headers } from 'next/headers'
import { getDynamicContent, type DynamicContent } from './dynamicContent'

export async function getServerDynamicContent(): Promise<DynamicContent> {
  const headersList = await headers()
  const host = headersList.get('host') || 'okian.ai'
  const domain = host.replace(/^www\./, '')
  return getDynamicContent(domain)
}
