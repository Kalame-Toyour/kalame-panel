import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { AppConfig } from '@/utils/AppConfig'

export async function POST(req: Request) {
  try {
    const session = await auth()
    console.log('[notif/register-device] session?', !!session, 'user?', !!session?.user, 'hasAccessToken?', !!session?.user?.accessToken)
    if (!session?.user?.accessToken) {
      console.warn('[notif/register-device] Missing accessToken. Ensure user is logged in before registering device.')
      return NextResponse.json({ error: 'Unauthorized', reason: 'missing_access_token' }, { status: 401 })
    }

    const clientBody: Record<string, unknown> = await req.json()
    const headers = new Headers(req.headers)
    const ip = headers.get('x-forwarded-for') || undefined
    const ua = headers.get('user-agent') || undefined
    const acceptLang = headers.get('accept-language') || undefined
    const body = {
      ...clientBody,
      meta: {
        ip,
        userAgent: ua,
        acceptLanguage: acceptLang
      }
    }
    try {
      const preview = {
        platform: clientBody?.platform,
        provider: clientBody?.provider,
        tokenLen: clientBody?.token ? String(clientBody.token).length : undefined,
        hasSubscription: !!clientBody?.subscription,
        hasDeviceCtx: !!clientBody?.device,
      }
      console.log('[notif/register-device] payload:', preview)
    } catch {}
    const baseUrl = AppConfig.baseApiUrl || process.env.NEXT_PUBLIC_BASE_API_URL || 'https://api.kalame.chat/kariz'
    console.log('[notif/register-device] forwarding to:', baseUrl + '/notifications/register-device ' + session.user.accessToken)
    // Proxy to backend API
    const res = await fetch(`${baseUrl}/notifications/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify(body)
    })

    const data = await res.json().catch(() => ({}))
    console.log('[notif/register-device] backend status:', res.status)
    
    // Log successful registrations to help with debugging
    if (res.status === 200) {
      console.log('[notif/register-device] Device successfully registered')
    }
    
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error('[notif/register-device] error:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


