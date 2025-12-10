// lib/db/insertArtifactMetadata.ts
import { createClient } from '@supabase/supabase-js';
import type { ArtifactSearchMetadata } from '@/app/types';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function insertArtifactMetadata(
  imageId: string,
  gcsPath: string,
  internalReferenceNumber: string,
  metadata: ArtifactSearchMetadata
) {
  if (!metadata) {
    throw new Error('Metadata is undefined. Cannot destructure properties.');
  }

  const {
    basicSearchMetadata,
    advancedSearchMetadata,
    shortDescription,
    longDescription,
    miscInformation,
    aiGenerated,
  } = metadata;

  console.log('Inserting metadata for image:', imageId);
  console.log('Internal Reference Number:', internalReferenceNumber); // Log the internal reference number
  console.log('GCS Path:', gcsPath);
  console.log('Basic metadata:', JSON.stringify(basicSearchMetadata, null, 2));
  console.log('Advanced metadata:', JSON.stringify(advancedSearchMetadata, null, 2));
  console.log('Short description:', shortDescription);
  console.log('Long description:', longDescription);
  console.log('Misc information:', miscInformation);
  console.log('AI generated:', aiGenerated);

  const { data, error } = await supabase.rpc('insert_llm_artifact_metadata_withgcs', {
    image_id_input: imageId,
    gcs_path_input: gcsPath,
    internal_reference_number_input: internalReferenceNumber, // Pass the internal reference number to the RPC
    basic_search_metadata_input: basicSearchMetadata,
    advanced_search_metadata_input: advancedSearchMetadata,
    short_description_input: shortDescription ?? null,
    long_description_input: longDescription ?? null,
    misc_information_input: miscInformation ?? null,
    ai_generated_input: aiGenerated ?? true, // Default to true if not specified
  });

  console.log('RPC response - data:', data);
  console.log('RPC response - error:', error);

  if (error) {
    throw new Error(`Supabase RPC error: ${error.message}`);
  }

  return data;
}
