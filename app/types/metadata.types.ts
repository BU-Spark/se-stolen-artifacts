/**
 * metadata.types.ts
 *
 * Type definitions for metadata processing and artifact uploads
 */

/**
 * Request body for the LLM metadata processing endpoint
 * This data is sent to /api/process-metadata
 */
export interface ProcessMetadataRequest {
  /** The internal reference ID of the uploaded image */
  imageId: string;
  /** User-provided detailed description of the artifact */
  longDescription: string;
  /** User-provided short summary of the artifact */
  shortDescription: string;
}

/**
 * Expected response from the LLM metadata processing endpoint
 */
export interface ProcessMetadataResponse {
  /** Success status of the processing */
  success: boolean;
  /** The image ID that was processed */
  imageId: string;
  /** Extracted and structured metadata from LLM */
  metadata?: ArtifactSearchMetadata;
  /** Error message if processing failed */
  error?: string;
}

export interface BasicSearchMetadata {
  // ============================================
  // BASIC FIELDS (from SearchForm constants)
  // ============================================
  /** Subject of the artifact (e.g., "Vishnu", "Buddha") */
  subject?: string;
  /** Dealer name (e.g., "John Dwyer Oriental Art") */
  dealerName?: string;
  /** Suspected current location (e.g., "Getty Museum") */
  suspectedCurrentLocation?: string;
  /** Title of the artifact (e.g., "Head of Buddha") */
  artifactTitle?: string;
  /** Location where photo was taken (e.g., "New York") */
  photographLocation?: string;
  /** Year of first known appearance */
  firstAppearanceYear?: number;
  /** Year of first known appearance outside Cambodia */
  firstAppearanceYearOutsideCambodia?: number;
  /** Whether the artifact has been repatriated */
  repatriated?: boolean;
}

export interface AdvancedSearchMetadata {
  // ============================================
  // ADVANCED FIELDS (from SearchForm constants and artifact attributes)
  // ============================================
  /** Origin/source of the artifact image (e.g., "Getty Museum") */
  imageSource?: string;
  /** Primary material (e.g., "Sandstone", "Bronze", "Stone") */
  material?: string;
  /** Whether the artifact has inscriptions */
  hasInscription?: boolean;

  // Head/Arms Configuration
  multipleHeads?: boolean;
  fourArms?: boolean;
  eightArms?: boolean;
  tenArms?: boolean;
  overTenArms?: boolean;
  // Overall Condition
  fragmentary?: boolean;
  fragmentsFromMultipleStatues?: boolean;
  // Body Parts Present
  headPresent?: boolean;
  torsoPresent?: boolean;
  shoulderElbowPresent?: boolean;
  elbowWristPresent?: boolean;
  hipKneePresent?: boolean;
  kneeAnklePresent?: boolean;
  footPresent?: boolean;
  basePresent?: boolean;
  // Fragmentation Points
  fragmentedAtNeck?: boolean;
  fragmentedAtShoulder?: boolean;
  fragmentedAtElbow?: boolean;
  fragmentedAtWrist?: boolean;
  fragmentedAtUpperLeg?: boolean;
  fragmentedAtKnee?: boolean;
  fragmentedAtAnkle?: boolean;
}

export interface ArtifactSearchMetadata {
  // Our defined interfaces from above
  basicSearchMetadata?: Partial<BasicSearchMetadata>;
  advancedSearchMetadata?: Partial<AdvancedSearchMetadata>;
  // ============================================
  // METADATA TRACKING
  // ============================================
  /** Raw LLM response for debugging/audit purposes */
  rawLlmResponse?: string;
  // Request information
  // Short is required for UI
  shortDescription: string;
  longDescription?: string;
  /** Whether the metadata was AI-generated (true) or manually entered (false) */
  aiGenerated?: boolean;
}
