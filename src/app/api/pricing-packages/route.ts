import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for pricing packages
    return NextResponse.json({
      packages: [
        {
          ID: 1,
          title: 'Pro',
          price: 19.99,
          newPrice: 14.99,
          discountPercent: 25,
          shortDesc: 'برای معامله‌گران حرفه‌ای',
          description: 'دسترسی کامل به ابزارهای معاملاتی و تحلیل پیشرفته.',
          tokenNumber: 3000,
        },
        {
          ID: 2,
          title: 'Enterprise',
          price: 49.99,
          newPrice: 39.99,
          discountPercent: 20,
          shortDesc: 'برای تیم‌های حرفه‌ای',
          description: 'امکانات ویژه برای تیم‌های بزرگ و سازمانی.',
          tokenNumber: 10000,
        },
      ],
      usageHelp: {
        title: 'چت ساده',
        usage: '1 توکن',
      },
      faq: {
        title: 'سوالات متداول',
        desc: 'در این بخش به سوالات پرتکرار شما پاسخ داده شده است.',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 