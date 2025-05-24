import { signOut, getSession } from 'next-auth/react';

/**
 * Try to refresh the access token using refreshToken.
 * Returns the new accessToken if successful, otherwise null.
 */
async function refreshAccessToken(refreshToken: string | undefined): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.accessToken) {
      // Update session with new accessToken
      try {
        // Force session refresh after getting new accessToken
        await getSession({ triggerEvent: true });
      } catch {
        // Ignore
      }
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * fetchWithAuth: Authenticated fetch with next-auth access token, auto-refresh, and retry logic.
 *
 * @param input - RequestInfo (URL or Request)
 * @param init - RequestInit (fetch options)
 * @param retryCount - Internal: number of retries (default 0, max 3)
 * @returns fetch Response
 *
 * Usage:
 *   const res = await fetchWithAuth('/api/your-endpoint', { method: 'GET' });
 */
export default async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {},
  retryCount = 0
): Promise<Response> {
  const session = await getSession();
  const accessToken = session?.user?.accessToken;
  const refreshToken = session?.user?.refreshToken;

  // Attach Authorization header
  const headers = new Headers(init.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  console.log('accessToken', accessToken);
  // Always set content-type if not set
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...init,
    headers,
    credentials: 'include',
  };

  const response = await fetch(input, fetchOptions);

  console.log('response chathisrtory', response);
  // If unauthorized, try refresh (up to 3 times)
  if (response.status === 401 && retryCount < 3) {
    // Try to refresh access token using refreshToken
    const newAccessToken = await refreshAccessToken(refreshToken);
    if (newAccessToken) {
      // Retry with new access token
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      const retryOptions: RequestInit = { ...fetchOptions, headers };
      return fetchWithAuth(input, retryOptions, retryCount + 1);
    } else {
      // Refresh failed, sign out
      await signOut({ callbackUrl: '/auth' });
      throw new Error('Session expired. Please log in again.');
    }
  }

  // If still unauthorized after retries, sign out
  if (response.status === 401 && retryCount >= 3) {
    await signOut({ callbackUrl: '/auth' });
    throw new Error('Session expired. Please log in again.');
  }

  return response;
} 