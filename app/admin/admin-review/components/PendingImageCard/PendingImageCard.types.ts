export type PendingImageMetadata = {
  // Basic Information
  suspected_current_location?: string;
  year_first_appearance?: number;
  year_first_appearance_outside_cambodia?: number;
  image_source?: string;
  title_of_object?: string;
  photograph_location?: string;
  dealer_gallery_collector_name?: string;
  material_subject?: string;

  // Boolean fields
  repatriated?: boolean;
  multiple_heads?: boolean;
  four_arms?: boolean;
  eight_arms?: boolean;
  ten_arms?: boolean;
  over_ten_arms?: boolean;
  fragmentary?: boolean;
  fragments_from_multiple_statues?: boolean;

  // Body parts present
  head_present?: boolean;
  torso_present?: boolean;
  shoulder_elbow_present?: boolean;
  elbow_wrist_present?: boolean;
  hand_present?: boolean;
  hip_knee_present?: boolean;
  knee_ankle_present?: boolean;
  foot_present?: boolean;
  base_present?: boolean;

  // Fragmentation points
  fragmented_at_neck?: boolean;
  fragment_at_shoulder?: boolean;
  fragmented_at_elbow?: boolean;
  fragmented_at_wrist?: boolean;
  fragmented_upper_leg?: boolean;
  fragmented_at_knee?: boolean;
  fragmented_at_ankle?: boolean;
};

export type PendingImage = {
  image_id: string; // Added image_id to align with API response
  internal_reference_number: string;
  image_url?: string | null;
  title?: string | null;
  description?: string | null;
  short_description?: string | null;
  ai_generated?: boolean | null;
  metadata?: PendingImageMetadata;
};

export type MetadataViewMode = 'collapsed' | 'viewing' | 'editing';
