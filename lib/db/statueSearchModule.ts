import type { StatueSearchFilters } from './statueSearch.types';
import { executeStatueSearch } from './statueSearchQueryBuilder';
import {
  getStatusMeta,
  type StatueSearchResponsePayload,
  type StatueSearchStatusKey,
} from '@/lib/search/statueSearchStatus';

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
