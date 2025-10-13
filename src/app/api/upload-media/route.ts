import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { env } from '../../../../loadEnv';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const chatId = formData.get('chatId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isPDF = ALLOWED_PDF_TYPES.includes(file.type);

    if (!isImage && !isPDF) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDFs are allowed' },
        { status: 400 }
      );
    }

    // Check if backend upload is enabled
    const enableBackendUpload = 'true';
    const backendUrl = 'https://api.kalame.chat/kariz';

    if (enableBackendUpload) {
      try {
        const backendFormData = new FormData();
        backendFormData.append('file', file);
        backendFormData.append('chatId', chatId);

        console.log('Forwarding upload to backend:', {
          backendUrl: `${backendUrl}/upload-media`,
          userId: session.user.id,
          chatId,
          filename: file.name,
          size: file.size
        });

        const backendResponse = await fetch(`${backendUrl}/upload-media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
          body: backendFormData,
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(30000), // 10 seconds timeout
        });

        if (!backendResponse.ok) {
          const errorData = await backendResponse.json();
          console.error('Backend upload error:', errorData);
          throw new Error(errorData.error || 'Backend upload failed');
        }

        const result = await backendResponse.json();
        console.log('Backend upload success:', result);

        return NextResponse.json(result);

      } catch (backendError) {
        console.warn('Backend upload failed, falling back to local storage:', backendError);
        // Continue to local storage fallback
      }
    } else {
      console.log('Backend upload disabled, using local storage');
    }
    
    // Local storage fallback (always executed if backend is disabled or fails)
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}_${randomString}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Save file locally
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Generate public URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const publicUrl = `${baseUrl}/uploads/${filename}`;

    // Determine file type
    const fileType = isImage ? 'image' : 'pdf';

    console.log('Local upload success:', {
      url: publicUrl,
      type: fileType,
      filename: file.name,
      size: file.size
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      type: fileType,
      filename: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}