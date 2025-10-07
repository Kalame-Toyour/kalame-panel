'use client'

import { useSite } from '@/contexts/SiteContext'

export default function DynamicMetadata() {
  const { currentSite } = useSite()

  if (!currentSite) {
    return null
  }

  return (
    <>
      {/* Google Site Verification */}
      <meta name="google-site-verification" content={currentSite.googleVerification} />
      
      {/* Theme Color */}
      <meta name="theme-color" content={currentSite.themeColor} />
      
      {/* Favicon */}
      <link rel="icon" href={currentSite.favicon} />
      <link rel="apple-touch-icon" href={currentSite.logo} />
    </>
  )
}
