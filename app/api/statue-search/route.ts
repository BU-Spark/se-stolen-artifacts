import { NextResponse } from 'next/server';

import { executeStatueSearch } from '@/lib/db/statueSearchQueryBuilder';
import type { StatueSearchFilters, StatueSearchRow } from '@/lib/db/statueSearch.types';
import {
  STATUE_SEARCH_STATUS_CODES,
  STATUE_SEARCH_STATUS_NUMERIC_CODES,
  type StatueSearchResponsePayload,
} from '@/lib/search/statueSearchStatus';
import { supabase } from '@/lib/db/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const STORAGE_BUCKET = 'spark';

const getStatusMeta = (resultsCount: number) =>
  resultsCount > 0
    ? {
        status: STATUE_SEARCH_STATUS_CODES.NORMAL,
        statusCode: STATUE_SEARCH_STATUS_NUMERIC_CODES.NORMAL,
      }
    : {
        status: STATUE_SEARCH_STATUS_CODES.EMPTY_RESULT,
        statusCode: STATUE_SEARCH_STATUS_NUMERIC_CODES.EMPTY_RESULT,
      };

const normalizeStoragePath = (path?: string | null) => {
  if (!path) return null;
  const trimmed = path.replace(/^\/+/, '');
  const bucketPrefix = `${STORAGE_BUCKET}/`;
  return trimmed.startsWith(bucketPrefix) ? trimmed.slice(bucketPrefix.length) : trimmed;
};

const buildPublicUrl = (path: string) =>
  SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}` : null;

const signImageUrl = async (gcsPath?: string | null, fallback?: string | null): Promise<string | null> => {
  const normalizedPath = normalizeStoragePath(gcsPath);
  if (!normalizedPath) {
    return fallback ?? null;
  }

  try {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(normalizedPath, 60 * 60); // 1 hour

    if (error || !data?.signedUrl) {
      return fallback ?? buildPublicUrl(normalizedPath);
    }

    return data.signedUrl;
  } catch (signError) {
    console.error('Failed to sign statue image', signError);
    return fallback ?? buildPublicUrl(normalizedPath);
  }
};

type StatueImageWithGcs = NonNullable<StatueSearchRow['images']>[number] & {
  gcsPath?: string | null;
};

const attachSignedImageUrls = async (results: StatueSearchRow[]): Promise<StatueSearchRow[]> => {
  if (!results.length) return results;

  return Promise.all(
    results.map(async (statue) => {
      if (!statue.images?.length) {
        return statue;
      }

      const signedImages = await Promise.all(
        (statue.images as StatueImageWithGcs[]).map(async (image) => ({
          ...image,
          url: await signImageUrl(image.gcsPath, image.url),
        }))
      );

      return { ...statue, images: signedImages };
    })
  );
};

export async function POST(request: Request) {
  try {
    const filters = ((await request.json()) ?? {}) as StatueSearchFilters;
    const safeFilters: StatueSearchFilters = filters ?? {};
    const results = await executeStatueSearch(safeFilters);
    const signedResults = await attachSignedImageUrls(results);

    const statusMeta = getStatusMeta(signedResults.length);

    const payload: StatueSearchResponsePayload = {
      ...statusMeta,
      results: signedResults,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error('statue-search POST failed:', error);
    const payload: StatueSearchResponsePayload = {
      status: STATUE_SEARCH_STATUS_CODES.CONNECTION_ERROR,
      statusCode: STATUE_SEARCH_STATUS_NUMERIC_CODES.CONNECTION_ERROR,
      results: [],
      error: error instanceof Error ? error.message : 'Unknown statue-search error',
    };

    return NextResponse.json(payload, { status: 500 });
  }
}
