import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs/server';
import type { ProcessMetadataRequest, ProcessMetadataResponse, ArtifactSearchMetadata } from '@/app/types';
import { callLLM } from '@/lib/llm/callMetadataLLM';
import { parseLLMResponse } from '@/lib/llm/parseLLMResponse';
import { insertArtifactMetadata } from '@/lib/llm/insertArtifactMetadata';
import { createDefaultArtifactSearchMetadata } from '@/lib/llm/defaultArtifactMetadata';

export async function POST(request: NextRequest) {
  try {
    // COMMENT THIS OUT IF YOU WANT TO TEST THE ENDPOINT DIRECTLY
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = (await request.json()) as ProcessMetadataRequest;
    const { imageId, longDescription, shortDescription } = body;

    // validate
    if (!imageId || !longDescription) {
      return NextResponse.json({ error: 'Missing required fields: imageId and longDescription' }, { status: 400 });
    }

    console.log(`Processing metadata for image ${imageId}...`);

    // Try calling the LLM up to 2 times; on failure fallback to defaults
    let metadata: ArtifactSearchMetadata | null = null;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const llmResponse = await callLLM({
          longDescription,
          shortDescription,
        });

        const parsed = parseLLMResponse(llmResponse);
        metadata = parsed;
        break; // success
      } catch (err) {
        lastError = err;
        console.warn(`LLM attempt ${attempt} failed`, err);
      }
    }

    if (!metadata) {
      console.error('LLM failed twice, using fallback defaults.', lastError);
      metadata = createDefaultArtifactSearchMetadata(shortDescription, longDescription);
    } else {
      // Carry through user-provided descriptions on success as well
      metadata.shortDescription = shortDescription;
      metadata.longDescription = longDescription;
    }

    // Insert into database (works for both success and fallback)
    await insertArtifactMetadata(imageId, metadata);

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
