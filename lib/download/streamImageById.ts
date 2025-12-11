import { supabase } from '@/lib/db/supabase';

export async function streamImageById(imageId: string) {
  const { data: image, error } = await supabase
    .from('images')
    .select('image_gcs, image_url')
    .eq('internal_reference_number', imageId)
    .single();

  if (error || !image) {
    return { error: 'Image not found' };
  }

  const { data: fileStream, error: downloadError } = await supabase.storage.from('spark').download(image.image_gcs);

  if (downloadError || !fileStream) {
    return { error: 'Could not download file' };
  }

  return {
    fileStream,
    fileName: image.image_gcs.split('/').pop() || 'file',
  };
}
