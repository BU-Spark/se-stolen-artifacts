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

// mock auth and pending handler
jest.mock('@/lib/pending-images/pendingImages', () => ({
  handleGetPendingImages: jest.fn(async () => ({ images: [{ image_id: 'i1' }], error: null })),
}));

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn(async () => ({ userId: 'admin' })) }));

// We'll import the route inside each test using `jest.isolateModules`
// to ensure `ADMIN_ID` and mocks are applied before the module is evaluated.
type TestResponse = { status: number; json: () => Promise<unknown> };
let GET: (req?: Request, params?: unknown) => Promise<TestResponse>;

describe('GET /api/admin/pending-images', () => {
  beforeEach(() => {
    const clerk = jest.requireMock('@clerk/nextjs/server') as { auth: jest.Mock };
    // default to admin for tests; individual tests can override with mockResolvedValueOnce
    clerk.auth.mockResolvedValue({ userId: 'admin' });
  });
  it('returns 401 when not admin', async () => {
    const clerk = jest.requireMock('@clerk/nextjs/server') as { auth: jest.Mock };
    clerk.auth.mockResolvedValueOnce({ userId: 'someone' });

    jest.isolateModules(() => {
      process.env.ADMIN_ID = 'admin';
      // allow require import here so module is evaluated under isolateModules
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      GET = require('./route').GET;
    });

    const res = await GET();
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns images on success', async () => {
    // ensure the auth mock returns an admin user for this success case
    // the beforeEach already sets the default to admin
    jest.isolateModules(() => {
      process.env.ADMIN_ID = 'admin';
      // allow require import here so module is evaluated under isolateModules
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      GET = require('./route').GET;
    });

    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ images: [{ image_id: 'i1' }] });
  });
});
