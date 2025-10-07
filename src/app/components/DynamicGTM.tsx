'use client'

import { useSite } from '@/contexts/SiteContext'

export default function DynamicGTM() {
  const { currentSite } = useSite()

  if (!currentSite) {
    return null
  }

  return (
    <>
      {/* Google Tag Manager Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${currentSite.gtmId}');`,
        }}
      />
    </>
  )
}

export function DynamicGTMNoScript() {
  const { currentSite } = useSite()

  if (!currentSite) {
    return null
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${currentSite.gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
