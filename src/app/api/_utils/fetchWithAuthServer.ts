/**
 * fetchWithAuthServer: Server-side fetch with Authorization header and retry logic for API routes.
 *
 * @param input - RequestInfo (URL or Request)
 * @param init - RequestInit (fetch options)
 * @param retryCount - Internal: number of retries (default 0, max 3)
 * @returns fetch Response
 *
 * Usage (in API routes only!):
 *   const res = await fetchWithAuthServer(url, { headers: { Authorization: ... } });
 */
import { auth } from '@/auth';

export default async function fetchWithAuthServer(
  input: RequestInfo,
  init: RequestInit = {},
  retryCount = 0
): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach access token from session if not already present
  if (!headers.has('Authorization')) {
    const session = await auth();
    if (session?.user?.accessToken) {
      headers.set('Authorization', `Bearer ${session.user.accessToken}`);
    }
  }

  let fetchOptions: RequestInit = {
    ...init,
    headers,
    credentials: 'include',
  };

  const response = await fetch(input, fetchOptions);

  if (response.status === 401 && retryCount < 3) {
    // Try to refresh the token using refreshToken from session
    const session = await auth();
    const refreshToken = session?.user?.refreshToken;
    if (refreshToken) {
      // Call the refresh endpoint
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data?.accessToken) {
          // Retry the original request with the new access token
          headers.set('Authorization', `Bearer ${data.accessToken}`);
          fetchOptions = { ...fetchOptions, headers };
          return fetchWithAuthServer(input, fetchOptions, retryCount + 1);
        }
      }
    }
    // If refresh fails, return the original 401 response
    return response;
  }
  return response;
} 