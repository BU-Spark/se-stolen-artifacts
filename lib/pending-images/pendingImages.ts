import { createClient } from '@supabase/supabase-js';
import type { PendingImageMetadata } from '@/app/admin/admin-review/components/PendingImageCard/PendingImageCard.types';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const storageBucket = 'spark';

function normalizeStoragePath(path: string | null | undefined) {
  if (!path) return null; // Return null if the path is null or undefined
  const bucketPrefix = `${storageBucket}/`;
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

    // Fetch all metadata fields from the database
    const { data: pendingData, error: queryError } = await supabase
      .from('artifact_metadata_upload_log')
      .select(
        `
        image_id,
        internal_reference_number,
        gcs_path,
        short_description,
        ai_generated,
        artifact_title,
        suspected_current_location,
        first_appearance_year,
        first_appearance_year_outside_cambodia,
        image_source,
        photograph_location,
        dealer_name,
        material,
        repatriated,
        multiple_heads,
        four_arms,
        eight_arms,
        ten_arms,
        over_ten_arms,
        fragmentary,
        fragments_from_multiple_statues,
        head_present,
        torso_present,
        shoulder_elbow_present,
        elbow_wrist_present,
        hand_present,
        hip_knee_present,
        knee_ankle_present,
        foot_present,
        base_present,
        fragmented_at_neck,
        fragmented_at_shoulder,
        fragmented_at_elbow,
        fragmented_at_wrist,
        fragmented_at_upper_leg,
        fragmented_at_knee,
        fragmented_at_ankle
      `
      )
      .eq('status', 'pending_review');

    if (queryError) return { images: [], error: queryError.message };

    // Enhance the images with metadata
    const enhancedImages = await Promise.all(
      pendingData.map(async (approval) => {
        const storagePath = normalizeStoragePath(approval.gcs_path);
        if (!storagePath) {
          console.error('Invalid storage path:', approval.gcs_path);
          return null; // Handle the invalid path case
        }

        const storageClient = supabase.storage.from(storageBucket);
        const { data: signedUrlData, error: signedUrlError } = await storageClient.createSignedUrl(
          storagePath,
          60 * 60 // 1 hour expiration
        );

        const resolvedUrl =
          signedUrlError || !signedUrlData?.signedUrl
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storageBucket}/${storagePath}`
            : signedUrlData.signedUrl;

        // Map database fields to PendingImageMetadata type
        // Only include fields that have values (not null/undefined/empty)
        const metadata: Partial<PendingImageMetadata> = {};

        // Basic Information - only include if not null/undefined/empty
        if (approval.artifact_title) metadata.title_of_object = approval.artifact_title;
        if (approval.suspected_current_location)
          metadata.suspected_current_location = approval.suspected_current_location;
        if (approval.first_appearance_year != null) metadata.year_first_appearance = approval.first_appearance_year;
        if (approval.first_appearance_year_outside_cambodia != null)
          metadata.year_first_appearance_outside_cambodia = approval.first_appearance_year_outside_cambodia;
        if (approval.image_source) metadata.image_source = approval.image_source;
        if (approval.photograph_location) metadata.photograph_location = approval.photograph_location;
        if (approval.dealer_name) metadata.dealer_gallery_collector_name = approval.dealer_name;
        if (approval.material) metadata.material_subject = approval.material;

        // Boolean fields - only include if true (to keep metadata object clean)
        if (approval.repatriated === true) metadata.repatriated = true;
        if (approval.multiple_heads === true) metadata.multiple_heads = true;
        if (approval.four_arms === true) metadata.four_arms = true;
        if (approval.eight_arms === true) metadata.eight_arms = true;
        if (approval.ten_arms === true) metadata.ten_arms = true;
        if (approval.over_ten_arms === true) metadata.over_ten_arms = true;
        if (approval.fragmentary === true) metadata.fragmentary = true;
        if (approval.fragments_from_multiple_statues === true) metadata.fragments_from_multiple_statues = true;

        // Body parts present
        if (approval.head_present === true) metadata.head_present = true;
        if (approval.torso_present === true) metadata.torso_present = true;
        if (approval.shoulder_elbow_present === true) metadata.shoulder_elbow_present = true;
        if (approval.elbow_wrist_present === true) metadata.elbow_wrist_present = true;
        if (approval.hand_present === true) metadata.hand_present = true;
        if (approval.hip_knee_present === true) metadata.hip_knee_present = true;
        if (approval.knee_ankle_present === true) metadata.knee_ankle_present = true;
        if (approval.foot_present === true) metadata.foot_present = true;
        if (approval.base_present === true) metadata.base_present = true;

        // Fragmentation points - note the field name mapping differences
        if (approval.fragmented_at_neck === true) metadata.fragmented_at_neck = true;
        if (approval.fragmented_at_shoulder === true) metadata.fragment_at_shoulder = true; // Note: "fragment" not "fragmented"
        if (approval.fragmented_at_elbow === true) metadata.fragmented_at_elbow = true;
        if (approval.fragmented_at_wrist === true) metadata.fragmented_at_wrist = true;
        if (approval.fragmented_at_upper_leg === true) metadata.fragmented_upper_leg = true; // Note: "fragmented_upper_leg" not "fragmented_at_upper_leg"
        if (approval.fragmented_at_knee === true) metadata.fragmented_at_knee = true;
        if (approval.fragmented_at_ankle === true) metadata.fragmented_at_ankle = true;

        return {
          image_id: approval.image_id,
          internal_reference_number: approval.internal_reference_number,
          image_url: resolvedUrl,
          short_description: approval.short_description,
          ai_generated: approval.ai_generated,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
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
