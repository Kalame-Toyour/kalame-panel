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
  // Do NOT protect the root ("/" or "/fa" etc.)
  // Protect all other subpages
  // Example: /app, /image, /voice, /voice-to-text, etc.
  const localeMatch = path.match(/^\/(\w{2})(?:\/(.*))?$/);
  if (path === '/' || (localeMatch && (!localeMatch[2] || localeMatch[2] === ''))) {
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
    if (!token) {
      const locale = request.nextUrl.pathname.match(/(\/.*)\/app/)?.at(1) ?? '';
      const signInUrl = new URL(`${locale}/auth`, request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Handle auth pages
  if (isAuthPage(request) && token) {
    const locale = request.nextUrl.pathname.match(/(\/.*)\/auth/)?.at(1) ?? '';
    const appUrl = new URL(`${locale}/`, request.url);
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
