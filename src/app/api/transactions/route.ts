import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { AppConfig } from '@/utils/AppConfig'

export async function GET(request: NextRequest) {
  try {
    // بررسی احراز هویت
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'احراز هویت مورد نیاز است' },
        { status: 401 }
      )
    }

    // دریافت پارامترها از URL
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // بررسی صحت پارامترها
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'شناسه کاربر الزامی است' },
        { status: 400 }
      )
    }

    // بررسی اینکه کاربر در حال درخواست تراکنش‌های خودش است
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'دسترسی غیرمجاز' },
        { status: 403 }
      )
    }

    // محدود کردن limit به حداکثر 50
    const validLimit = Math.min(Math.max(limit, 1), 50)
    const validPage = Math.max(page, 1)

    // فراخوانی API خارجی برای دریافت تراکنش‌ها
    const response = await fetch(
      `https://api.kalame.chat/payment/getUserTransactions?userId=${userId}&page=${validPage}&limit=${validLimit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText)
      return NextResponse.json(
        { success: false, error: 'خطا در دریافت تراکنش‌ها از سرور خارجی' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('External API Response:', data)

    // بررسی ساختار پاسخ
    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error || 'خطا در دریافت تراکنش‌ها' },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'خطای سرور' },
      { status: 500 }
    )
  }
}
