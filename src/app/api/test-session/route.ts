import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });

    console.log('Test Session API - Token:', {
      hasToken: !!token,
      tokenId: token?.id,
      tokenName: token?.name,
      accessToken: token?.accessToken ? 'present' : 'missing',
      refreshToken: token?.refreshToken ? 'present' : 'missing',
      expiresAt: token?.expiresAt,
      error: token?.error,
    });

    return NextResponse.json({
      success: true,
      hasToken: !!token,
      token: token ? {
        id: token.id,
        name: token.name,
        hasAccessToken: !!token.accessToken,
        hasRefreshToken: !!token.refreshToken,
        expiresAt: token.expiresAt,
        error: token.error,
      } : null,
      headers: {
        host: request.headers.get('host'),
        'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
        'x-forwarded-host': request.headers.get('x-forwarded-host'),
      },
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error('Test Session API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 