import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch('https://api.kalame.chat/v1/kariz/getMedia', {
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 