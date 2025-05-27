import { NextResponse } from 'next/server';
import { AppConfig } from '@/utils/AppConfig';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { prompt, modelType, subModel, chatId } = body;
    // Prepare payload for upstream API
    const payload = { prompt, modelType, subModel, chatId };
    // If the upstream API supports 'voice', add it to payload
    // payload.voice = voice;
    const res = await fetch(`${AppConfig.baseApiUrl}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('خطا در ارتباط با سرویس گفتار');
    const data = await res.json();
    if (!data.url) throw new Error('آدرس فایل صوتی دریافت نشد');
    return NextResponse.json({ audioUrl: data.url });
  } catch {
    return NextResponse.json({ error: 'خطا در تبدیل متن به گفتار' }, { status: 500 });
  }
} 