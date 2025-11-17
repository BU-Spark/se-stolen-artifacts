import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const maxSize = 5 * 1024 * 1024; // 5MB

export async function handleUploadImage({ file }: { file: File }) {
  if (!file) throw new Error('No file uploaded');

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  const newImageId = crypto.randomUUID();
  const fileExtension = file.name.split('.').pop();
  const filePath = `uploads/${newImageId}.${fileExtension}`;

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage.from('spark').upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage.from('spark').getPublicUrl(uploadData.path);
    const publicUrl = urlData.publicUrl;
    const gcsPath = uploadData.path;

    console.log('Upload successful. New image ID:', newImageId);
    return {
      id: newImageId,
      publicUrl: publicUrl,
      gcsPath: gcsPath,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Upload failed: ', errorMessage);
    return { error: errorMessage };
  }
}
