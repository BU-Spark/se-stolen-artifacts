// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
      async json() {
        return body;
      },
    }),
  },
}));

// mock auth, llm, parser, and insert
jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn(async () => ({ userId: 'u1' })) }));
jest.mock('@/lib/llm/callMetadataLLM', () => ({ callLLM: jest.fn(async () => 'llm-response') }));
jest.mock('@/lib/llm/parseLLMResponse', () => ({
  parseLLMResponse: jest.fn(() => ({ basicSearchMetadata: {}, advancedSearchMetadata: {} })),
}));
jest.mock('@/lib/db/insertArtifactMetadata', () => ({
  insertArtifactMetadata: jest.fn(async () => ({ success: true })),
}));
jest.mock('@/lib/rate-limit/uploadRateLimit', () => ({ getRateLimitStatus: jest.fn(() => ({ isLimited: false })) }));

import { POST } from './route';

type MetadataPayload = {
  imageId?: string;
  gcsPath?: string;
  shortDescription?: string;
  internalReferenceNumber?: string;
  processWithAI: boolean;
  manualMetadata?: {
    basicSearchMetadata: Record<string, unknown>;
    advancedSearchMetadata: Record<string, unknown>;
  };
  longDescription?: string;
};

const makeReq = (payload: MetadataPayload) => ({ json: async () => payload });

describe('POST /api/process-metadata', () => {
  it('returns 401 when not authenticated', async () => {
    const clerk = jest.requireMock('@clerk/nextjs/server') as { auth: jest.Mock };
    clerk.auth.mockResolvedValueOnce({ userId: null });

    const res = await POST(makeReq({ processWithAI: false }));
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 when required fields missing', async () => {
    const res = await POST(makeReq({ processWithAI: false }));
    expect(res.status).toBe(400);
  });

  it('returns 422 when LLM fails twice', async () => {
    const llm = jest.requireMock('@/lib/llm/callMetadataLLM') as { callLLM: jest.Mock };
    llm.callLLM.mockRejectedValueOnce(new Error('fail1'));
    llm.callLLM.mockRejectedValueOnce(new Error('fail2'));

    const res = await POST(
      makeReq({
        imageId: 'i1',
        gcsPath: 'p',
        shortDescription: 's',
        internalReferenceNumber: 'r',
        processWithAI: true,
        longDescription: 'long',
      })
    );
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.requiresManualEntry).toBe(true);
  });

  it('inserts metadata on success', async () => {
    const res = await POST(
      makeReq({
        imageId: 'i1',
        gcsPath: 'p',
        shortDescription: 's',
        internalReferenceNumber: 'r',
        processWithAI: false,
        manualMetadata: { basicSearchMetadata: {}, advancedSearchMetadata: {} },
        longDescription: 'd',
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
