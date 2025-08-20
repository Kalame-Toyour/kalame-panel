import { NextResponse } from 'next/server'
import { cacheManager } from '@/utils/cacheManager'
import { AppConfig } from '@/utils/AppConfig'

const CACHE_KEY = 'about-content'
const CACHE_TTL = 600 // 10 minutes in seconds

async function fetchAboutContentFromUpstream() {
  const response = await fetch(`${AppConfig.baseApiUrl}/about`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch about content')
  }

  const data = await response.json()
  
  // Defensive: ensure the structure is as expected
  if (!data.success || !data.about || !Array.isArray(data.about)) {
    throw new Error('Invalid response structure from upstream')
  }

  // Extract text content from each object and join them
  const aboutTexts = data.about.map((item: { text?: string }) => item.text || '').filter(Boolean)
  return aboutTexts.join('\n\n')
}

export async function GET() {
  try {
    let aboutContent = cacheManager.get(CACHE_KEY)
    
    if (!aboutContent) {
      aboutContent = await fetchAboutContentFromUpstream()
      cacheManager.set(CACHE_KEY, aboutContent, CACHE_TTL)
    }

    return NextResponse.json({
      content: aboutContent,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching about content:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات' },
      { status: 500 }
    )
  }
} 