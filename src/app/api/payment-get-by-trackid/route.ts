import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { track_id } = await req.json()
    if (!track_id) {
      return NextResponse.json({ error: 'Missing track_id' }, { status: 400 })
    }
    const res = await fetch('https://api.kalame.chat/payment/getPaymentByTrackId', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ track_id })
    })
    const data = await res.json()
    if (!res.ok || !data.payment) {
      return NextResponse.json({ error: data.error || 'خطا در دریافت اطلاعات پرداخت' }, { status: 500 })
    }
    return NextResponse.json({ payment: data.payment })
  } catch (err) {
    return NextResponse.json({ error: 'خطا در ارتباط با سرور پرداخت', details: String(err) }, { status: 500 })
  }
} 