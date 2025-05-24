import { NextRequest, NextResponse } from 'next/server';
import fetchWithAuthServer from '../_utils/fetchWithAuthServer';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userID = searchParams.get('userID');
  if (!userID) {
    return NextResponse.json({ error: 'userID is required' }, { status: 400 });
  }
  const incomingAuth = req.headers.get('authorization');
  const talaatRes = await fetchWithAuthServer(`https://api.talaat.ir/v1/kariz/chats?userID=${userID}`, {
    method: 'GET',
    headers: {
      ...(incomingAuth ? { Authorization: incomingAuth } : {}),
    },
  });
  let data = {};
  const contentType = talaatRes.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await talaatRes.json();
    } catch {
      data = { error: 'Invalid JSON from upstream', status: talaatRes.status };
    }
  } else {
    data = { error: 'No JSON response from upstream', status: talaatRes.status };
  }
  return NextResponse.json(data, { status: talaatRes.status });
} 

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Try to get the access token from the incoming request headers
  const incomingAuth = req.headers.get('authorization');
  let accessToken = '';
  if (incomingAuth && incomingAuth.startsWith('Bearer ')) {
    accessToken = incomingAuth;
  } else if (body.accessToken) {
    accessToken = `Bearer ${body.accessToken}`;
  }

  const talaatRes = await fetchWithAuthServer('https://api.talaat.ir/v1/kariz/createChat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: accessToken } : {}),
    },
    body: JSON.stringify(body),
  });

  let data = {};
  const contentType = talaatRes.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await talaatRes.json();
    } catch {
      data = { error: 'Invalid JSON from upstream', status: talaatRes.status };
    }
  } else {
    data = { error: 'No JSON response from upstream', status: talaatRes.status };
  }
  return NextResponse.json(data, { status: talaatRes.status });
} 