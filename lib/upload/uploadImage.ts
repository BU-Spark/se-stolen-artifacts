import crypto from 'crypto';
import { supabase } from '@/lib/db/supabase';

const maxSize = 10 * 1024 * 1024; // 10MB
const PENDING_STORAGE_BUCKET =
  process.env.SUPABASE_BUCKET_PENDING_IMAGES ??
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET_PENDING_IMAGES ??
  'pending_images';

export async function handleUploadImage({ file }: { file: File }) {
  if (!file) throw new Error('No file uploaded');

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }

  const newImageId = crypto.randomUUID();
  const internalReferenceNumber = `IRN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const fileExtension = file.name.split('.').pop();
  const filePath = `uploads/${newImageId}.${fileExtension}`;

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(PENDING_STORAGE_BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage.from(PENDING_STORAGE_BUCKET).getPublicUrl(uploadData.path);
    const publicUrl = urlData.publicUrl;
    const gcsPath = `${PENDING_STORAGE_BUCKET}/${uploadData.path}`;

    console.log('Upload successful. New image ID:', newImageId);
    return {
      id: newImageId,
      internalReferenceNumber: internalReferenceNumber, // Include the internal reference number in the return object
      publicUrl: publicUrl,
      gcsPath: gcsPath,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Upload failed: ', errorMessage);
    return { error: errorMessage };
  }
}
