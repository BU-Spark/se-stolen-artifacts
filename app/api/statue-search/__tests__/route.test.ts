/** @jest-environment node */

import type { StatueSearchRow } from '@/lib/db/statueSearch.types';
import { executeStatueSearch } from '@/lib/db/statueSearchQueryBuilder';
import { STATUE_SEARCH_STATUS_CODES, STATUE_SEARCH_STATUS_NUMERIC_CODES } from '@/lib/search/statueSearchStatus';
import { supabase } from '@/lib/db/supabase';

jest.mock('@/lib/db/statueSearchQueryBuilder', () => ({ executeStatueSearch: jest.fn() }));
jest.mock('@/lib/db/supabase', () => {
  const storageFrom = jest.fn();
  return { supabase: { storage: { from: storageFrom } } };
});

const executeStatueSearchMock = executeStatueSearch as jest.Mock;
const supabaseMock = supabase as unknown as { storage: { from: jest.Mock } };

const originalEnv = { ...process.env };

const makeStorageClient = (overrides: Partial<Record<'createSignedUrl' | 'getPublicUrl', jest.Mock>> = {}) => ({
  createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://signed.example/img.jpg' }, error: null }),
  getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://public.example/img.jpg' } }),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...originalEnv, NEXT_PUBLIC_SUPABASE_URL: 'https://supabase.example' };
  supabaseMock.storage.from.mockReturnValue(makeStorageClient());
});

afterAll(() => {
  process.env = originalEnv;
});

const buildRequest = (body: unknown = {}) =>
  new Request('http://localhost/api/statue-search', { method: 'POST', body: JSON.stringify(body) });

const baseRow: StatueSearchRow = {
  statue_id: 1,
  title: 'Test Statue',
  description: null,
  provenance_history: null,
  first_known_appearance_year: null,
  first_known_appearance_outside_cambodia_year: null,
  arm_number: null,
  material: null,
  original_location: null,
  original_country: null,
  current_location: null,
  current_country: null,
  last_mentioned_date: null,
  current_location_link: null,
  subjects: [],
  attributes: [],
  dealer_history: null,
  images: [],
};

describe('statue-search route', () => {
  test('signs GCS images and returns normal status metadata', async () => {
    executeStatueSearchMock.mockResolvedValue([
      {
        ...baseRow,
        images: [
          {
            id: 'img-1',
            url: null,
            source: null,
            photographLocation: null,
            photographCountry: null,
            gcsPath: 'spark/img-1.jpg',
          },
        ],
      },
    ]);

    const { POST } = await import('../route');
    const response = (await POST(buildRequest())) as Response;
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe(STATUE_SEARCH_STATUS_CODES.NORMAL);
    expect(body.statusCode).toBe(STATUE_SEARCH_STATUS_NUMERIC_CODES.NORMAL);
    expect(body.results[0].images[0].url).toContain('signed.example');
    expect(supabaseMock.storage.from).toHaveBeenCalledWith('spark');
  });

  test('falls back to public URL when signing fails', async () => {
    const storageClient = makeStorageClient({
      createSignedUrl: jest.fn().mockResolvedValue({ data: null, error: new Error('fail') }),
    });
    supabaseMock.storage.from.mockReturnValue(storageClient);

    executeStatueSearchMock.mockResolvedValue([
      {
        ...baseRow,
        images: [
          {
            id: 'img-2',
            url: 'https://existing.example/img-2.jpg',
            source: null,
            photographLocation: null,
            photographCountry: null,
            gcsPath: 'spark/img-2.jpg',
          },
        ],
      },
    ]);

    const { POST } = await import('../route');
    const response = (await POST(buildRequest())) as Response;
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.results[0].images[0].url).toContain('existing.example');
    expect(storageClient.getPublicUrl).not.toHaveBeenCalled(); // fallback used provided URL first
  });

  test('returns empty status meta when no results', async () => {
    executeStatueSearchMock.mockResolvedValue([]);
    const { POST } = await import('../route');
    const response = (await POST(buildRequest())) as Response;
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe(STATUE_SEARCH_STATUS_CODES.EMPTY_RESULT);
    expect(body.statusCode).toBe(STATUE_SEARCH_STATUS_NUMERIC_CODES.EMPTY_RESULT);
    expect(body.results).toEqual([]);
    expect(supabaseMock.storage.from).not.toHaveBeenCalled();
  });

  test('bubbles search errors with connection status', async () => {
    executeStatueSearchMock.mockRejectedValue(new Error('search failed'));
    const { POST } = await import('../route');
    const response = (await POST(buildRequest())) as Response;
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.status).toBe(STATUE_SEARCH_STATUS_CODES.CONNECTION_ERROR);
    expect(body.statusCode).toBe(STATUE_SEARCH_STATUS_NUMERIC_CODES.CONNECTION_ERROR);
    expect(body.results).toEqual([]);
    expect(body.error).toMatch(/search failed/);
  });
});
