/**
 * Fetch wrapper that includes authentication headers
 */
interface FetchWithAuthOptions extends RequestInit {
  headers?: Record<string, string>;
}

export default async function fetchWithAuth(
  url: string, 
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  // Get auth token from localStorage or wherever you store it
  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  };

  const token = getAuthToken();
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth header if token exists
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle auth errors
    if (response.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        // Redirect to login or trigger auth flow
        window.dispatchEvent(new CustomEvent('auth-required'));
      }
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}