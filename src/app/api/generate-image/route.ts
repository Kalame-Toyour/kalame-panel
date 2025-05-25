import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Generate Image Request Body:', body);

    const response = await fetch('https://api.kalame.chat/v1/kariz/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify(body),
    });
    
    console.log('External API Response Status:', response.status);
    const data = await response.json();
    console.log('External API Response Data:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Generate Image Error:', error);
    return NextResponse.json({ success: false, error: 'خطا در ارتباط با سرور.' }, { status: 500 });
  }
} 