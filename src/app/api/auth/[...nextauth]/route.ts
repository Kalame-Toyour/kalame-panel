import type { NextRequest } from 'next/server';
import { GET as AuthGET, POST as AuthPOST } from '@/auth';
import { NextResponse } from 'next/server';

// Pre-initialize the database before handling auth routes
export async function GET(request: NextRequest) {
  try {
    // Try to initialize the database, but continue even if it fails
    // try {
    //   await initializeDB();
    // } catch (error) {
    //   console.error('Database initialization failed:', error);
    //   // Continue without database
    // }
    return await AuthGET(request);
  } catch (error) {
    console.error('Auth GET handler error:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Try to initialize the database, but continue even if it fails
    // try {
    //   await initializeDB();
    // } catch (error) {
    //   console.error('Database initialization failed:', error);
    //   // Continue without database
    // }
    return await AuthPOST(request);
  } catch (error) {
    console.error('Auth POST handler error:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 },
    );
  }
}
