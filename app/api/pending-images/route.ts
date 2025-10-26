import { NextResponse } from 'next/server';
import { handleGetPendingImages } from '@/lib/pending-images/pendingImages';

export async function GET() {
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
