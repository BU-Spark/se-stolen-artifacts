import type { ArtifactSearchMetadata } from '@/app/types';

/**
 * Parses the raw LLM response into structured metadata.
 * @param llmResponse - The raw response from the LLM (JSON string or object).
 * @returns Parsed metadata in the ArtifactSearchMetadata format.
 */
export function parseLLMResponse(llmResponse: string): ArtifactSearchMetadata {
  try {
    console.log('Raw LLM Response:', llmResponse);

    const parsedResponse = JSON.parse(llmResponse);

    if (!parsedResponse.basicSearchMetadata || !parsedResponse.advancedSearchMetadata) {
      throw new Error('Invalid LLM response format: Missing required metadata fields.');
    }

    // Map the parsed response to the ArtifactSearchMetadata type
    const metadata: ArtifactSearchMetadata = {
      basicSearchMetadata: {
        subject: parsedResponse.basicSearchMetadata.subject || null,
        dealerName: parsedResponse.basicSearchMetadata.dealerName || null,
        suspectedCurrentLocation: parsedResponse.basicSearchMetadata.suspectedCurrentLocation || null,
        artifactTitle: parsedResponse.basicSearchMetadata.artifactTitle || null,
        photographLocation: parsedResponse.basicSearchMetadata.photographLocation || null,
        firstAppearanceYear: parsedResponse.basicSearchMetadata.firstAppearanceYear || null,
        firstAppearanceYearOutsideCambodia:
          parsedResponse.basicSearchMetadata.firstAppearanceYearOutsideCambodia || null,
        repatriated: parsedResponse.basicSearchMetadata.repatriated || false,
      },
      advancedSearchMetadata: {
        // misc
        imageSource: parsedResponse.advancedSearchMetadata.imageSource || null,
        material: parsedResponse.advancedSearchMetadata.material || null,
        hasInscription: parsedResponse.advancedSearchMetadata.hasInscription || false,
        multipleHeads: parsedResponse.advancedSearchMetadata.multipleHeads || false,
        // num arms
        fourArms: parsedResponse.advancedSearchMetadata.fourArms || false,
        eightArms: parsedResponse.advancedSearchMetadata.eightArms || false,
        tenArms: parsedResponse.advancedSearchMetadata.tenArms || false,
        overTenArms: parsedResponse.advancedSearchMetadata.overTenArms || false,
        // fragmentary
        fragmentary: parsedResponse.advancedSearchMetadata.fragmentary || false,
        fragmentsFromMultipleStatues: parsedResponse.advancedSearchMetadata.fragmentsFromMultipleStatues || false,
        // present body parts
        headPresent: parsedResponse.advancedSearchMetadata.headPresent || false,
        torsoPresent: parsedResponse.advancedSearchMetadata.torsoPresent || false,
        shoulderElbowPresent: parsedResponse.advancedSearchMetadata.shoulderElbowPresent || false,
        elbowWristPresent: parsedResponse.advancedSearchMetadata.elbowWristPresent || false,
        hipKneePresent: parsedResponse.advancedSearchMetadata.hipKneePresent || false,
        kneeAnklePresent: parsedResponse.advancedSearchMetadata.kneeAnklePresent || false,
        footPresent: parsedResponse.advancedSearchMetadata.footPresent || false,
        basePresent: parsedResponse.advancedSearchMetadata.basePresent || false,
        // fragmentation Points
        fragmentedAtNeck: parsedResponse.advancedSearchMetadata.fragmentedAtNeck || false,
        fragmentedAtShoulder: parsedResponse.advancedSearchMetadata.fragmentedAtShoulder || false,
        fragmentedAtElbow: parsedResponse.advancedSearchMetadata.fragmentedAtElbow || false,
        fragmentedAtWrist: parsedResponse.advancedSearchMetadata.fragmentedAtWrist || false,
        fragmentedAtUpperLeg: parsedResponse.advancedSearchMetadata.fragmentedAtUpperLeg || false,
        fragmentedAtKnee: parsedResponse.advancedSearchMetadata.fragmentedAtKnee || false,
        fragmentedAtAnkle: parsedResponse.advancedSearchMetadata.fragmentedAtAnkle || false,
      },
      rawLlmResponse: llmResponse, // Store the raw response for debugging/audit purposes
    };

    return metadata;
  } catch (error) {
    console.error('Failed to parse LLM response:', error);
    throw new Error('Error parsing LLM response: Invalid format or missing fields.');
  }
}
