// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
