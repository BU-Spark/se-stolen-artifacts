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

// mock supabase
jest.mock('@/lib/db/supabase', () => {
  const fromMock = jest.fn((table?: string) => {
    if (table === 'statues') {
      return {
        select: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ data: [], error: null })) })),
      };
    }

    if (table === 'images') {
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({ not: jest.fn(() => Promise.resolve({ data: [], error: null })) })),
        })),
      };
    }

    // default fallback
    return { select: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ data: [], error: null })) })) };
  });

  return { supabase: { from: fromMock }, __testMocks: { fromMock } };
});

import { GET } from './route';

describe('GET /api/admin/statues', () => {
  it('returns statues list even when empty', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toHaveProperty('statues');
  });

  it('propagates db errors', async () => {
    const { __testMocks } = jest.requireMock('@/lib/db/supabase') as { __testMocks: { fromMock: jest.Mock } };
    __testMocks.fromMock.mockImplementationOnce(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ data: null, error: { message: 'boom' } })) })),
    }));

    const res = await GET();
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: 'boom' });
  });
});
