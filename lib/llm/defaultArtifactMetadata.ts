import type { ArtifactSearchMetadata } from '@/app/types';

/**
 * Creates a default ArtifactSearchMetadata object to use when the LLM fails twice.
 * - Uses empty objects for basic/advanced to avoid null JSON dereferencing in SQL function
 * - Carries through user-provided descriptions so UI requirements are satisfied
 */
export function createDefaultArtifactSearchMetadata(
  shortDescription: string,
  longDescription?: string
): ArtifactSearchMetadata {
  return {
    basicSearchMetadata: {},
    advancedSearchMetadata: {},
    rawLlmResponse: 'FALLBACK_DEFAULTS',
    shortDescription,
    longDescription,
  };
}
