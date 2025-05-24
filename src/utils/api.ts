// utils/api.ts
export const api = {
  async fetch(endpoint: string, options?: RequestInit) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const baseUrl = window.location.origin;

    const response = await fetch(`${baseUrl}/api/${cleanEndpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return response.json();
  },
};
