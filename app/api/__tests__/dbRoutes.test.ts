/** @jest-environment node */

import { NextResponse } from 'next/server';

import type { StatueSearchRow } from '@/lib/db/statueSearch.types';
import { supabase } from '@/lib/db/supabase';
import { handleGetPendingImages } from '@/lib/pending-images/pendingImages';
import { handleCreate } from '@/lib/crud-handlers/create';
import { handleDelete, hardDeleteStatueWithRelations } from '@/lib/crud-handlers/delete';
import { handleUpdate } from '@/lib/crud-handlers/update';
import { streamImageById } from '@/lib/download/streamImageById';
import { executeStatueSearch } from '@/lib/db/statueSearchQueryBuilder';
import { callLLM } from '@/lib/llm/callMetadataLLM';
import { insertArtifactMetadata } from '@/lib/db/insertArtifactMetadata';
import { auth } from '@clerk/nextjs/server';
import {
  checkUploadRateLimit,
  getRateLimitStatus,
  recordUpload,
  resetRateLimit,
} from '@/lib/rate-limit/uploadRateLimit';
import { handleUploadImage } from '@/lib/upload/uploadImage';

jest.mock('@/lib/db/supabase', () => {
  const storageFrom = jest.fn();
  const storage = { from: storageFrom, getBucket: jest.fn() };
  return { supabase: { from: jest.fn(), storage } };
});

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/lib/rate-limit/uploadRateLimit', () => ({
  checkUploadRateLimit: jest.fn(),
  getRateLimitStatus: jest.fn(),
  recordUpload: jest.fn(),
  resetRateLimit: jest.fn(),
}));
jest.mock('@/lib/pending-images/pendingImages', () => ({ handleGetPendingImages: jest.fn() }));
jest.mock('@/lib/crud-handlers/create', () => ({ handleCreate: jest.fn() }));
jest.mock('@/lib/crud-handlers/delete', () => ({
  handleDelete: jest.fn(),
  hardDeleteStatueWithRelations: jest.fn(),
}));
jest.mock('@/lib/crud-handlers/update', () => ({ handleUpdate: jest.fn() }));
jest.mock('@/lib/download/streamImageById', () => ({ streamImageById: jest.fn() }));
jest.mock('@/lib/db/statueSearchQueryBuilder', () => ({ executeStatueSearch: jest.fn() }));
jest.mock('@/lib/llm/callMetadataLLM', () => ({ callLLM: jest.fn() }));
jest.mock('@/lib/db/insertArtifactMetadata', () => ({ insertArtifactMetadata: jest.fn() }));
jest.mock('@/lib/upload/uploadImage', () => ({ handleUploadImage: jest.fn() }));

type SupabaseResponse = { data: unknown; error: unknown };
type ResponseFactory = (input: {
  method: string;
  args: unknown[];
  current: SupabaseResponse;
}) => SupabaseResponse | void;

const supabaseMock = supabase as unknown as {
  from: jest.Mock;
  storage: { from: jest.Mock; getBucket: jest.Mock };
};

const authMock = auth as unknown as jest.Mock;
const rateLimitMock = getRateLimitStatus as jest.Mock;
const checkRateLimitMock = checkUploadRateLimit as jest.Mock;
const recordUploadMock = recordUpload as jest.Mock;
const resetRateLimitMock = resetRateLimit as jest.Mock;
const handleGetPendingImagesMock = handleGetPendingImages as jest.Mock;
const handleCreateMock = handleCreate as jest.Mock;
const handleDeleteMock = handleDelete as jest.Mock;
const handleUpdateMock = handleUpdate as jest.Mock;
const hardDeleteStatueWithRelationsMock = hardDeleteStatueWithRelations as jest.Mock;
const streamImageByIdMock = streamImageById as jest.Mock;
const executeStatueSearchMock = executeStatueSearch as jest.Mock;
const callLLMMock = callLLM as jest.Mock;
const insertArtifactMetadataMock = insertArtifactMetadata as jest.Mock;
const handleUploadImageMock = handleUploadImage as jest.Mock;

