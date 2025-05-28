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
    const { prompt, modelType, subModel, chatId, voice } = body;
    // Prepare payload for upstream API
    const payload: Record<string, unknown> = { prompt, modelType, subModel, chatId };
    if (voice) payload.voice = voice;
    const res = await fetch(`${AppConfig.baseApiUrl}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    // Accept both 'audioUrl' and 'url' from upstream
    let audioUrl = data.audioUrl || data.url;
    if (!res.ok || !audioUrl) throw new Error('آدرس فایل صوتی دریافت نشد');
    // If audioUrl is relative, prepend mediaBaseUrl
    if (audioUrl.startsWith('/')) {
      audioUrl = AppConfig.mediaBaseUrl.replace(/\/$/, '') + audioUrl;
    }
    return NextResponse.json({ audioUrl });
  } catch {
    return NextResponse.json({ error: 'خطا در تبدیل متن به گفتار' }, { status: 500 });
  }
} 