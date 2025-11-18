import type { PrismaClient } from '@prisma/client';

import { prisma as defaultPrisma } from './prisma';
import type { StatueSearchFilters, StatueSearchRow } from './statueSearchQueryBuilder';
import { executeStatueSearch } from './statueSearchQueryBuilder';

export const STATUE_SEARCH_STATUS_CODES = {
  NORMAL: 'normal',
  EMPTY_RESULT: 'empty_result',
  CONNECTION_ERROR: 'connection_error',
  EXCEED_Limit: 'exceed_limit',
} as const;

export type StatueSearchStatusCode = (typeof STATUE_SEARCH_STATUS_CODES)[keyof typeof STATUE_SEARCH_STATUS_CODES];

export interface StatueSearchResponsePayload {
  status: StatueSearchStatusCode;
  results: StatueSearchRow[];
  error?: string;
}

const parseFiltersJson = (filtersJson: string): StatueSearchFilters => {
  if (!filtersJson) return {};

  const parsed = JSON.parse(filtersJson);
  return (parsed ?? {}) as StatueSearchFilters;
};

/**
 * Consumes a JSON string describing the {@link StatueSearchFilters}, runs the query, and returns a
 * JSON string with the search results plus a status code describing the outcome.
 */
export const searchStatuesFromJson = async (
  filtersJson: string,
  client: PrismaClient = defaultPrisma
): Promise<string> => {
  try {
    const filters = parseFiltersJson(filtersJson);
    const results = await executeStatueSearch(filters, client);

    const status = results.length === 0 ? STATUE_SEARCH_STATUS_CODES.EMPTY_RESULT : STATUE_SEARCH_STATUS_CODES.NORMAL;

    const payload: StatueSearchResponsePayload = {
      status,
      results,
    };

    return JSON.stringify(payload);
  } catch (error) {
    const payload: StatueSearchResponsePayload = {
      status: STATUE_SEARCH_STATUS_CODES.CONNECTION_ERROR,
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return JSON.stringify(payload);
  }
};
