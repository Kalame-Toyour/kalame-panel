import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { AppConfig } from '@/utils/AppConfig'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current credit from server
    const response = await fetch(`${AppConfig.baseApiUrl}/user/credit`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch credit' }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      credit: data.credit,
      success: true
    })
  } catch (error) {
    console.error('Error fetching credit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 