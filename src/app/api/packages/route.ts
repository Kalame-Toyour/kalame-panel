import { NextResponse } from 'next/server'
import { AppConfig } from '@/utils/AppConfig'
import { auth } from '@/auth'

export async function GET() {
  // const session = await auth();
  // if (!session?.user?.id) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }
  try {
    console.log('[API] Proxying GET to', `${AppConfig.baseApiUrl}/packages`)
    const response = await fetch(`${AppConfig.baseApiUrl}/packages`, {
      method: 'GET',
      headers: {
        // 'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      }
    })
    console.log('[API] Response status:', response.status)
    if (!response.ok) {
      const text = await response.text()
      console.error('[API] Error response:', text)
      return NextResponse.json({ error: 'Failed to fetch packages', details: text }, { status: response.status })
    }
    const data = await response.json()
    console.log('[API] Success, data:', data)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[API] Exception:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
} 