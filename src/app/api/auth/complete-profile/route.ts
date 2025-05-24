import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
) {
  try {
    // You'll need to extract phoneNumber from the request
    const body = await request.json();
    const mobile = body.mobile;
    const activeCode = body.activeCode;
    const name = body.name;
    const email = body.email;
    const password = body.password;
    const referralCode = body.referralCode;
    const response = await fetch('https://api.talaat.ir/v1/auth/completeProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile, activeCode, name, email, password, referralCode }),
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
