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

    // RPC defined in /supabase/migrations/20251026005531_handle_new_image_upload.sql
    const { data: newImageId, error: rpcError } = await supabase.rpc('handle_new_image_upload', {
      image_url_input: publicUrl,
      image_gcs_input: gcsPath,
    });

    // Rollback
    if (rpcError) {
      await supabase.storage.from('spark').remove([gcsPath]);
      throw rpcError;
    }

    console.log('Upload successful. New image ID:', newImageId);
    return {
      status: 'pending',
      id: newImageId,
      url: publicUrl,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Upload failed: ', errorMessage);
    return { error: errorMessage };
  }
}
