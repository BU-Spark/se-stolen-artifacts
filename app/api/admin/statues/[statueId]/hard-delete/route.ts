import { NextRequest, NextResponse } from 'next/server';

import { hardDeleteStatueWithRelations } from '@/lib/crud-handlers/delete';

export async function DELETE(_request: NextRequest, context: { params: Promise<{ statueId: string }> }) {
  const { statueId } = await context.params;
  const parsedId = Number.parseInt(statueId, 10);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    return NextResponse.json({ error: 'Invalid statueId' }, { status: 400 });
  }

  try {
    const result = await hardDeleteStatueWithRelations(parsedId);
    return NextResponse.json(
      { success: true, statueId: parsedId, deletedImageIds: result.deletedImageIds },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Allow POST for clients that cannot issue DELETE requests easily.
export async function POST(request: NextRequest, context: { params: Promise<{ statueId: string }> }) {
  return DELETE(request, context);
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
