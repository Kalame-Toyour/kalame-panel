import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mobile = body.mobile;

    if (!mobile || typeof mobile !== 'string' || !/^\d{11}$/.test(mobile)) {
      return NextResponse.json(
        { error: 'پارامتر mobile الزامی است و باید ۱۱ رقم باشد.' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.kalame.chat/auth/sendVerificationCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'connection': 'close',
      },
      body: JSON.stringify({ mobile }),
      signal: (() => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 7000);
        return controller.signal;
      })(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error processing request:`, error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
} 