'use client'

import { useSite } from '@/contexts/SiteContext'

export default function SiteInfo() {
  const { currentSite } = useSite()

  if (!currentSite) {
    return <div>Loading site configuration...</div>
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-2">Current Site Configuration</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Site Name:</strong> {currentSite.name}</p>
        <p><strong>URL:</strong> {currentSite.url}</p>
        <p><strong>GTM ID:</strong> {currentSite.gtmId}</p>
        <p><strong>Google Verification:</strong> {currentSite.googleVerification}</p>
        <p><strong>Logo:</strong> {currentSite.logo}</p>
        <p><strong>Favicon:</strong> {currentSite.favicon}</p>
      </div>
    </div>
  )
}
