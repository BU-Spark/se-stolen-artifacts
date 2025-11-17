import { NextRequest, NextResponse } from 'next/server';
import { handleUploadImage } from '@/lib/upload/uploadImage';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    return NextResponse.json({
      message: 'Image bucket upload successful. Still need to upload metadata',
      id: result.id,
      publicUrl: result.publicUrl,
      gcsPath: result.gcsPath,
      internalReferenceNumber: result.internalReferenceNumber, // Include internal reference number in the response
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
