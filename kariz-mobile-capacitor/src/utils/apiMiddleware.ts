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
  
  // Check if this is an upload endpoint and redirect to web API
  if (url.includes('/api/upload-media')) {
    const realUrl = 'https://kalame.chat/api/upload-media';
    console.log(`🔄 Redirecting upload request from ${url} to ${realUrl}`);
    
    // Create new request with real URL and CORS headers
    const newRequest = new Request(realUrl, {
      method: init?.method || 'POST',
      headers: {
        ...init?.headers,
        'Origin': 'https://kalame.chat', // Set origin to match target domain
        'Referer': 'https://kalame.chat/', // Set referer
        // Don't override Content-Type for file uploads
      },
      body: init?.body,
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'include', // Include credentials
    });
    
    return await originalFetch(newRequest);
  }
  
  // For all other requests, use the original fetch
  return originalFetch(input, init);
};