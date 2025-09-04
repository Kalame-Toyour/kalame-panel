import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
    const session = await auth();
    const { packageID, userId } = await req.json()
    
    // Allow unauthenticated requests only if userId is provided (for gift purchases)
    if (!session?.user?.id && !userId) {
      console.log('Unauthorized request - no session and no userId provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userId && !session?.user?.id) {
      console.log('Gift purchase request for userId:', userId, '- proceeding without authentication');
    }
    
  try {
    if (!packageID) {
      return NextResponse.json({ error: 'Missing package ID' }, { status: 400 })
    }
    
    // Prepare request body
    const requestBody: { packageID: number; userId?: string } = { packageID }
    if (userId) {
      requestBody.userId = userId
      console.log('Payment request for userId:', userId)
    }
    
    // Prepare headers - use session token if available, otherwise use a system token for gift purchases
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (session?.user?.accessToken) {
      headers['Authorization'] = `Bearer ${session.user.accessToken}`
    } else if (userId) {
      // For gift purchases without authentication, we might need a system token
      // You may need to replace this with your actual system token or handle this differently
      headers['Authorization'] = `Bearer ${process.env.SYSTEM_ACCESS_TOKEN || 'system-token'}`
    }
    
    const res = await fetch('https://api.kalame.chat/payment/requestPayment', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })
    const data = await res.json()
    if (!res.ok || !data.payment) {
      return NextResponse.json({ error: data.error || 'خطا در دریافت لینک پرداخت' }, { status: 500 })
    }
    return NextResponse.json({ payment: data.payment })
  } catch (err) {
    console.error('[API] Exception:', err)
    return NextResponse.json({ error: 'خطا در ارتباط با سرور پرداخت', details: String(err) }, { status: 500 })
  }
} 