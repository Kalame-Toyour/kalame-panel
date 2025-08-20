import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { routing } from './libs/i18nNavigation';

const intlMiddleware = createMiddleware(routing);

const createRoutesMatcher = (routes: string[]) => {
  return (request: NextRequest) => {
    return routes.some(route => request.nextUrl.pathname.match(route));
  };
};

const isApiRoute = createRoutesMatcher([
  '/api/((?!auth).*)', // Match API routes but exclude auth routes
]);

const isProtectedRoute = (request: NextRequest) => {
  const path = request.nextUrl.pathname;
  
  // Define protected paths explicitly - add all your protected routes here
  const protectedPaths = [
    '/image',
    '/text-to-voice',
    '/voice',
    '/voice-to-text',
    '/app'
  ];
  
  // Check if the path (without locale) matches any protected path
  const isProtected = protectedPaths.some(protectedPath => {
    // Check both with and without locale prefix
    return path.endsWith(protectedPath) || 
           path.match(new RegExp(`^\\/\\w{2}${protectedPath}(?:\\/|$)`));
  });
  
  if (!isProtected) {
    return false;
  }
  
  // Exclude auth pages
  if (isAuthPage(request)) return false;
  
  // Exclude API routes
  if (isApiRoute(request) || isAuthEndpoint(request)) return false;
  
  return true;
};

const isAuthPage = createRoutesMatcher([
  '/auth(.*)',
  '/:locale/auth(.*)',
]);

// Add auth endpoints matcher
const isAuthEndpoint = createRoutesMatcher([
  '/api/auth(.*)',
]);

// Helper function to validate token
const isValidToken = (token: { accessToken?: string; expiresAt?: number; error?: string } | null) => {
  if (!token) {
    console.log('Middleware - No token found');
    return false;
  }
  
  if (token.error) {
    console.log('Middleware - Token has error:', token.error);
    return false;
  }
  
  if (!token.accessToken) {
    console.log('Middleware - No access token found');
    return false;
  }
  
  if (token.expiresAt && Date.now() > token.expiresAt) {
    console.log('Middleware - Token expired:', {
      expiresAt: new Date(token.expiresAt).toISOString(),
      now: new Date().toISOString(),
      timeLeft: token.expiresAt - Date.now(),
    });
    return false;
  }
  
  console.log('Middleware - Token is valid:', {
    hasAccessToken: !!token.accessToken,
    expiresAt: token.expiresAt ? new Date(token.expiresAt).toISOString() : 'No expiration',
    timeLeft: token.expiresAt ? token.expiresAt - Date.now() : 'No expiration',
    tokenError: token.error,
  });
  
  return true;
};

export default async function middleware(
  request: NextRequest,
) {
  // Skip middleware for auth endpoints to avoid CSRF issues
  if (isApiRoute(request) || isAuthEndpoint(request)) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('https'),
    });

    console.log('Middleware - Token check:', {
      hasToken: !!token,
      tokenId: token?.id,
      tokenName: token?.name,
      tokenError: token?.error,
      tokenExpiresAt: token?.expiresAt ? new Date(token.expiresAt).toISOString() : 'No expiration',
      path: request.nextUrl.pathname,
      host: request.headers.get('host'),
      isProtected: isProtectedRoute(request),
      isAuthPage: isAuthPage(request),
      hasAccessToken: !!token?.accessToken,
      hasRefreshToken: !!token?.refreshToken,
    });

    // Handle protected routes
    if (isProtectedRoute(request)) {
      // Check if token is valid
      if (!isValidToken(token)) {
        console.log('Middleware - Redirecting to auth (protected route)');
        // Get the base URL - prioritize NEXTAUTH_URL, then fallback to request headers
        const baseUrl = process.env.NEXTAUTH_URL || 
                       `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`;
        
        // Create the sign-in URL with the correct domain and protocol
        const signInUrl = new URL(`${baseUrl}/auth`);
        
        // Set callbackUrl to the current URL but with the correct domain
        const callbackUrl = new URL(request.url);
        callbackUrl.host = new URL(baseUrl).host;
        callbackUrl.protocol = new URL(baseUrl).protocol;
        signInUrl.searchParams.set('callbackUrl', callbackUrl.toString());
        
        return NextResponse.redirect(signInUrl);
      }
      
      // Token is valid, allow access to protected route
      console.log('Middleware - Access granted to protected route');
    }

    // Handle auth pages
    if (isAuthPage(request) && isValidToken(token)) {
      console.log('Middleware - Redirecting to app (authenticated user on auth page)');
      // Extract locale from path - matches patterns like /fa/auth, /en/auth, etc.
      const localeMatch = request.nextUrl.pathname.match(/^\/([a-z]{2})(?:\/|$)/);
      const locale = localeMatch ? `/${localeMatch[1]}` : '';
      
      // Get the base URL - prioritize NEXTAUTH_URL, then fallback to request headers
      const baseUrl = process.env.NEXTAUTH_URL || 
                     `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`;
      
      // Create the app URL with the correct domain and protocol
      const appUrl = new URL(`${baseUrl}${locale}/`);
      
      return NextResponse.redirect(appUrl);
    }

    // Apply internationalization middleware
    return intlMiddleware(request);
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, allow the request to proceed
    return intlMiddleware(request);
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Include API routes
    '/api/(.*)',
  ],
};
