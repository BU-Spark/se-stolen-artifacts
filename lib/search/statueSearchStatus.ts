import type { StatueSearchRow } from '@/lib/db/statueSearch.types';

export const STATUE_SEARCH_STATUS_CODES = {
  NORMAL: 'normal',
  EMPTY_RESULT: 'empty_result',
  CONNECTION_ERROR: 'connection_error',
  EXCEED_LIMIT: 'exceed_limit',
} as const;

export const STATUE_SEARCH_STATUS_NUMERIC_CODES = {
  NORMAL: 0,
  EMPTY_RESULT: 1,
  CONNECTION_ERROR: 2,
  EXCEED_LIMIT: 3,
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

export const getStatusMeta = (
  key: StatueSearchStatusKey
): { status: StatueSearchStatusCode; statusCode: StatueSearchStatusNumericCode } => ({
  status: STATUE_SEARCH_STATUS_CODES[key],
  statusCode: STATUE_SEARCH_STATUS_NUMERIC_CODES[key],
});
