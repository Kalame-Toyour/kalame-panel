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
export default async function fetchWithAuthServer(
  input: RequestInfo,
  init: RequestInit = {},
  retryCount = 0
): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const fetchOptions: RequestInit = {
    ...init,
    headers,
    credentials: 'include',
  };
  const response = await fetch(input, fetchOptions);
  if (response.status === 401 && retryCount < 3) {
    // No refresh logic on server, just retry
    return fetchWithAuthServer(input, fetchOptions, retryCount + 1);
  }
  return response;
} 