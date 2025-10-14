import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'دسترسی غیرمجاز. لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const chatId = formData.get('chatId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'فایلی انتخاب نشده است' },
        { status: 400 }
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'شناسه چت الزامی است' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'حجم فایل بیش از 10 مگابایت است' },
        { status: 400 }
      );
    }

    // Validate file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isPDF = ALLOWED_PDF_TYPES.includes(file.type);

    if (!isImage && !isPDF) {
      return NextResponse.json(
        { success: false, error: 'نوع فایل نامعتبر است. فقط تصاویر (JPEG, PNG, GIF, WebP) و فایل‌های PDF مجاز هستند' },
        { status: 400 }
      );
    }

    // Upload to backend server
    const backendUrl = 'https://api.kalame.chat/kariz';

    // Retry logic for upload
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const backendFormData = new FormData();
        backendFormData.append('file', file);
        backendFormData.append('chatId', chatId);

        console.log(`Upload attempt ${attempt}/${maxRetries} to backend:`, {
          backendUrl: `${backendUrl}/upload-media`,
          userId: session.user.id,
          chatId,
          filename: file.name,
          size: file.size
        });

        // Create AbortController for better timeout control
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

        const backendResponse = await fetch(`${backendUrl}/upload-media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
            'User-Agent': 'Kalame-Panel/1.0',
          },
          body: backendFormData,
          signal: controller.signal,
          // Add keepalive for better connection handling
          keepalive: true,
        });

        clearTimeout(timeoutId);

        if (!backendResponse.ok) {
          const errorData = await backendResponse.json().catch(() => ({}));
          console.error(`Backend upload error (attempt ${attempt}):`, {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
            error: errorData
          });
          
          // If it's a server error (5xx), retry
          if (backendResponse.status >= 500 && attempt < maxRetries) {
            console.log(`Retrying upload due to server error (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
            continue;
          }
          
          return NextResponse.json(
            { 
              success: false, 
              error: 'آپلود فایل ناموفق بود. لطفاً دوباره تلاش کنید.' 
            },
            { status: 500 }
          );
        }

        const result = await backendResponse.json();
        console.log('Backend upload success:', result);

        return NextResponse.json(result);

      } catch (backendError) {
        lastError = backendError as Error;
        console.error(`Backend upload failed (attempt ${attempt}):`, backendError);
        
        // If it's a network error and we have retries left, retry
        if (attempt < maxRetries && (
          backendError instanceof Error && (
            backendError.name === 'AbortError' ||
            backendError.message.includes('fetch failed') ||
            backendError.message.includes('timeout') ||
            backendError.message.includes('ECONNRESET') ||
            backendError.message.includes('ENOTFOUND')
          )
        )) {
          console.log(`Retrying upload due to network error (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
          continue;
        }
        
        // If we've exhausted retries or it's not a retryable error, return error
        break;
      }
    }

    // If we get here, all retries failed
    console.error('All upload attempts failed. Last error:', lastError);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در آپلود فایل. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.' 
      },
      { status: 500 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در آپلود فایل. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}