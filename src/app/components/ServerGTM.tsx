import { headers } from 'next/headers'

export default async function ServerGTM() {
  const headersList = await headers()
  const host = headersList.get('host') || 'kalame.chat'
  const domain = host.replace(/^www\./, '')
  
  const gtmId = domain === 'okian.ai' ? 'GTM-NCWJ2BL5' : 'GTM-NZRSLF3P'

  return (
    <>
      {/* Google Tag Manager Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
        }}
      />
    </>
  )
}

export async function ServerGTMNoScript() {
  const headersList = await headers()
  const host = headersList.get('host') || 'kalame.chat'
  const domain = host.replace(/^www\./, '')
  
  const gtmId = domain === 'okian.ai' ? 'GTM-NCWJ2BL5' : 'GTM-NZRSLF3P'

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
