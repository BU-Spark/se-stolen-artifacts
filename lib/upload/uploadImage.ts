import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function handleUploadImage({ file }: { file: File }) {
  if (!file) throw new Error('No file uploaded');

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

    /** 
  CREATE OR REPLACE FUNCTION handle_new_image_upload(
    image_url_input TEXT,
    image_gcs_input TEXT
  )
  RETURNS TEXT 
  AS $$
  DECLARE
    new_internal_ref_id TEXT;
    next_statue_id INTEGER;
    next_approval_id INTEGER;
  BEGIN
    SELECT gen_random_uuid() INTO new_internal_ref_id;
    SELECT COALESCE(MAX(statue_id), 0) + 1 INTO next_statue_id FROM statues;
    SELECT COALESCE(MAX(approval_id), 0) + 1 INTO next_approval_id FROM approval;
  a
    -- Insert the new statue row
    INSERT INTO statues (statue_id)
    VALUES (next_statue_id);

    INSERT INTO images (
      internal_reference_number,
      image_url,
      image_gcs,
      statue_id
    )
    VALUES (
      new_internal_ref_id,
      image_url_input,
      image_gcs_input,
      next_statue_id
    );

    INSERT INTO approval (
      image_id,
      status,
      admin_id,
      approval_id
    )
    VALUES (
      new_internal_ref_id, 
      'pending_review',        
      'cacf0e78-f815-4a47-abed-179aa74c40eb',
      next_approval_id
    );

    RETURN new_internal_ref_id;
  END;
  $$ LANGUAGE plpgsql; 
*/

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
    console.error('Upload failed: ', error.message);
    return { error: error.message };
  }
}
