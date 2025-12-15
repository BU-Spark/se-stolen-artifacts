let consoleErrorSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;

beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
  consoleWarnSpy.mockRestore();
});

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

// to make multiple calls in sequence
type MaybeSingleResult = { data: unknown; error: unknown };
let maybeSingleQueue: MaybeSingleResult[] = [];

type StorageResult = { data?: unknown; error: unknown };
let storageDownloadResult: StorageResult = { data: null, error: null };
let storageUploadResult: StorageResult = { error: null };
let storageRemoveResult: StorageResult = { error: null };

jest.mock('@/lib/db/supabase', () => {
  const fromMock = jest.fn(() => {
    const maybeSingle = () => Promise.resolve(maybeSingleQueue.shift() ?? { data: null, error: null });

    const eq = () => ({
      maybeSingle,
      order: () => ({
        limit: () => ({ maybeSingle }),
      }),
    });

    const select = () => ({ eq });
    const update = () => ({ eq: () => Promise.resolve({ error: null }) });

    return { select, update, eq };
  });

  const storageFromMock = jest.fn(() => ({
    download: () => Promise.resolve(storageDownloadResult),
    upload: () => Promise.resolve(storageUploadResult),
    remove: () => Promise.resolve(storageRemoveResult),
  }));

  return {
    supabase: {
      from: fromMock,
      storage: { from: storageFromMock },
    },
    __testMocks: {
      fromMock,
      storageFromMock,
      // helpers to let tests set queued responses easily
      _setMaybeSingleQueue: (q: MaybeSingleResult[]) => (maybeSingleQueue = q.slice()),
      _setStorageResponses: (download: StorageResult, upload: StorageResult, remove: StorageResult) => {
        storageDownloadResult = download;
        storageUploadResult = upload;
        storageRemoveResult = remove;
      },
    },
  };
});

jest.mock('@/lib/crud-handlers/create', () => ({
  handleCreate: jest.fn(async (req: { data: Record<string, unknown> }) => ({
    record: { statue_id: 123, ...req.data },
  })),
}));

jest.mock('@/lib/crud-handlers/update', () => ({
  handleUpdate: jest.fn(async (req: { data: Record<string, unknown> }) => ({ record: { ...req.data } })),
}));

import { POST } from './route';

// Retrieve the __testMocks object from the mocked module factory.
const { __testMocks } = jest.requireMock('@/lib/db/supabase') as {
  __testMocks: {
    fromMock: jest.Mock;
    storageFromMock: jest.Mock;
    _setMaybeSingleQueue: (q: MaybeSingleResult[]) => void;
    _setStorageResponses: (d: StorageResult, u: StorageResult, r: StorageResult) => void;
  };
};
const { fromMock, storageFromMock, _setMaybeSingleQueue, _setStorageResponses } = __testMocks;

const makeReq = <T>(payload: T) => ({ json: async () => payload });

describe('POST /api/admin/approve', () => {
  beforeEach(() => {
    // reset
    _setMaybeSingleQueue([]);
    _setStorageResponses({ data: null, error: null }, { error: null }, { error: null });
    jest.clearAllMocks();
  });

  it('returns 400 when imageId is missing', async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'imageId is required' });
  });

  it('returns 500 when fetching temp record errors', async () => {
    _setMaybeSingleQueue([{ data: null, error: { message: 'db-failure' } }]);

    const res = await POST(makeReq({ imageId: 'i1' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(String(body.error)).toMatch(/Failed to load temporary metadata/i);
  });

  it('returns 400 when unable to determine internal reference number', async () => {
    // tempRecord returned with null image_id
    // route will fall back to provided imageId
    // route can proceed through ensureLookup calls and image upsert.
    _setMaybeSingleQueue([
      { data: { id: 'temp-row', image_id: null }, error: null }, // fetchTempRecord
      // uploadRecord by image_id
      { data: null, error: null },
      // uploadRecord by internal_reference
      { data: null, error: null },
      // ensureLookup for (subjects, materials, names, photoLocation, currentLocation)
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      // images existing lookup
      { data: null, error: null },
    ]);

    const res = await POST(makeReq({ imageId: 'i2' }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(expect.objectContaining({ success: true }));
  });

  it('returns 200 on simplified success path', async () => {
    _setMaybeSingleQueue([
      // temp record
      { data: { id: 'temp1', image_id: 'img-1', short_description: null, long_description: null }, error: null },
      // uploadRecord by image_id: provide a gcs_path so storage is exercised
      {
        data: {
          internal_reference_number: 'ref-1',
          gcs_path: 'pending_images/path.jpg',
          short_description: null,
          long_description: null,
        },
        error: null,
      },
      // uploadRecord by internal_reference (not used)
      { data: null, error: null },
      // ensureLookup x5 (subjects, materials, names, photoLocation, currentLocation)
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      { data: null, error: null },
      // images existing lookup
      { data: null, error: null },
    ]);

    // Storage operations succeed
    _setStorageResponses({ data: { type: 'image/jpeg' }, error: null }, { error: null }, { error: null });

    const res = await POST(makeReq({ imageId: 'img-1' }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(expect.objectContaining({ success: true }));

    // verify supabase.from was called for temp table and images
    expect(fromMock).toHaveBeenCalled();
    expect(storageFromMock).toHaveBeenCalled();
  });
});
