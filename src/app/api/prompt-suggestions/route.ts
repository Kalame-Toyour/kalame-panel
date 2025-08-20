import { NextResponse } from 'next/server'
import { cacheManager } from '@/utils/cacheManager'
import { AppConfig } from '@/utils/AppConfig'

export interface PromptSuggestion {
  id: string
  title: string
  icon: string // icon image URL
  prompt: string
  color: string // Tailwind gradient color
}

const CACHE_KEY = 'prompt-suggestions'
const CACHE_TTL = 600 // 10 minutes in seconds

async function fetchPromptSuggestionsFromUpstream() {
  const response = await fetch(`${AppConfig.baseApiUrl}/promptSuggestions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch prompt suggestions')
  }

  const data = await response.json()
  
  // Defensive: ensure the structure is as expected
  if (!data.success || !data.suggestions || !Array.isArray(data.suggestions)) {
    throw new Error('Invalid response structure from upstream')
  }

  // Handle both direct suggestion objects and objects with text properties
  const suggestions = data.suggestions.map((item: { text?: string; id?: string; title?: string; icon?: string; prompt?: string; color?: string }) => {
    // If item has a text property, parse it as JSON or use as is
    if (item.text) {
      try {
        return typeof item.text === 'string' ? JSON.parse(item.text) : item.text
      } catch {
        // If parsing fails, return the text as a simple suggestion
        return {
          id: item.id || 'default',
          title: 'پیشنهاد',
          icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135679.png',
          prompt: item.text,
          color: 'from-blue-400 to-cyan-400'
        }
      }
    }
    // If item is already a suggestion object, return it as is
    return item
  })

  return suggestions
}

export async function GET() {
  try {
    let suggestions = cacheManager.get(CACHE_KEY)
    
    if (!suggestions) {
      suggestions = await fetchPromptSuggestionsFromUpstream()
      cacheManager.set(CACHE_KEY, suggestions, CACHE_TTL)
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error fetching prompt suggestions:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت پیشنهادات' },
      { status: 500 }
    )
  }
} 