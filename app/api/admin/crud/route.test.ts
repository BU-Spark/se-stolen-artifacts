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

// mock create/update handlers
jest.mock('@/lib/crud-handlers/create', () => ({
  handleCreate: jest.fn(async (req: { table: string; action: string; data?: Record<string, unknown> }) => ({
    record: { id: 'created', ...req },
  })),
}));

jest.mock('@/lib/crud-handlers/update', () => ({
  handleUpdate: jest.fn(
    async (req: { id?: string; table: string; action: string; data?: Record<string, unknown> }) => ({
      record: { id: req.id, ...req },
    })
  ),
}));

import { POST } from './route';

const makeReq = <T>(payload: T) => ({ json: async () => payload });

describe('POST /api/admin/crud', () => {
  it('returns 400 when table or action are missing', async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Missing required fields: table and action' });
  });

  it('returns 404 for unknown table', async () => {
    const res = await POST(makeReq({ table: 'nope', action: 'create' }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(String(body.error)).toMatch(/is not registered/);
  });

  it('returns 403 when action not permitted for table', async () => {
    // use a table from TABLE_REGISTRY that is read-only
    const res = await POST(makeReq({ table: 'image_attribute_overrides', action: 'delete' }));
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({ error: expect.any(String) });
  });

  it('calls create handler on create action', async () => {
    // create on statues should be permitted
    const res = await POST(makeReq({ table: 'statues', action: 'create', data: { name: 'X' } }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toHaveProperty('result');
  });
});
