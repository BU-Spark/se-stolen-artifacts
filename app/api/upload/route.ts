import { NextRequest, NextResponse } from 'next/server';
import { handleUploadImage } from '@/lib/upload/uploadImage';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  try {
    const result = await handleUploadImage({ file });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Upload successful, pending approval',
      status: result.status,
      id: result.id,
      url: result.url,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
