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

export default async function middleware(
  request: NextRequest,
) {
  // Skip middleware for auth endpoints
  if (isApiRoute(request) || isAuthEndpoint(request)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Handle protected routes
  if (isProtectedRoute(request)) {
    // Check if token exists and is valid
    if (!token || !token.accessToken) {
      // Extract locale from path - matches patterns like /fa/image, /en/text-to-voice, etc.
      const localeMatch = request.nextUrl.pathname.match(/^\/([a-z]{2})(?:\/|$)/);
      const locale = localeMatch ? `/${localeMatch[1]}` : '';
      
      // Get the base URL - prioritize NEXTAUTH_URL, then fallback to request headers
      const baseUrl = process.env.NEXTAUTH_URL || 
                     `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`;
      
      // Create the sign-in URL with the correct domain and protocol
      const signInUrl = new URL(`${locale}/auth`, baseUrl);
      signInUrl.searchParams.set('callbackUrl', request.url);
      
      // Ensure we're using HTTPS in production
      if (process.env.NODE_ENV === 'production') {
        signInUrl.protocol = 'https:';
      }
      
      return NextResponse.redirect(signInUrl);
    }
  }

  // Handle auth pages
  if (isAuthPage(request) && token && token.accessToken) {
    // Extract locale from path - matches patterns like /fa/auth, /en/auth, etc.
    const localeMatch = request.nextUrl.pathname.match(/^\/([a-z]{2})(?:\/|$)/);
    const locale = localeMatch ? `/${localeMatch[1]}` : '';
    
    // Get the base URL - prioritize NEXTAUTH_URL, then fallback to request headers
    const baseUrl = process.env.NEXTAUTH_URL || 
                   `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`;
    
    // Create the app URL with the correct domain and protocol
    const appUrl = new URL(`${locale}/`, baseUrl);
    
    // Ensure we're using HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      appUrl.protocol = 'https:';
    }
    
    return NextResponse.redirect(appUrl);
  }

  // Apply internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Include API routes
    '/api/(.*)',
  ],
};
