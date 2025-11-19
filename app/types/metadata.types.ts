/**
 * metadata.types.ts
 *
 * Type definitions for metadata processing and artifact uploads
 */

/**
 * Base request body for metadata processing endpoint
 */
interface BaseProcessMetadataRequest {
  /** The internal reference ID of the uploaded image */
  imageId: string;
  /** GCS Path to be stored with imageId in the log table*/
  gcsPath: string;
  /** User-provided short summary of the artifact */
  shortDescription: string;
  /** User-provided detailed description of the artifact */
  longDescription?: string;
  /** Internal reference number for tracking */
  internalReferenceNumber: string;
}

/**
 * Request for AI-generated metadata processing
 * AI will analyze the descriptions and generate structured metadata
 */
export interface AIProcessMetadataRequest extends BaseProcessMetadataRequest {
  processWithAI: true;
  longDescription: string; // Required for AI processing
}

/**
 * Request for manually-entered metadata
 * User provides pre-filled structured metadata
 */
export interface ManualProcessMetadataRequest extends BaseProcessMetadataRequest {
  processWithAI: false;
  /** Manually entered metadata provided by the user */
  manualMetadata: ManualArtifactMetadata;
}

/**
 * Union type for the process-metadata endpoint
 */
export type ProcessMetadataRequest = AIProcessMetadataRequest | ManualProcessMetadataRequest;

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
  /** Whether manual metadata entry is required (set when AI processing fails completely) */
  requiresManualEntry?: boolean;
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
  handPresent?: boolean;
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

/**
 * Metadata for manually-entered artifacts
 * Does not include AI-specific fields like rawLlmResponse
 */
export interface ManualArtifactMetadata {
  basicSearchMetadata?: Partial<BasicSearchMetadata>;
  advancedSearchMetadata?: Partial<AdvancedSearchMetadata>;
}

/**
 * Complete artifact search metadata (used for storage and responses)
 * Includes both manual and AI-generated data
 */
export interface ArtifactSearchMetadata {
  // Our defined interfaces from above
  basicSearchMetadata?: Partial<BasicSearchMetadata>;
  advancedSearchMetadata?: Partial<AdvancedSearchMetadata>;
  // ============================================
  // METADATA TRACKING
  // ============================================
  /** Raw LLM response for debugging/audit purposes (only for AI-generated) */
  rawLlmResponse?: string;
  // Request information
  shortDescription?: string;
  longDescription?: string;
  /** Whether the metadata was AI-generated (true) or manually entered (false) */
  aiGenerated?: boolean;
}
