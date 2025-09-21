import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { code, userId } = await req.json()
    
    if (!code || !code.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'لطفاً کد تخفیف را وارد کنید' 
      }, { status: 400 })
    }
    
    // Determine userId to use
    let finalUserId = userId;
    if (!finalUserId && session?.user?.id) {
      finalUserId = session.user.id;
    }
    
    if (!finalUserId) {
      return NextResponse.json({ 
        success: false, 
        message: 'برای استفاده از کد تخفیف باید وارد اکانت خود شوید' 
      }, { status: 401 })
    }
    
    // Prepare request body
    const requestBody = { code: code.trim(), userId: finalUserId }
    
    // Prepare headers - use session token if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (session?.user?.accessToken) {
      headers['Authorization'] = `Bearer ${session.user.accessToken}`
    }
    
    console.log('Checking discount code:', code, 'for userId:', finalUserId)
    
    const res = await fetch('https://api.kalame.chat/payment/checkDiscount', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })
    
    const data = await res.json()
    console.log('Discount check response:', data)
    
    if (!res.ok) {
      return NextResponse.json({ 
        success: false, 
        message: data.message || 'کد تخفیف نامعتبر است' 
      }, { status: 400 })
    }
    
    if (data.success) {
      return NextResponse.json({ 
        success: true, 
        message: data.message || 'کد تخفیف با موفقیت اعمال شد',
        discountId: data.discount.ID,
        discount_percent: data.discount.discount_percent || 0
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: data.message || 'کد تخفیف نامعتبر است' 
      }, { status: 400 })
    }
    
  } catch (err) {
    console.error('[API] Discount check exception:', err)
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در بررسی کد تخفیف', 
      details: String(err) 
    }, { status: 500 })
  }
}
