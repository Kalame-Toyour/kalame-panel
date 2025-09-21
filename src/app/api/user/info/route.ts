import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AppConfig } from '@/utils/AppConfig';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching user info for userId:', session.user.id);

    // Call getUserInfo API from backend
    const response = await fetch(`${AppConfig.baseApiUrl}/user/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch user info:', response.status, response.statusText);
      return NextResponse.json({ 
        error: 'Failed to fetch user info',
        status: response.status 
      }, { status: response.status });
    }

    const userData = await response.json();
    console.log('User info response:', userData);

    // Return the updated user data
    return NextResponse.json({
      success: true,
      user: userData,
      message: 'User info updated successfully'
    });

  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { forceRefresh } = await req.json().catch(() => ({}));
    
    console.log('Updating user info for userId:', session.user.id, 'forceRefresh:', forceRefresh);

    // Call getUserInfo API from backend
    const response = await fetch(`${AppConfig.baseApiUrl}/getUserInfo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch user info:', response.status, response.statusText);
      return NextResponse.json({ 
        error: 'Failed to fetch user info',
        status: response.status 
      }, { status: response.status });
    }

    const userData = await response.json();
    console.log('User info response:', userData);

    // Extract user info from the response structure
    const userInfo = userData.userInfo || userData;
    
    // Return the updated user data with session update instructions
    return NextResponse.json({
      success: true,
      user: userInfo,
      sessionUpdate: {
        userType: userInfo.user_type || 'free',
        credit: userInfo.credit,
        username: userInfo.fname || userInfo.username,
        expireAt: userInfo.expireAt,
      },
      message: 'User info updated successfully'
    });

  } catch (error) {
    console.error('Error updating user info:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
