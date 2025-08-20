import { NextResponse } from 'next/server'
import { cacheManager } from '@/utils/cacheManager'
import { AppConfig } from '@/utils/AppConfig'

const CACHE_KEY = 'help-content'
const CACHE_TTL = 600 // 10 minutes in seconds

async function fetchHelpContentFromUpstream() {
  const response = await fetch(`${AppConfig.baseApiUrl}/help`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch help content')
  }

  const data = await response.json()
  
  // Defensive: ensure the structure is as expected
  if (!data.success || !data.help || !Array.isArray(data.help)) {
    throw new Error('Invalid response structure from upstream')
  }

  // Extract text content from each object and join them
  const helpTexts = data.help.map((item: { text?: string }) => item.text || '').filter(Boolean)
  return helpTexts.join('\n\n')
}

export async function GET() {
  try {
    let helpContent = cacheManager.get(CACHE_KEY)
    
    if (!helpContent) {
      helpContent = await fetchHelpContentFromUpstream()
      cacheManager.set(CACHE_KEY, helpContent, CACHE_TTL)
    }

    return NextResponse.json({
      content: helpContent,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching help content:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات' },
      { status: 500 }
    )
  }
} 