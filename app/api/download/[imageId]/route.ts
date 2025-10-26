import { NextRequest, NextResponse } from 'next/server';
import { streamImageById } from '@/lib/download/streamImageById';

export async function GET(request: NextRequest, context: { params: { imageId: string } }) {
  const { imageId } = await context.params;
  const result = await streamImageById(imageId);
  if (result.error || !result.fileStream) {
    return NextResponse.json({ error: result.error || 'File stream not available' }, { status: 404 });
  }
  const arrayBuffer = await result.fileStream.arrayBuffer();
  return new Response(Buffer.from(arrayBuffer), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${result.fileName}"`,
    },
  });
}
