import type { StatueSearchFilters, StatueSearchRow } from './statueSearchQueryBuilder';
import { executeStatueSearch } from './statueSearchQueryBuilder';

export const STATUE_SEARCH_STATUS_CODES = {
  NORMAL: 'normal',
  EMPTY_RESULT: 'empty_result',
  CONNECTION_ERROR: 'connection_error',
  EXCEED_Limit: 'exceed_limit',
} as const;

export const STATUE_SEARCH_STATUS_NUMERIC_CODES = {
  NORMAL: 0,
  EMPTY_RESULT: 1,
  CONNECTION_ERROR: 2,
  EXCEED_Limit: 3,
} as const;

export type StatueSearchStatusKey = keyof typeof STATUE_SEARCH_STATUS_CODES;

export type StatueSearchStatusCode = (typeof STATUE_SEARCH_STATUS_CODES)[StatueSearchStatusKey];

export type StatueSearchStatusNumericCode = (typeof STATUE_SEARCH_STATUS_NUMERIC_CODES)[StatueSearchStatusKey];

export interface StatueSearchResponsePayload {
  status: StatueSearchStatusCode;
  statusCode: StatueSearchStatusNumericCode;
  results: StatueSearchRow[];
  error?: string;
}

const getStatusMeta = (
  key: StatueSearchStatusKey
): { status: StatueSearchStatusCode; statusCode: StatueSearchStatusNumericCode } => ({
  status: STATUE_SEARCH_STATUS_CODES[key],
  statusCode: STATUE_SEARCH_STATUS_NUMERIC_CODES[key],
});

const parseFiltersJson = (filtersJson: string): StatueSearchFilters => {
  if (!filtersJson) return {};

  const parsed = JSON.parse(filtersJson);
  return (parsed ?? {}) as StatueSearchFilters;
};

/**
 * Consumes a JSON string describing the {@link StatueSearchFilters}, runs the query, and returns a
 * JSON string with the search results plus a status code describing the outcome.
 */
export const searchStatuesFromJson = async (filtersJson: string): Promise<string> => {
  try {
    const filters = parseFiltersJson(filtersJson);
    const results = await executeStatueSearch(filters);

    const statusKey: StatueSearchStatusKey = results.length === 0 ? 'EMPTY_RESULT' : 'NORMAL';
    const statusMeta = getStatusMeta(statusKey);

    const payload: StatueSearchResponsePayload = {
      status: statusMeta.status,
      statusCode: statusMeta.statusCode,
      results,
    };

    return JSON.stringify(payload);
  } catch (error) {
    const statusMeta = getStatusMeta('CONNECTION_ERROR');

    const payload: StatueSearchResponsePayload = {
      status: statusMeta.status,
      statusCode: statusMeta.statusCode,
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return JSON.stringify(payload);
  }
};
