import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

// Mock KarizModel - در پروژه واقعی باید از ماژول اصلی استفاده کنید
const KarizModel = {
  async getUserTransactions(userId: number, page: number = 1, limit: number = 10) {
    // محدود کردن limit به حداکثر 50
    const validLimit = Math.min(Math.max(limit, 1), 50)
    const validPage = Math.max(page, 1)
    
    // در اینجا باید با دیتابیس ارتباط برقرار کنید
    // این یک نمونه mock است
    
    // شبیه‌سازی تاخیر API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // داده‌های نمونه
    const mockTransactions = [
      {
        id: 1,
        packageId: 2,
        packageTitle: "پکیج طلایی",
        amount: 50000,
        tokenNumber: 1000,
        packagePrice: 50000,
        code: "ABC12345",
        trackId: "123456789",
        status: "verify",
        statusText: "موفق",
        gatewayStatus: 1,
        gatewayStatusText: "پرداخت شده",
        refNumber: "123456789012",
        cardNumber: "1234****5678",
        paidAt: "2024-01-15 10:30:00",
        createdAt: "2024-01-15 10:25:00"
      },
      {
        id: 2,
        packageId: 1,
        packageTitle: "پکیج نقره‌ای",
        amount: 25000,
        tokenNumber: 500,
        packagePrice: 25000,
        code: "DEF67890",
        trackId: "987654321",
        status: "verify",
        statusText: "موفق",
        gatewayStatus: 1,
        gatewayStatusText: "پرداخت شده",
        refNumber: "098765432109",
        cardNumber: "5678****1234",
        paidAt: "2024-01-10 15:20:00",
        createdAt: "2024-01-10 15:15:00"
      },
      {
        id: 3,
        packageId: 3,
        packageTitle: "پکیج پلاتینیوم",
        amount: 100000,
        tokenNumber: 2500,
        packagePrice: 100000,
        code: "GHI13579",
        trackId: "456789123",
        status: "error",
        statusText: "ناموفق",
        gatewayStatus: 0,
        gatewayStatusText: "پرداخت ناموفق",
        refNumber: "",
        cardNumber: "9876****4321",
        paidAt: "",
        createdAt: "2024-01-05 12:45:00"
      },
      {
        id: 4,
        packageId: 1,
        packageTitle: "پکیج نقره‌ای",
        amount: 25000,
        tokenNumber: 500,
        packagePrice: 25000,
        code: "JKL24680",
        trackId: "789123456",
        status: "pending",
        statusText: "در انتظار",
        gatewayStatus: 0,
        gatewayStatusText: "در حال پردازش",
        refNumber: "",
        cardNumber: "1111****2222",
        paidAt: "",
        createdAt: "2024-01-01 09:30:00"
      }
    ]
    
    // فیلتر کردن براساس userId (در اینجا همه تراکنش‌ها را برمی‌گردانیم)
    // در پیاده‌سازی واقعی، باید از userId برای فیلتر کردن تراکنش‌ها استفاده کنید
    const userTransactions = mockTransactions.filter(() => userId > 0) // استفاده از userId برای رفع خطای TypeScript
    
    // محاسبه pagination
    const totalItems = userTransactions.length
    const totalPages = Math.ceil(totalItems / validLimit)
    const startIndex = (validPage - 1) * validLimit
    const endIndex = startIndex + validLimit
    const transactions = userTransactions.slice(startIndex, endIndex)
    
    return {
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: validPage,
          totalPages,
          totalItems,
          itemsPerPage: validLimit,
          hasNextPage: validPage < totalPages,
          hasPrevPage: validPage > 1
        }
      }
    }
  }
}

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

    // دریافت تراکنش‌ها
    const result = await KarizModel.getUserTransactions(
      parseInt(userId),
      page,
      limit
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'خطای سرور' },
      { status: 500 }
    )
  }
}
