import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { ProcessMetadataRequest, ProcessMetadataResponse, ArtifactSearchMetadata } from '@/app/types';
import { callLLM } from '@/lib/llm/callMetadataLLM';
import { parseLLMResponse } from '@/lib/llm/parseLLMResponse';
import { insertArtifactMetadata } from '@/lib/llm/insertArtifactMetadata';
import { getRateLimitStatus } from '@/lib/rate-limit/uploadRateLimit';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as ProcessMetadataRequest;
    const { imageId, gcsPath, shortDescription, internalReferenceNumber } = body; // Destructure internalReferenceNumber

    // validate common fields
    if (!imageId || !gcsPath || !shortDescription || !internalReferenceNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: imageId, gcsPath, shortDescription, and internalReferenceNumber' },
        { status: 400 }
      );
    }

    // Validate processWithAI flag
    if (typeof body.processWithAI !== 'boolean') {
      return NextResponse.json({ error: 'processWithAI must be a boolean value' }, { status: 400 });
    }

    // Check rate limit if AI processing is requested
    if (body.processWithAI) {
      const rateLimitStatus = getRateLimitStatus();
      if (rateLimitStatus.isLimited) {
        return NextResponse.json(
          {
            success: false,
            imageId,
            error:
              'AI metadata generation is temporarily unavailable due to rate limits. Please use manual metadata entry.',
            requiresManualEntry: true,
            rateLimitStatus,
          },
          { status: 429 }
        );
      }
    }

    console.log(`Processing metadata for image ${imageId}... (AI: ${body.processWithAI})`);

    let metadata: ArtifactSearchMetadata;

    if (body.processWithAI) {
      // AI Processing Path
      const { longDescription } = body;

      if (!longDescription) {
        return NextResponse.json({ error: 'longDescription is required for AI processing' }, { status: 400 });
      }

      let aiMetadata: ArtifactSearchMetadata | null = null;
      let lastError: unknown = null;

      // Try calling the LLM up to 2 times
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const llmResponse = await callLLM({
            longDescription,
            shortDescription,
          });
          const parsed = parseLLMResponse(llmResponse);
          aiMetadata = parsed;
          break; // success
        } catch (err) {
          lastError = err;
          console.warn(`LLM attempt ${attempt} failed`, err);
        }
      }

      if (!aiMetadata) {
        // LLM failed completely - prompt user for manual entry
        console.error('LLM failed twice, requiring manual metadata entry.', lastError);
        const errorMessage = lastError instanceof Error ? lastError.message : 'AI processing failed';

        const response: ProcessMetadataResponse = {
          success: false,
          imageId,
          error: `AI metadata extraction failed: ${errorMessage}`,
          requiresManualEntry: true,
        };

        return NextResponse.json(response, { status: 422 }); // 422 Unprocessable Entity
      }

      // Success: Carry through user-provided descriptions
      metadata = {
        ...aiMetadata,
        shortDescription,
        longDescription: body.longDescription,
        aiGenerated: true, // Mark as AI-generated on success
      };
    } else {
      // Manual Processing Path
      const { manualMetadata, longDescription } = body;

      metadata = {
        basicSearchMetadata: manualMetadata.basicSearchMetadata,
        advancedSearchMetadata: manualMetadata.advancedSearchMetadata,
        shortDescription,
        longDescription,
        aiGenerated: false, // Mark as manually entered
      };
    }

    // Insert into database (works for both success and fallback)
    await insertArtifactMetadata(imageId, gcsPath, internalReferenceNumber, metadata); // Pass internalReferenceNumber

    const response: ProcessMetadataResponse = {
      success: true,
      imageId,
      metadata,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error('Error processing metadata:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    const response: ProcessMetadataResponse = {
      success: false,
      imageId: '',
      error: errorMessage,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
