import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { resetRateLimit } from '@/lib/rate-limit/uploadRateLimit';

/**
 * POST /api/admin/reset-rate-limit
 *
 * Admin endpoint to reset the global upload rate limit.
 * Useful for testing or emergency situations.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Add admin role check here
  // For now, any authenticated user can reset (for testing)
  // In production, add: if (metadata?.role !== 'admin') return 403

  resetRateLimit();

  return NextResponse.json({
    message: 'Rate limit reset successfully',
    timestamp: new Date().toISOString(),
  });
}
