// Mock a response
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
  const selectMock = jest.fn();
  const eqMock = jest.fn();
  const updateMock = jest.fn();
  const fromMock = jest.fn();

  // from().update().eq().select()
  fromMock.mockImplementation(() => ({ update: updateMock }));
  updateMock.mockImplementation(() => ({ eq: eqMock }));
  eqMock.mockImplementation(() => ({ select: selectMock }));

  return {
    supabase: {
      from: fromMock,
    },
    __testMocks: {
      select: selectMock,
      eq: eqMock,
      update: updateMock,
      from: fromMock,
    },
  };
});

// retrieve mock tests
const { __testMocks } = jest.requireMock('@/lib/db/supabase') as {
  __testMocks: {
    select: jest.Mock;
    eq: jest.Mock;
    update: jest.Mock;
    from: jest.Mock;
  };
};

const { select: selectMock, eq: eqMock, update: updateMock, from: fromMock } = __testMocks;

import { POST } from './route';

const createRequest = <T>(payload: T) => ({
  json: async () => payload,
});

describe('POST /api/admin/deny', () => {
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

  beforeEach(() => {
    selectMock.mockReset();
    eqMock.mockReset();
    updateMock.mockReset();
    fromMock.mockReset();

    // default behavior: select resolves to empty data, no error
    selectMock.mockResolvedValue({ data: [], error: null });
    fromMock.mockImplementation(() => ({ update: updateMock }));
    updateMock.mockImplementation(() => ({ eq: eqMock }));
    eqMock.mockImplementation(() => ({ select: selectMock }));
  });

  it('returns 400 when imageId is missing', async () => {
    const response = await POST(createRequest({}));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'imageId is required' });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('returns 500 when Supabase update fails on image_id', async () => {
    selectMock.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });

    const response = await POST(createRequest({ imageId: 'abc123' }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'boom' });
    expect(fromMock).toHaveBeenCalledWith('temp_artifact_metadata');
    expect(eqMock).toHaveBeenCalledWith('image_id', 'abc123');
    expect(selectMock).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when fallback update fails on internal_reference_number', async () => {
    selectMock
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'secondary failure' } });

    const response = await POST(createRequest({ imageId: 'abc123' }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'secondary failure' });
    expect(eqMock).toHaveBeenNthCalledWith(1, 'image_id', 'abc123');
    expect(eqMock).toHaveBeenNthCalledWith(2, 'internal_reference_number', 'abc123');
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  it('returns 404 when no matching pending image is found', async () => {
    selectMock.mockResolvedValueOnce({ data: [], error: null }).mockResolvedValueOnce({ data: [], error: null });

    const response = await POST(createRequest({ imageId: 'missing' }));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: 'No pending image found for identifier missing',
    });
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  it('returns success when update succeeds on image_id', async () => {
    selectMock.mockResolvedValueOnce({ data: [{ image_id: 'abc123' }], error: null });

    const response = await POST(createRequest({ imageId: 'abc123' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, message: 'Image rejected' });
    expect(eqMock).toHaveBeenCalledTimes(1);
    expect(eqMock).toHaveBeenCalledWith('image_id', 'abc123');
  });

  it('returns success when fallback update hits internal_reference_number', async () => {
    selectMock
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [{ internal_reference_number: 'abc123' }], error: null });

    const response = await POST(createRequest({ imageId: 'abc123' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, message: 'Image rejected' });
    expect(eqMock).toHaveBeenNthCalledWith(1, 'image_id', 'abc123');
    expect(eqMock).toHaveBeenNthCalledWith(2, 'internal_reference_number', 'abc123');
  });

  it('returns 500 when request parsing throws', async () => {
    const badRequest = {
      json: async () => {
        throw new Error('broken payload');
      },
    };

    const response = await POST(badRequest);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'broken payload' });
    expect(fromMock).not.toHaveBeenCalled();
  });
});
