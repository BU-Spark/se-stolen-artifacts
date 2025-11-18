import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const storageBucket = 'spark';

function normalizeStoragePath(path: string | null | undefined) {
  if (!path) return null; // Return null if the path is null or undefined
  const bucketPrefix = `${storageBucket}/`;
  const trimmed = path.replace(/^\//, '');
  return trimmed.startsWith(bucketPrefix) ? trimmed.slice(bucketPrefix.length) : trimmed;
}

export async function handleGetPendingImages() {
  try {
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(storageBucket);

    if (bucketError || !bucketData) {
      return {
        images: [],
        error: `Supabase storage bucket "${storageBucket}" not found. Confirm the bucket exists and this service key can access it.`,
      };
    }

    const { data: pendingData, error: queryError } = await supabase
      .from('artifact_metadata_upload_log')
      .select('image_id, internal_reference_number, gcs_path, short_description, ai_generated')
      .eq('status', 'pending_review');

    if (queryError) return { images: [], error: queryError.message };

    // Enhance the images directly from the approvals query
    const enhancedImages = await Promise.all(
      pendingData.map(async (approval) => {
        const storagePath = normalizeStoragePath(approval.gcs_path);
        if (!storagePath) {
          console.error('Invalid storage path:', approval.gcs_path);
          return null; // Handle the invalid path case
        }

        const storageClient = supabase.storage.from(storageBucket);
        const { data: signedUrlData, error: signedUrlError } = await storageClient.createSignedUrl(
          storagePath,
          60 * 60 // 1 hour expiration
        );

        const resolvedUrl =
          signedUrlError || !signedUrlData?.signedUrl
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storageBucket}/${storagePath}`
            : signedUrlData.signedUrl;

        return {
          image_id: approval.image_id,
          internal_reference_number: approval.internal_reference_number,
          image_url: resolvedUrl,
          short_description: approval.short_description,
          ai_generated: approval.ai_generated,
        };
      })
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log('Enhanced images', enhancedImages);
    }

    return { images: enhancedImages };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { images: [], error: message };
  }
}
