import { NextRequest, NextResponse } from 'next/server';
import { handleUploadImage } from '@/lib/upload/uploadImage';
import { auth } from '@clerk/nextjs/server';
import { checkUploadRateLimit, recordUpload, getRateLimitStatus } from '@/lib/rate-limit/uploadRateLimit';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check rate limit before processing
  const rateLimitStatus = checkUploadRateLimit();
  if (!rateLimitStatus.allowed) {
    return NextResponse.json(
      {
        error: 'Upload rate limit exceeded. Please try again later.',
        rateLimitStatus: getRateLimitStatus(),
      },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const shortDescription = formData.get('shortDescription') as string;

  // Validate that short description is provided
  if (!shortDescription || shortDescription.trim() === '') {
    return NextResponse.json({ error: 'Short description is required' }, { status: 400 });
  }

  try {
    const result = await handleUploadImage({ file });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Record the successful upload
    recordUpload();

    // Get updated rate limit status to include in response
    const updatedRateLimitStatus = getRateLimitStatus();

    return NextResponse.json({
      message: 'Image bucket upload successful. Still need to upload metadata',
      id: result.id,
      publicUrl: result.publicUrl,
      gcsPath: result.gcsPath,
      internalReferenceNumber: result.internalReferenceNumber, // Include internal reference number in the response
      rateLimitStatus: updatedRateLimitStatus, // Include rate limit status so frontend knows if AI is available
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
