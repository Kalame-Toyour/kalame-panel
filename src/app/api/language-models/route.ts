import { NextResponse } from 'next/server';
import { cacheManager } from '@/utils/cacheManager';
import { AppConfig } from '@/utils/AppConfig';
// import { auth } from '@/auth';


const CACHE_KEY = 'language-models';
const CACHE_TTL = 600; // 10 minutes in seconds

async function fetchLanguageModelsFromUpstream(type?: string | null) {

  // const session = await auth();
  // if (!session?.user?.id) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

    const url = new URL(`${AppConfig.baseApiUrl}/language-models`);
    if (type) {
      url.searchParams.set('type', type);
    }
    const response = await fetch(url.toString(), {

    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 'Authorization': `Bearer ${session.user.accessToken}`/
    },
    });
  if (!response.ok) {
    throw new Error('Failed to fetch language models');
  }
  const data = await response.json();
  // Defensive: ensure the structure is as expected
  if (!data.models || !Array.isArray(data.models)) {
    throw new Error('Invalid response structure from upstream');
  }
  // Return only the array of models
  return data.models;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const cacheKey = `${CACHE_KEY}:${type || 'all'}`;

    let models = cacheManager.get(cacheKey);
    if (!models) {
      models = await fetchLanguageModelsFromUpstream(type);
      cacheManager.set(cacheKey, models, CACHE_TTL);
    }
    return NextResponse.json({ models });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 