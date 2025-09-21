import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { AppConfig } from '@/utils/AppConfig';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Generate Image Request Body:', body);

    const response = await fetch(`${AppConfig.baseApiUrl}/generate-image-replicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify(body),
      // Set a longer timeout for image generation (5 minutes)
      signal: AbortSignal.timeout(300000), // 5 minutes in milliseconds
    });
    
    console.log('External API Response Status:', response.status);
    const data = await response.json();
    console.log('External API Response Data:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Generate Image Error:', error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ 
        success: false, 
        errorType: 'timeout_error',
        error: 'درخواست شما بیش از حد انتظار طول کشید. لطفاً دوباره تلاش کنید.',
        message: 'درخواست شما بیش از حد انتظار طول کشید. لطفاً دوباره تلاش کنید.'
      }, { status: 408 });
    }
    
    // Handle abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ 
        success: false, 
        errorType: 'request_cancelled',
        error: 'درخواست لغو شد.',
        message: 'درخواست لغو شد.'
      }, { status: 499 });
    }
    
    return NextResponse.json({ 
      success: false, 
      errorType: 'server_error',
      error: 'خطا در ارتباط با سرور.',
      message: 'خطا در ارتباط با سرور.'
    }, { status: 500 });
  }
} 