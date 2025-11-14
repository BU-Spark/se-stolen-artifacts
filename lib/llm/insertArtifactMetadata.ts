// lib/db/insertArtifactMetadata.ts
import { createClient } from '@supabase/supabase-js';
import type { ArtifactSearchMetadata } from '@/app/types';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function insertArtifactMetadata(imageId: string, metadata: ArtifactSearchMetadata) {
  const { basicSearchMetadata, advancedSearchMetadata, shortDescription, longDescription, aiGenerated } = metadata;

  console.log('Inserting metadata for image:', imageId);
  console.log('Basic metadata:', JSON.stringify(basicSearchMetadata, null, 2));
  console.log('Advanced metadata:', JSON.stringify(advancedSearchMetadata, null, 2));
  console.log('Short description:', shortDescription);
  console.log('Long description:', longDescription);
  console.log('AI generated:', aiGenerated);

  const { data, error } = await supabase.rpc('insert_llm_artifact_metadata', {
    image_id_input: imageId,
    basic_search_metadata_input: basicSearchMetadata,
    advanced_search_metadata_input: advancedSearchMetadata,
    short_description_input: shortDescription,
    long_description_input: longDescription,
    ai_generated_input: aiGenerated ?? true, // Default to true if not specified
  });

  console.log('RPC response - data:', data);
  console.log('RPC response - error:', error);

  if (error) {
    throw new Error(`Supabase RPC error: ${error.message}`);
  }

  return data;
}
