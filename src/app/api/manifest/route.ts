import { NextRequest, NextResponse } from 'next/server'
import { getDynamicContent } from '@/utils/dynamicContent'

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || 'okian.ai'
  const domain = host.replace(/^www\./, '')
  const content = getDynamicContent(domain)

  const manifest = {
    name: content.siteName,
    short_name: content.shortName,
    description: content.description,
    start_url: `https://${domain}/`,
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    lang: 'fa',
    dir: 'rtl',
    icons: [
      {
        src: content.logo,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: content.logo,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    categories: ['productivity', 'utilities', 'education'],
    screenshots: [
      {
        src: content.logo,
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide'
      }
    ]
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
