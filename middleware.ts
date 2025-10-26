// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);

// Only these routes are public - everything else requires authentication
const isPublicRoute = createRouteMatcher([
  '/', // landing page
  '/signin(.*)',
  '/signup(.*)',
  '/signout(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    // Protect all non-public routes including /search
    await auth.protect();
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
