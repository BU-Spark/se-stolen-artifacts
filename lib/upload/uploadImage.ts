import crypto from 'crypto';
import { supabase } from '@/lib/db/supabase';

const maxSize = 10 * 1024 * 1024; // 10MB
const PENDING_STORAGE_BUCKET =
  process.env.SUPABASE_BUCKET_PENDING_IMAGES ??
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET_PENDING_IMAGES ??
  'pending_images';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

export async function handleUploadImage({ file }: { file: File }) {
  if (!file) throw new Error('No file uploaded');

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
      throw new Error('Unsupported file type. Only JPG, JPEG, PNG, or WEBP images are allowed.');
    }
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }

  const newImageId = crypto.randomUUID();
  const internalReferenceNumber = `IRN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const fileExtension = file.name.split('.').pop();
  const filePath = `uploads/${newImageId}.${fileExtension}`;

  try {
    console.log('Uploading to bucket:', PENDING_STORAGE_BUCKET);
    console.log('File path:', filePath);
    console.log('File size:', file.size, 'bytes');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(PENDING_STORAGE_BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful. Upload data:', uploadData);

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
