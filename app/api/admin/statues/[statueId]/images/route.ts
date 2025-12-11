import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function GET(request: NextRequest, context: { params: Promise<{ statueId: string }> }) {
  try {
    const params = await context.params;
    const statueId = parseInt(params.statueId, 10);

    if (isNaN(statueId)) {
      return NextResponse.json({ error: 'Invalid statueId' }, { status: 400 });
    }

    // Get all images for this statue
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('internal_reference_number, image_url, image_gcs')
      .eq('statue_id', statueId)
      .eq('is_deleted', false);

    if (imagesError) {
      return NextResponse.json({ error: imagesError.message }, { status: 500 });
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ images: [] }, { status: 200 });
    }

    // The images table only contains assets that have already been approved and
    // associated with statues, so we can surface everything returned above.
    const approvedImages = images;

    // Generate signed URLs for approved images
    const imagesWithUrls = await Promise.all(
      approvedImages.map(async (image) => {
        let imageUrl = image.image_url;

        // If image has a GCS path, try to get a signed URL
        if (image.image_gcs) {
          // Normalize storage path (remove bucket prefix and leading slash)
          const bucketPrefix = 'spark/';
          let storagePath = image.image_gcs.replace(/^\//, '');
          if (storagePath.startsWith(bucketPrefix)) {
            storagePath = storagePath.slice(bucketPrefix.length);
          }

          const storageClient = supabase.storage.from('spark');

          const { data: signedUrlData, error: signedUrlError } = await storageClient.createSignedUrl(
            storagePath,
            60 * 60 // 1 hour expiry
          );

          if (!signedUrlError && signedUrlData?.signedUrl) {
            imageUrl = signedUrlData.signedUrl;
          } else if (!imageUrl) {
            // Fallback to public URL if signed URL fails
            const { data: publicUrlData } = storageClient.getPublicUrl(storagePath);
            if (publicUrlData?.publicUrl) {
              imageUrl = publicUrlData.publicUrl;
            }
          }
        }

        return {
          id: image.internal_reference_number,
          url: imageUrl || '/image-404-placeholder.avif',
          title: `Image ${image.internal_reference_number.substring(0, 8)}`,
        };
      })
    );

    return NextResponse.json({ images: imagesWithUrls }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
