import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { AppConfig } from '@/utils/AppConfig';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, chatId } = body;

    console.log('Incoming POST /api/chat/messages body:', body);

    if (!text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Call external API to create message
    const outgoingBody = {
      prompt: text,
      chatId,
      modelType: body.modelType || 'gpt-4',
      subModel: 'gpt4_standard',
    };
    
    const response = await fetch(`${AppConfig.baseApiUrl}/process-text`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify(outgoingBody),
    });
    
    const data = await response.json();
    console.log('Response from external API:', data, 'Status:', response.status);
    
    if (!response.ok) {
      console.error('External API error:', data, 'Status:', response.status);
      return NextResponse.json(
        { error: data.error || data.message || 'خطا در ثبت پیام', details: data, status: response.status }, 
        { status: response.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatCode = req.nextUrl.searchParams.get('chatCode');
    const limit = req.nextUrl.searchParams.get('limit') || '20';
    const order = req.nextUrl.searchParams.get('order') || 'desc';

    if (!chatCode) {
      return NextResponse.json({ error: 'Missing chatCode parameter' }, { status: 400 });
    }

    const apiRes = await fetch(
      `${AppConfig.baseApiUrl}/chatHistory?chatCode=${encodeURIComponent(chatCode)}&limit=${limit}&order=${order}`,
      {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      }
    );

    if (!apiRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: apiRes.status });
    }
    
    const data = await apiRes.json();
    console.log('Chat history data:', data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message }, 
      { status: 500 }
    );
  }
} 