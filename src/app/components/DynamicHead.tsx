import { headers } from 'next/headers'
import { generateMetadata } from '@/utils/metadata'

export default async function DynamicHead() {
  const headersList = await headers()
  const host = headersList.get('host') || 'okian.ai'
  const domain = host.replace(/^www\./, '')
  
  const metadata = generateMetadata(domain)
  
  return (
    <>
      {/* Google Site Verification */}
      <meta name="google-site-verification" content={String(metadata.verification?.google || '')} />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#000000" />
      
      {/* Favicon */}
      <link rel="icon" href={domain === 'kalame.chat' ? '/favicon.ico' : '/okian-favicon.ico'} />
      <link rel="apple-touch-icon" href={domain === 'kalame.chat' ? '/kalame-logo.png' : '/okian-logo.svg'} />
    </>
  )
}
