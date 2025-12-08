// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);
const skipAuth = process.env.NEXT_PUBLIC_BYPASS_CLERK === 'true';

// Only these routes are public - everything else requires authentication
const isPublicRoute = createRouteMatcher([
  '/', // landing page
  '/signin(.*)',
  '/signup(.*)',
  '/signout(.*)',
  // '/api/process-metadata',
]);

export default clerkMiddleware(async (auth, req) => {
  if (skipAuth) {
    return NextResponse.next(); // short-circuit
  }

  const { userId } = await auth();
  if (!isPublicRoute(req) && !userId) {
    // Protect all non-public routes including /search
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl.toString());
  }

  type SessionMetadata = {
    role?: string;
  };

  const sessionClaims = (await auth()).sessionClaims;
  const metadata = sessionClaims?.metadata as SessionMetadata | undefined;

  if (isAdminRoute(req) && metadata?.role !== 'admin') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
