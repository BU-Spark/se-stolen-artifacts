import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const storageBucket = 'spark';

function normalizeStoragePath(path: string | null | undefined): string | null {
  if (!path) return null;
  const bucketPrefix = `${storageBucket}/`;
  const trimmed = path.replace(/^\//, '');
  return trimmed.startsWith(bucketPrefix) ? trimmed.slice(bucketPrefix.length) : trimmed;
}

export async function GET(request: Request, { params }: { params: Promise<{ imageId: string }> }) {
  try {
    const { imageId } = await params;

    // Get image data from database
    const { data: image, error } = await supabase
      .from('images')
      .select('image_gcs, image_url')
      .eq('internal_reference_number', imageId)
      .single();

    if (error || !image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Prefer image_gcs, fallback to image_url
    const storagePath = image.image_gcs
      ? normalizeStoragePath(image.image_gcs)
      : image.image_url
        ? normalizeStoragePath(image.image_url)
        : null;

    if (!storagePath) {
      return NextResponse.json({ error: 'No valid image path found' }, { status: 404 });
    }

    // Create signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(storageBucket)
      .createSignedUrl(storagePath, 60 * 60); // 1 hour expiration

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }

    return NextResponse.json({ url: signedUrlData.signedUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
