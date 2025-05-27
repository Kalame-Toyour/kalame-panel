import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AppConfig } from '@/utils/AppConfig';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;
    if (!phone || !code) {
      return NextResponse.json({ error: 'شماره موبایل و کد تایید الزامی است.' }, { status: 400 });
    }

    const response = await fetch(`${AppConfig.authApiUrl}/loginWithCode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: phone, code }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'خطا در ورود با کد' }, { status: 401 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
} 