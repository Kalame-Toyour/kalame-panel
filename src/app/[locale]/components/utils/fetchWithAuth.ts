import { signOut, getSession } from 'next-auth/react';

/**
 * Try to refresh the access token using refreshToken.
 * Returns the new accessToken if successful, otherwise null.
 */
async function refreshAccessToken(refreshToken: string | undefined): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    console.log('Attempting to refresh token with:', refreshToken?.substring(0, 10) + '...');
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!res.ok) {
      console.error('Token refresh failed with status:', res.status);
      const errorData = await res.json().catch(() => ({}));
      console.error('Token refresh error:', errorData);
      return null;
    }
    
    const data = await res.json();
    if (data?.accessToken) {
      console.log('Successfully refreshed access token');
      // Update session with new accessToken
      try {
        // Force session refresh after getting new accessToken
        await getSession({ triggerEvent: true });
      } catch (error) {
        console.error('Failed to update session after token refresh:', error);
      }
      return data.accessToken;
    }
    console.error('No access token in refresh response');
    return null;
  } catch (error) {
    console.error('Exception during token refresh:', error);
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
  try {
    // Check if we have a session
    const session = await getSession();
    if (!session || !session.user) {
      console.error('No active session found');
      // Redirect to auth page
      await signOut({ callbackUrl: '/auth' });
      throw new Error('No active session. Please log in.');
    }
    
    const accessToken = session.user.accessToken;
    const refreshToken = session.user.refreshToken;
    const tokenExpiry = session.user.expiresAt as number | undefined;
    
    // Check if token is expired before even making the request
    const isTokenExpired = tokenExpiry && Date.now() > tokenExpiry;
    
    // If token is already expired, try to refresh it first
    if (isTokenExpired && refreshToken && retryCount < 3) {
      console.log('Token already expired, refreshing before request');
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        // Retry with new token
        return fetchWithAuth(input, init, retryCount + 1);
      } else {
        // Refresh failed, redirect to auth
        await signOut({ callbackUrl: '/auth' });
        throw new Error('Session expired. Please log in again.');
      }
    }

    // Attach Authorization header
    const headers = new Headers(init.headers || {});
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
      console.warn('No access token available for request');
    }

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

    // If unauthorized, try refresh (up to 3 times)
    if (response.status === 401 && retryCount < 3) {
      console.log(`Received 401 on attempt ${retryCount + 1}, trying to refresh token`);
      // Try to refresh access token using refreshToken
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        // Retry with new access token
        console.log('Successfully refreshed token, retrying request');
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        const retryOptions: RequestInit = { ...fetchOptions, headers };
        return fetchWithAuth(input, retryOptions, retryCount + 1);
      } else {
        // Refresh failed, sign out
        console.error('Token refresh failed, redirecting to login');
        await signOut({ callbackUrl: '/auth' });
        throw new Error('Session expired. Please log in again.');
      }
    }

    // If still unauthorized after retries, sign out
    if (response.status === 401 && retryCount >= 3) {
      console.error('Still unauthorized after 3 refresh attempts, redirecting to login');
      await signOut({ callbackUrl: '/auth' });
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  } catch (error) {
    console.error('Error in fetchWithAuth:', error);
    // If it's not our custom error, redirect to auth
    if (!(error instanceof Error && error.message.includes('Session expired'))) {
      await signOut({ callbackUrl: '/auth' });
    }
    throw error;
  }
} 