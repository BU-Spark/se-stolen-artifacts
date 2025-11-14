import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const storageBucket = 'spark';

function normalizeStoragePath(path: string) {
  const bucketPrefix = `${storageBucket}/`;
  if (!path) return path;
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

    const { data: approvals, error: approvalError } = await supabase
      .from('approval')
      .select('image_id')
      .eq('status', 'pending_review');

    if (approvalError) return { images: [], error: approvalError.message };

    const imageIds = approvals.map((a) => a.image_id);

    const { data: images, error: imageError } = await supabase
      .from('images')
      .select('*')
      .in('internal_reference_number', imageIds);

    if (imageError) return { images: [], error: imageError.message };

    // Fetch short_description and ai_generated from temp_artifact_metadata
    const { data: metadataRecords, error: metadataError } = await supabase
      .from('temp_artifact_metadata')
      .select('image_id, short_description, ai_generated')
      .in('image_id', imageIds);

    if (metadataError && process.env.NODE_ENV !== 'production') {
      console.error('Error fetching metadata:', metadataError);
    }

    // Create a map of image_id to short_description and ai_generated
    const metadataMap = new Map<string, { short_description: string | null; ai_generated: boolean | null }>();
    (metadataRecords ?? []).forEach((record) => {
      if (record.image_id) {
        metadataMap.set(record.image_id, {
          short_description: record.short_description ?? null,
          ai_generated: record.ai_generated ?? null,
        });
      }
    });

    const enhancedImages = await Promise.all(
      (images ?? []).map(async (image) => {
        let resolvedUrl = image?.image_url ?? null;

        if (process.env.NODE_ENV !== 'production') {
          console.log('Attempting to resolve image URL for', image);
        }

        const metadata = metadataMap.get(image.internal_reference_number);
        const shortDescription = metadata?.short_description ?? null;
        const aiGenerated = metadata?.ai_generated ?? null;

        if (!image?.image_gcs) {
          return resolvedUrl
            ? {
                ...image,
                image_url: resolvedUrl,
                short_description: shortDescription,
                ai_generated: aiGenerated,
              }
            : {
                ...image,
                short_description: shortDescription,
                ai_generated: aiGenerated,
              };
        }

        const storagePath = normalizeStoragePath(image.image_gcs);
        const storageClient = supabase.storage.from(storageBucket);
        const { data: signedUrlData, error: signedUrlError } = await storageClient.createSignedUrl(
          storagePath,
          60 * 60
        );

        if (signedUrlError || !signedUrlData?.signedUrl) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Signed URL error', { error: signedUrlError, storagePath });
          }

          if (!resolvedUrl) {
            const { data: publicUrlData } = storageClient.getPublicUrl(storagePath);
            if (publicUrlData?.publicUrl) {
              resolvedUrl = publicUrlData.publicUrl;
            }
          }

          return resolvedUrl
            ? {
                ...image,
                image_url: resolvedUrl,
                short_description: shortDescription,
                ai_generated: aiGenerated,
              }
            : {
                ...image,
                short_description: shortDescription,
                ai_generated: aiGenerated,
              };
        }

        return {
          ...image,
          image_url: signedUrlData.signedUrl,
          short_description: shortDescription,
          ai_generated: aiGenerated,
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
