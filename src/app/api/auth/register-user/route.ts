import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
) {
  try {
    // You'll need to extract phoneNumber from the request
    const body = await request.json();
    console.log('register-user payload:', body);
    const mobile = body.mobile;
    const activeCode = body.activeCode;
    const fname = body.fname;
    const pass = body.pass;
    if (!mobile || !activeCode || !fname || !pass) {
      return NextResponse.json(
        { error: 'تمام پارامترها (mobile, activeCode, fname, password) الزامی هستند.' },
        { status: 400 }
      );
    }
    const response = await fetch('https://api.kalame.chat/v1/auth/registerUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile, activeCode, fname, pass }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(response);

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
