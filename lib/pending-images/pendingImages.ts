import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const storageBucket = 'spark';

/**
 * Normalize a storage object path by removing a leading slash and stripping the configured storage bucket prefix if present.
 *
 * @param path - The input storage path, which may include a leading slash or the storage bucket prefix
 * @returns The normalized path with any leading slash removed and the storage bucket prefix removed when present
 */
function normalizeStoragePath(path: string) {
  const bucketPrefix = `${storageBucket}/`;
  if (!path) return path;
  const trimmed = path.replace(/^\//, '');
  return trimmed.startsWith(bucketPrefix) ? trimmed.slice(bucketPrefix.length) : trimmed;
}

/**
 * Fetches images awaiting approval and enriches each with an accessible URL when available.
 *
 * Queries pending approvals, loads the corresponding image records, and for each image attempts to resolve a usable `image_url` by preferring a signed storage URL, falling back to a public storage URL, or preserving the existing `image_url` if present. If the storage bucket is unavailable or an error occurs, returns an empty images array with an error message.
 *
 * @returns An object containing `images`, an array of image records (each may have `image_url` updated to a signed or public URL), and optionally `error` with a descriptive message when the operation fails.
 */
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

    const enhancedImages = await Promise.all(
      (images ?? []).map(async (image) => {
        let resolvedUrl = image?.image_url ?? null;

        if (process.env.NODE_ENV !== 'production') {
          console.log('Attempting to resolve image URL for', image);
        }

        if (!image?.image_gcs) {
          return resolvedUrl
            ? {
                ...image,
                image_url: resolvedUrl,
              }
            : image;
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
              }
            : image;
        }

        return {
          ...image,
          image_url: signedUrlData.signedUrl,
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