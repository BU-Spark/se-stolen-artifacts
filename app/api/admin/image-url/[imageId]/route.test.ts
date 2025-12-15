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

// Mock supabase storage and db
jest.mock('@/lib/db/supabase', () => {
  const fromMock = jest.fn(() => ({
    select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn() })) })),
  }));

  const storageFromMock = jest.fn(() => ({
    createSignedUrl: jest.fn(() => Promise.resolve({ data: { signedUrl: 'https://signed.example' }, error: null })),
  }));

  return {
    supabase: { from: fromMock, storage: { from: storageFromMock } },
    __testMocks: { fromMock, storageFromMock },
  };
});

import { GET } from './route';

const makeParams = (imageId: string) => ({ params: Promise.resolve({ imageId }) });

describe('GET /api/admin/image-url/[imageId]', () => {
  it('returns 404 when image not found', async () => {
    const { __testMocks } = jest.requireMock('@/lib/db/supabase') as { __testMocks: { fromMock: jest.Mock } };
    const { fromMock } = __testMocks;
    // single returns error
    fromMock.mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'nope' } })),
        })),
      })),
    }));

    const res = await GET({} as Request, makeParams('missing'));
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: 'Image not found' });
  });

  it('returns signed url on success', async () => {
    const { __testMocks } = jest.requireMock('@/lib/db/supabase') as {
      __testMocks: { fromMock: jest.Mock; storageFromMock: jest.Mock };
    };
    const { fromMock, storageFromMock } = __testMocks;

    // db returns image with image_gcs
    fromMock.mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { image_gcs: 'spark/path.jpg' }, error: null })),
        })),
      })),
    }));

    storageFromMock.mockImplementationOnce(() => ({
      createSignedUrl: jest.fn(() => Promise.resolve({ data: { signedUrl: 'https://signed.example' }, error: null })),
    }));

    const res = await GET({} as Request, makeParams('ref1'));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ url: 'https://signed.example' });
  });
});
