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

// mock stream helper
jest.mock('@/lib/download/streamImageById', () => ({
  streamImageById: jest.fn(async (id: string) => {
    if (id === 'notfound') return { error: 'missing' };
    const buf = Buffer.from('hello');
    // Return a sliced ArrayBuffer that contains only the buffer's bytes
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    return { fileStream: { arrayBuffer: async () => ab }, fileName: 'f.bin' };
  }),
}));

// Polyfill a minimal Response for Node/Jest so route's `new Response(...)` works
// This lives in the test only and mirrors the minimal shape the route expects.
class _TestResponse {
  status: number;
  headers: { _map: Record<string, string>; get: (k: string) => string | undefined };
  _body: unknown;
  constructor(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
    this._body = body;
    this.status = init?.status ?? 200;
    const map: Record<string, string> = {};
    Object.entries(init?.headers ?? {}).forEach(([k, v]) => (map[k.toLowerCase()] = v));
    this.headers = { _map: map, get: (k: string) => map[k.toLowerCase()] };
  }
  async arrayBuffer() {
    if (Buffer.isBuffer(this._body)) {
      // Return the exact ArrayBuffer slice corresponding to the Buffer contents
      return this._body.buffer.slice(this._body.byteOffset, this._body.byteOffset + this._body.byteLength);
    }
    if (this._body && typeof (this._body as { arrayBuffer?: () => Promise<ArrayBuffer> }).arrayBuffer === 'function') {
      return (this._body as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer();
    }
    return Buffer.from(String(this._body)).buffer;
  }
}

// Install polyfill on global scope for the duration of the test file
(globalThis as unknown as { Response: typeof _TestResponse }).Response = _TestResponse;

import { GET } from './route';

const makeParams = (imageId: string) => ({ params: Promise.resolve({ imageId }) });

describe('GET /api/download/[imageId]', () => {
  it('returns 404 when not found', async () => {
    const res = await GET({} as Request, makeParams('notfound'));
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: 'missing' });
  });

  it('returns a Response with buffer when found', async () => {
    const res = (await GET({} as Request, makeParams('ok'))) as Response;
    expect(res.headers.get('content-disposition')).toMatch(/attachment/);
    const body = await res.arrayBuffer();
    expect(Buffer.from(body).toString()).toBe('hello');
  });
});
