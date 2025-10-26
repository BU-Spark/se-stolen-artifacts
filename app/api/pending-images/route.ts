import { NextResponse } from 'next/server';
import { handleGetPendingImages } from '@/lib/pending-images/pendingImages';
import { auth } from '@clerk/nextjs/server';

// Hardcoded in local .env.local for now (assuming only one admin account)
const ADMIN_ID = process.env.ADMIN_ID!;

export async function GET() {
  const { userId } = await auth();
  if (userId !== ADMIN_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await handleGetPendingImages();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ images: result.images }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