function createQueryBuilder(response: SupabaseResponse | ResponseFactory = { data: null, error: null }) {
  let current =
    typeof response === 'function'
      ? (response({ method: 'init', args: [], current: { data: null, error: null } }) ?? { data: null, error: null })
      : response;

  const computeResponse = (method: string, args: unknown[]) => {
    if (typeof response === 'function') {
      const next = response({ method, args, current });
      if (next) {
        current = next;
      }
    }
  };

  const builder: Record<string, jest.Mock> & {
    then: (resolve: (value: SupabaseResponse) => void, reject: (error: unknown) => void) => Promise<void>;
    __setResponse: (next: SupabaseResponse) => void;
  } = {
    select: jest.fn((...args) => {
      computeResponse('select', args);
      return builder;
    }),
    update: jest.fn((...args) => {
      computeResponse('update', args);
      return builder;
    }),
    insert: jest.fn((...args) => {
      computeResponse('insert', args);
      return builder;
    }),
    delete: jest.fn((...args) => {
      computeResponse('delete', args);
      return builder;
    }),
    eq: jest.fn((...args) => {
      computeResponse('eq', args);
      return builder;
    }),
    ilike: jest.fn((...args) => {
      computeResponse('ilike', args);
      return builder;
    }),
    like: jest.fn((...args) => {
      computeResponse('like', args);
      return builder;
    }),
    not: jest.fn((...args) => {
      computeResponse('not', args);
      return builder;
    }),
    in: jest.fn((...args) => {
      computeResponse('in', args);
      return builder;
    }),
    gte: jest.fn((...args) => {
      computeResponse('gte', args);
      return builder;
    }),
    lte: jest.fn((...args) => {
      computeResponse('lte', args);
      return builder;
    }),
    order: jest.fn((...args) => {
      computeResponse('order', args);
      return builder;
    }),
    limit: jest.fn((...args) => {
      computeResponse('limit', args);
      return builder;
    }),
    single: jest.fn(async () => current),
    maybeSingle: jest.fn(async () => current),
    then: (resolve: (value: SupabaseResponse) => void, reject: (error: unknown) => void) =>
      Promise.resolve(current).then(resolve, reject),
    __setResponse: (next: SupabaseResponse) => {
      current = next;
    },
  };

  return builder;
}

function createStorageClient(
  overrides: Partial<{
    createSignedUrl: jest.Mock;
    download: jest.Mock;
    upload: jest.Mock;
    remove: jest.Mock;
    getPublicUrl: jest.Mock;
  }> = {}
) {
  return {
    createSignedUrl: jest
      .fn()
      .mockResolvedValue({ data: { signedUrl: 'https://signed.example/test.jpg' }, error: null }),
    download: jest.fn().mockResolvedValue({ data: new Blob(['file'], { type: 'image/jpeg' }), error: null }),
    upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
    remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://public.example/test.jpg' } }),
    ...overrides,
  };
}

async function parseJson(response: Response | NextResponse) {
  return response.json();
}

beforeEach(() => {
  jest.clearAllMocks();
  supabaseMock.from.mockReset();
  supabaseMock.storage.from.mockReset();
  supabaseMock.storage.getBucket.mockReset();
  authMock.mockResolvedValue({ userId: 'user-123' });
  rateLimitMock.mockReturnValue({ isLimited: false });
  checkRateLimitMock.mockReturnValue({ allowed: true });
  recordUploadMock.mockReturnValue(undefined);
  resetRateLimitMock.mockReturnValue(undefined);
});

