import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { AppConfig } from '@/utils/AppConfig';

const ALLOWED_TYPES = [
  'audio/flac', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/mpga', 'audio/m4a', 'audio/ogg', 'audio/wav', 'audio/webm',
  'video/mp4', 'video/webm',
];
const MAX_SIZE = 30 * 1024 * 1024; // 30MB

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'فرمت ارسال فایل صحیح نیست.' }, { status: 400 });
    }
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'فایل ارسال نشده است.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'فرمت فایل مجاز نیست.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'حجم فایل نباید بیشتر از ۳۰ مگابایت باشد.' }, { status: 400 });
    }
    // Prepare for upstream
    const upstreamForm = new FormData();
    upstreamForm.append('file', file, file.name);
    const res = await fetch(`${AppConfig.baseApiUrl}/speech-to-text`, {
      method: 'POST',
      body: upstreamForm,
    });
    const data = await res.json();
    if (!res.ok || !data.text) {
      return NextResponse.json({ error: data.error || 'خطا در تبدیل گفتار به متن' }, { status: 500 });
    }
    return NextResponse.json({ text: data.text });
  } catch {
    return NextResponse.json({ error: 'خطا در ارتباط با سرور' }, { status: 500 });
  }
} 