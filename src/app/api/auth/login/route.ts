import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;
    if (!phone || !password) {
      return NextResponse.json({ error: 'شماره موبایل و رمز عبور الزامی است.' }, { status: 400 });
    }

    const response = await fetch('https://api.kalame.chat/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: phone, pass: password }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'خطا در ورود' }, { status: 401 });
    }

    // اینجا می‌توانید توکن را در کوکی ست کنید یا فقط به کلاینت برگردانید
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
} 