describe('process-metadata route', () => {
  test('rejects unauthenticated requests', async () => {
    authMock.mockResolvedValue({ userId: null });
    const { POST } = await import('../process-metadata/route');
    const request = new Request('http://localhost/api/process-metadata', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = (await POST(request)) as Response;
    expect(response.status).toBe(401);
  });

  test('saves manual metadata without calling the LLM', async () => {
    const { POST } = await import('../process-metadata/route');
    const request = new Request('http://localhost/api/process-metadata', {
      method: 'POST',
      body: JSON.stringify({
        imageId: 'img-1',
        gcsPath: 'pending_images/img-1.jpg',
        shortDescription: 'desc',
        longDescription: 'long',
        internalReferenceNumber: 'ref-1',
        miscInformation: ' extra ',
        processWithAI: false,
        manualMetadata: {
          basicSearchMetadata: { country: 'Cambodia' },
          advancedSearchMetadata: { material: 'stone' },
        },
      }),
    });

    const response = (await POST(request)) as Response;
    const body = await parseJson(response);

    expect(response.status).toBe(200);
    expect(insertArtifactMetadataMock).toHaveBeenCalledWith(
      'img-1',
      'pending_images/img-1.jpg',
      'ref-1',
      expect.objectContaining({
        shortDescription: 'desc',
        miscInformation: 'extra',
        aiGenerated: false,
      })
    );
    expect(callLLMMock).not.toHaveBeenCalled();
    expect(body.success).toBe(true);
  });
});

describe('admin image-url route', () => {
  test('returns signed URL when image exists', async () => {
    supabaseMock.from.mockImplementationOnce(() =>
      createQueryBuilder({ data: { image_gcs: 'spark/images/img-1.jpg', image_url: null }, error: null })
    );
    const storageClient = createStorageClient();
    supabaseMock.storage.from.mockReturnValue(storageClient);

    const { GET } = await import('../admin/image-url/[imageId]/route');
    const response = (await GET(new Request('http://localhost/api/admin/image-url/img-1'), {
      params: Promise.resolve({ imageId: 'img-1' }),
    })) as Response;

    expect(response.status).toBe(200);
    expect(storageClient.createSignedUrl).toHaveBeenCalledWith('images/img-1.jpg', 60 * 60);
    const body = await parseJson(response);
    expect(body.url).toContain('signed.example');
  });

  test('returns 404 when no path is available', async () => {
    supabaseMock.from.mockImplementationOnce(() =>
      createQueryBuilder({ data: { image_gcs: null, image_url: null }, error: null })
    );
    const { GET } = await import('../admin/image-url/[imageId]/route');
    const response = (await GET(new Request('http://localhost/api/admin/image-url/img-2'), {
      params: Promise.resolve({ imageId: 'img-2' }),
    })) as Response;
    expect(response.status).toBe(404);
  });
});

describe('admin db-view route', () => {
  test('blocks unknown tables', async () => {
    const { GET } = await import('../admin/db-view/[table]/route');
    const response = (await GET(new Request('http://localhost/api/admin/db-view/unknown'), {
      params: Promise.resolve({ table: 'unknown' }),
    })) as Response;
    expect(response.status).toBe(403);
  });

  test('filters soft-deleted rows and orders results', async () => {
    const builder = createQueryBuilder({ data: [{ id: '1' }], error: null });
    supabaseMock.from.mockImplementationOnce(() => builder);

    const { GET } = await import('../admin/db-view/[table]/route');
    const response = (await GET(new Request('http://localhost/api/admin/db-view/images'), {
      params: Promise.resolve({ table: 'images' }),
    })) as Response;

    expect(response.status).toBe(200);
    expect(builder.eq).toHaveBeenCalledWith('is_deleted', false);
    expect(builder.like).toHaveBeenCalledWith('image_gcs', 'approved_images/%');
  });
});

describe('admin pending-images route', () => {
  test('returns pending images payload', async () => {
    handleGetPendingImagesMock.mockResolvedValue({ images: [{ image_id: 'a' }] });
    const { GET } = await import('../admin/pending-images/route');
    const response = (await GET()) as Response;
    const body = await parseJson(response);

    expect(response.status).toBe(200);
    expect(body.images).toEqual([{ image_id: 'a' }]);
  });

  test('surfaces errors from handler', async () => {
    handleGetPendingImagesMock.mockResolvedValue({ images: [], error: 'boom' });
    const { GET } = await import('../admin/pending-images/route');
    const response = (await GET()) as Response;
    expect(response.status).toBe(500);
  });
});

describe('admin approve route', () => {
  const baseTempRecord = {
    id: 'temp-1',
    image_id: 'img-1',
    subject: 'subject',
    dealer_name: null,
    suspected_current_location: 'Phnom Penh',
    artifact_title: 'Artifact',
    photograph_location: 'Phnom Penh',
    first_appearance_year: null,
    first_appearance_year_outside_cambodia: null,
    repatriated: null,
    image_source: 'museum',
    material: 'stone',
    short_description: 'short',
    long_description: 'long',
    misc_information: 'misc',
    ai_generated: true,
    has_inscription: true,
    multiple_heads: false,
    four_arms: false,
    eight_arms: false,
    ten_arms: false,
    over_ten_arms: false,
    fragmentary: false,
    fragments_from_multiple_statues: false,
    head_present: false,
    torso_present: false,
    shoulder_elbow_present: false,
    elbow_wrist_present: false,
    hand_present: false,
    hip_knee_present: false,
    knee_ankle_present: false,
    foot_present: false,
    base_present: false,
    fragmented_at_neck: false,
    fragmented_at_shoulder: false,
    fragmented_at_elbow: false,
    fragmented_at_wrist: false,
    fragmented_at_upper_leg: false,
    fragmented_at_knee: false,
    fragmented_at_ankle: false,
  };

  test('validates required imageId', async () => {
    const { POST } = await import('../admin/approve/route');
    const response = (await POST(
      new Request('http://localhost/api/admin/approve', { method: 'POST', body: JSON.stringify({}) })
    )) as Response;
    expect(response.status).toBe(400);
  });

  test('promotes pending metadata into approved records', async () => {
    const tempRecord = { ...baseTempRecord };
    const uploadRecord = {
      internal_reference_number: 'ref-1',
      gcs_path: 'pending_images/ref-1.jpg',
      short_description: 'upload short',
      long_description: 'upload long',
      misc_information: 'upload misc',
      ai_generated: true,
      image_source: 'source',
    };

    const subjectLookup = createQueryBuilder({ data: { id: 21 }, error: null });
    const materialLookup = createQueryBuilder({ data: { id: 22 }, error: null });
    const nameLookup = createQueryBuilder({ data: { id: 23 }, error: null });
    const photoLocationLookup = createQueryBuilder({ data: { id: 24 }, error: null });
    const currentLocationLookup = createQueryBuilder({ data: { id: 25 }, error: null });

    supabaseMock.from
      .mockImplementationOnce(() => createQueryBuilder({ data: tempRecord, error: null })) // fetchTempRecord
      .mockImplementationOnce(() =>
        createQueryBuilder({ data: null, error: { code: 'PGRST116', message: 'not found' } })
      ) // upload lookup by image_id
      .mockImplementationOnce(() => createQueryBuilder({ data: uploadRecord, error: null })) // upload lookup by ref
      .mockImplementationOnce(() => subjectLookup) // ensureLookup subjects
      .mockImplementationOnce(() => materialLookup) // ensureLookup materials
      .mockImplementationOnce(() => nameLookup) // ensureLookup names
      .mockImplementationOnce(() => photoLocationLookup) // ensureLookup photograph location
      .mockImplementationOnce(() => currentLocationLookup) // ensureLookup current location
      .mockImplementationOnce(() => createQueryBuilder({ data: null, error: { code: 'PGRST116', message: '' } })) // statue_subject check
      .mockImplementationOnce(() => createQueryBuilder({ data: null, error: { code: 'PGRST116', message: '' } })) // statue_current_loc check
      .mockImplementationOnce(() => createQueryBuilder({ data: null, error: { code: 'PGRST116', message: '' } })) // attribute lookup
      .mockImplementationOnce(() => createQueryBuilder({ data: null, error: { code: 'PGRST116', message: '' } })) // statue_attributes check
      .mockImplementationOnce(() => createQueryBuilder({ data: null, error: { code: 'PGRST116', message: '' } })) // image exists?
      .mockImplementationOnce(() => createQueryBuilder({ data: null, error: null })); // markUploadComplete

    const storageUploadClient = createStorageClient();
    const storagePendingClient = createStorageClient();

    supabaseMock.storage.from
      .mockReturnValueOnce(storagePendingClient)
      .mockReturnValueOnce(storageUploadClient)
      .mockReturnValueOnce(storagePendingClient);

    handleCreateMock
      .mockResolvedValueOnce({ record: { statue_id: 501 } }) // create statue
      .mockResolvedValueOnce({ record: { statue_id: 501, subject_id: 21 } }) // statue_subject
      .mockResolvedValueOnce({ record: { id: 700, statue_id: 501 } }) // statue_current_loc
      .mockResolvedValueOnce({ record: { id: 900 } }) // attributes
      .mockResolvedValueOnce({ record: { statue_id: 501, attribute_id: 900 } }) // statue_attributes
      .mockResolvedValueOnce({
        record: { internal_reference_number: 'ref-1', image_gcs: 'approved_images/ref-1.jpg' },
      }); // create image

    const { POST } = await import('../admin/approve/route');
    const response = (await POST(
      new Request('http://localhost/api/admin/approve', {
        method: 'POST',
        body: JSON.stringify({ imageId: 'img-1' }),
      })
    )) as Response;

    expect(response.status).toBe(200);
    expect(handleCreateMock).toHaveBeenCalledWith(expect.objectContaining({ table: 'statues', action: 'create' }));
    expect(handleCreateMock).toHaveBeenCalledWith(expect.objectContaining({ table: 'images', action: 'create' }));
    expect(storageUploadClient.upload).toHaveBeenCalled();
  });
});

describe('admin statues routes', () => {
  test('lists statues with image counts', async () => {
    const statuesBuilder = createQueryBuilder({
      data: [{ statue_id: 1, statues_name: 'One', is_deleted: false }],
      error: null,
    });
    const imagesBuilder = createQueryBuilder({ data: [{ statue_id: 1 }], error: null });

    supabaseMock.from.mockImplementationOnce(() => statuesBuilder).mockImplementationOnce(() => imagesBuilder);
    const { GET } = await import('../admin/statues/route');
    const response = (await GET()) as Response;
    const body = await parseJson(response);

    expect(response.status).toBe(200);
    expect(body.statues[0]).toEqual(expect.objectContaining({ statueId: 1, imageCount: 1 }));
  });

  test('creates a new statue id sequentially', async () => {
    supabaseMock.from
      .mockImplementationOnce(() => createQueryBuilder({ data: { statue_id: 2 }, error: null }))
      .mockImplementationOnce(() => createQueryBuilder({ data: { statue_id: 3 }, error: null }));

    const { POST } = await import('../admin/statues/create/route');
    const response = (await POST()) as Response;
    const body = await parseJson(response);

    expect(response.status).toBe(200);
    expect(body.statue.statueId).toBe(3);
  });

  test('returns signed URLs for statue images', async () => {
    supabaseMock.from.mockImplementationOnce(() =>
      createQueryBuilder({
        data: [
          { internal_reference_number: 'ref-1', image_gcs: 'spark/ref-1.jpg', image_url: null, is_deleted: false },
        ],
        error: null,
      })
    );
    const storageClient = createStorageClient();
    supabaseMock.storage.from.mockReturnValue(storageClient);

    const { GET } = await import('../admin/statues/[statueId]/images/route');
    const response = (await GET(new Request('http://localhost/api/admin/statues/1/images'), {
      params: Promise.resolve({ statueId: '1' }),
    })) as Response;
    const body = await parseJson(response);

    expect(response.status).toBe(200);
    expect(storageClient.createSignedUrl).toHaveBeenCalled();
    expect(body.images[0].url).toContain('signed.example');
  });
});

describe('admin hard delete route', () => {
  test('rejects invalid ids', async () => {
    const { DELETE } = await import('../admin/statues/[statueId]/hard-delete/route');
    const response = (await DELETE(new Request('http://localhost/api/admin/statues/abc/hard-delete'), {
      params: Promise.resolve({ statueId: 'abc' }),
    })) as Response;
    expect(response.status).toBe(400);
  });

  test('delegates deletion to handler', async () => {
    hardDeleteStatueWithRelationsMock.mockResolvedValue({ deletedImageIds: ['one'] });
    const { DELETE } = await import('../admin/statues/[statueId]/hard-delete/route');
    const response = (await DELETE(new Request('http://localhost/api/admin/statues/5/hard-delete'), {
      params: Promise.resolve({ statueId: '5' }),
    })) as Response;
    expect(response.status).toBe(200);
    expect(hardDeleteStatueWithRelationsMock).toHaveBeenCalledWith(5);
  });
});

describe('admin deny route', () => {
  test('marks matching images as rejected', async () => {
    supabaseMock.from.mockImplementationOnce(() =>
      createQueryBuilder({
        data: [{ image_id: 'img-1', internal_reference_number: 'ref-1' }],
        error: null,
      })
    );
    const { POST } = await import('../admin/deny/route');
    const response = (await POST(
      new Request('http://localhost/api/admin/deny', { method: 'POST', body: JSON.stringify({ imageId: 'img-1' }) })
    )) as Response;
    expect(response.status).toBe(200);
  });

  test('returns 404 when nothing is updated', async () => {
    supabaseMock.from
      .mockImplementationOnce(() => createQueryBuilder({ data: [], error: null }))
      .mockImplementationOnce(() => createQueryBuilder({ data: [], error: null }));
    const { POST } = await import('../admin/deny/route');
    const response = (await POST(
      new Request('http://localhost/api/admin/deny', { method: 'POST', body: JSON.stringify({ imageId: 'missing' }) })
    )) as Response;
    expect(response.status).toBe(404);
  });
});

describe('admin crud route', () => {
  test('validates inputs', async () => {
    const { POST } = await import('../admin/crud/route');
    const response = (await POST(
      new Request('http://localhost/api/admin/crud', { method: 'POST', body: JSON.stringify({}) })
    )) as Response;
    expect(response.status).toBe(400);
  });

  test('dispatches to create handler', async () => {
    handleCreateMock.mockResolvedValue({ record: { id: 10 } });
    const { POST } = await import('../admin/crud/route');
    const response = (await POST(
      new Request('http://localhost/api/admin/crud', {
        method: 'POST',
        body: JSON.stringify({ table: 'statues', action: 'create', data: { statues_name: 'New' } }),
      })
    )) as Response;

    expect(response.status).toBe(200);
    expect(handleCreateMock).toHaveBeenCalled();
  });

  test('dispatches to update handler', async () => {
    handleUpdateMock.mockResolvedValue({ record: { id: 1, statues_name: 'Updated' } });
    const { POST } = await import('../admin/crud/route');
    const response = (await POST(
      new Request('http://localhost/api/admin/crud', {
        method: 'POST',
        body: JSON.stringify({ table: 'statues', action: 'update', id: 1, data: { statues_name: 'Updated' } }),
      })
    )) as Response;

    expect(response.status).toBe(200);
    expect(handleUpdateMock).toHaveBeenCalledWith(expect.objectContaining({ action: 'update', id: 1 }));
  });

  test('dispatches to delete handler', async () => {
    handleDeleteMock.mockResolvedValue({ success: true });
    const { POST } = await import('../admin/crud/route');
    const response = (await POST(
      new Request('http://localhost/api/admin/crud', {
        method: 'POST',
        body: JSON.stringify({ table: 'statues', action: 'delete', id: 3 }),
      })
    )) as Response;

    expect(response.status).toBe(200);
    expect(handleDeleteMock).toHaveBeenCalledWith(expect.objectContaining({ action: 'delete', id: 3 }));
  });
});

describe('admin reset-rate-limit route', () => {
  test('requires authentication', async () => {
    authMock.mockResolvedValue({ userId: null });
    const { POST } = await import('../admin/reset-rate-limit/route');
    const response = (await POST()) as Response;
    expect(response.status).toBe(401);
  });

  test('resets limit for authenticated user', async () => {
    const { POST } = await import('../admin/reset-rate-limit/route');
    const response = (await POST()) as Response;
    expect(response.status).toBe(200);
    expect(resetRateLimitMock).toHaveBeenCalled();
  });
});

describe('download route', () => {
  test('streams requested file', async () => {
    const fileStream = new Blob(['content']);
    streamImageByIdMock.mockResolvedValue({ fileStream, fileName: 'example.jpg', error: null });

    const { GET } = await import('../download/[imageId]/route');
    const response = (await GET(new Request('http://localhost/api/download/img-1'), {
      params: Promise.resolve({ imageId: 'img-1' }),
    })) as Response;

    expect(response.headers.get('Content-Disposition')).toContain('example.jpg');
    expect(response.status).toBe(200);
  });
});

describe('statue-search route', () => {
  test('returns signed image URLs for search results', async () => {
    const rows: StatueSearchRow[] = [
      {
        statue_id: 1,
        title: 'Test',
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
        dealer_history: null,
      },
    ];

    executeStatueSearchMock.mockResolvedValue(rows);
    const storageClient = createStorageClient();
    supabaseMock.storage.from.mockReturnValue(storageClient);

    const { POST } = await import('../statue-search/route');
    const response = (await POST(
      new Request('http://localhost/api/statue-search', { method: 'POST', body: JSON.stringify({}) })
    )) as Response;
    const body = await parseJson(response);

    expect(response.status).toBe(200);
    expect(storageClient.createSignedUrl).toHaveBeenCalled();
    expect(body.results[0].images[0].url).toContain('signed.example');
  });

  test('reports server errors', async () => {
    executeStatueSearchMock.mockRejectedValue(new Error('search failed'));
    const { POST } = await import('../statue-search/route');
    const response = (await POST(
      new Request('http://localhost/api/statue-search', { method: 'POST', body: JSON.stringify({}) })
    )) as Response;
    expect(response.status).toBe(500);
  });
});

describe('rate-limit-status route', () => {
  test('blocks unauthenticated requests', async () => {
    authMock.mockResolvedValue({ userId: null });
    const { GET } = await import('../rate-limit-status/route');
    const response = (await GET()) as Response;
    expect(response.status).toBe(401);
  });

  test('returns status for authenticated user', async () => {
    rateLimitMock.mockReturnValue({ isLimited: true });
    const { GET } = await import('../rate-limit-status/route');
    const response = (await GET()) as Response;
    const body = await parseJson(response);

    expect(response.status).toBe(200);
    expect(body.aiMetadataAvailable).toBe(false);
  });
});

describe('upload route', () => {
  test('rejects unauthenticated uploads', async () => {
    authMock.mockResolvedValue({ userId: null });
    const { POST } = await import('../upload/route');
    const form = new FormData();
    form.set('shortDescription', 'desc');
    form.set('file', new File(['content'], 'image.jpg', { type: 'image/jpeg' }));

    const response = (await POST(
      new Request('http://localhost/api/upload', { method: 'POST', body: form })
    )) as Response;
    expect(response.status).toBe(401);
  });

  test('persists upload metadata and returns rate status', async () => {
    handleUploadImageMock.mockResolvedValue({
      id: 'img-1',
      publicUrl: 'https://public.example/img-1.jpg',
      gcsPath: 'pending_images/img-1.jpg',
      internalReferenceNumber: 'ref-1',
    });
    rateLimitMock.mockReturnValue({ isLimited: false });
    const { POST } = await import('../upload/route');
    const form = new FormData();
    form.set('shortDescription', 'desc');
    form.set('file', new File(['content'], 'image.jpg', { type: 'image/jpeg' }));

    const response = (await POST(
      new Request('http://localhost/api/upload', { method: 'POST', body: form })
    )) as Response;
    const body = await parseJson(response);

    expect(response.status).toBe(200);
    expect(recordUploadMock).toHaveBeenCalled();
    expect(body.rateLimitStatus).toEqual({ isLimited: false });
  });
});
