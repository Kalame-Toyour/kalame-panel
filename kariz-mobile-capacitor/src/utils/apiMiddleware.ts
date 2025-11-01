// API middleware for mobile app to handle authentication endpoints
import { AppConfig } from './AppConfig';

// Override fetch for mobile app to handle authentication endpoints
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  
  // Check if this is an authentication endpoint and redirect to real API
  if (url.includes('/api/auth/')) {
    const realUrl = url.replace('/api/auth/', `${AppConfig.authApiUrl}/`);
    console.log(`🔄 Redirecting auth request from ${url} to ${realUrl}`);
    
    // Create new request with real URL
    const newRequest = new Request(realUrl, {
      method: init?.method || 'GET',
      headers: {
        ...init?.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: init?.body,
    });
    
    return await originalFetch(newRequest);
  }
  
  // Check if this is a chat stream endpoint and redirect to web API
  if (url.includes('/api/chat/stream')) {
    const realUrl = 'https://kalame.chat/api/chat/stream';
    console.log(`🔄 Redirecting chat stream request from ${url} to ${realUrl}`);
    
    // Create new request with real URL
    const newRequest = new Request(realUrl, {
      method: init?.method || 'POST',
      headers: {
        ...init?.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: init?.body,
    });
    
    return await originalFetch(newRequest);
  }
  
  // Check if this is an upload endpoint and redirect to backend API (not Next.js API route)
  // Mobile app needs to use backend API directly with token, not Next.js session-based endpoint
  if (url.includes('/api/upload-media')) {
    // Use backend API directly (not Next.js API route)
    const backendUrl = `${AppConfig.baseApiUrl}/upload-media`;
    console.log(`🔄 Redirecting upload request from ${url} to backend API: ${backendUrl}`);
    
    // Get headers from init, but don't override Content-Type for FormData
    const requestHeaders: Record<string, string> = {};
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          // Skip Content-Type for FormData - browser will set it
          if (key.toLowerCase() !== 'content-type') {
            requestHeaders[key] = value;
          }
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type') {
            requestHeaders[key] = value;
          }
        });
      } else {
        Object.entries(init.headers).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type') {
            requestHeaders[key] = value as string;
          }
        });
      }
    }
    
    // Add Accept header
    requestHeaders['Accept'] = 'application/json';
    
    // Create new request with backend API URL
    // Backend API should handle CORS properly for mobile apps
    const newRequest = new Request(backendUrl, {
      method: init?.method || 'POST',
      headers: requestHeaders,
      body: init?.body, // FormData will be sent with proper Content-Type
      mode: 'cors',
      credentials: 'omit', // Don't include credentials in CORS request
    });
    
    console.log(`🔄 Upload request to backend API with headers:`, Object.keys(requestHeaders));
    console.log(`🔄 Upload request has Authorization header:`, !!requestHeaders['Authorization']);
    
    return await originalFetch(newRequest);
  }
  
  // For all other requests, use the original fetch
  return originalFetch(input, init);
};