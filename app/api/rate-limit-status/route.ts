import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRateLimitStatus } from '@/lib/rate-limit/uploadRateLimit';

/**
 * GET /api/rate-limit-status
 *
 * Returns the current global upload rate limit status.
 * Used by the frontend to determine if AI metadata generation is available.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = getRateLimitStatus();

  return NextResponse.json({
    rateLimitStatus: status,
    // AI metadata is available if we haven't hit the limit
    aiMetadataAvailable: !status.isLimited,
  });
}
