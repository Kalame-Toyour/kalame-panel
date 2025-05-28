import { NextResponse } from 'next/server';
import { cacheManager } from '@/utils/cacheManager';

// Mock upstream fetch function (replace with real fetch as needed)
async function fetchLanguageModelsFromUpstream() {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 100));
  // Example response
  return [
    { name: 'GPT-4o', icon: 'https://img.icons8.com/color/512/chatgpt.png', tokenCost: 0.03 },
    { name: 'GPT-3.5 Turbo', icon: 'https://img.icons8.com/color/512/chatgpt.png', tokenCost: 0.01 },
    { name: 'Claude', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.46.0/files/dark/claude-color.png', tokenCost: 0.02 },
    { name: 'Gemini', icon: 'https://www.pngall.com/wp-content/uploads/16/Google-Gemini-Logo-Transparent-thumb.png', tokenCost: 0.015 },
  ];
}

const CACHE_KEY = 'language-models';
const CACHE_TTL = 600; // 10 minutes in seconds

export async function GET() {
  // Try cache first
  let models = cacheManager.get(CACHE_KEY);
  if (!models) {
    models = await fetchLanguageModelsFromUpstream();
    cacheManager.set(CACHE_KEY, models, CACHE_TTL);
  }
  return NextResponse.json({ models });
} 