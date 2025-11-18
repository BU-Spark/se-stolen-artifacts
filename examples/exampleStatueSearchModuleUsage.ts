import fs from 'node:fs';
import path from 'node:path';

import {
  type StatueSearchResponsePayload,
  searchStatuesFromJson,
  STATUE_SEARCH_STATUS_CODES,
} from '../lib/db/statueSearchModule.ts';

const run = async (): Promise<void> => {
  /**
   * You can build the filters JSON dynamically or load a static file.
   * This example reads the existing example filters json from disk
   * and passes the raw string to the module entry point.
   */
  const filtersJson = fs.readFileSync(path.join(__dirname, 'exampleStatueSearchFilters.json'), 'utf-8');

  const responseJson = await searchStatuesFromJson(filtersJson);
  const payload = JSON.parse(responseJson) as StatueSearchResponsePayload;

  switch (payload.status) {
    case STATUE_SEARCH_STATUS_CODES.NORMAL:
      console.log(`Found ${payload.results.length} statues`);
      break;
    case STATUE_SEARCH_STATUS_CODES.EMPTY_RESULT:
      console.log('Search completed but no statues matched the filters');
      break;
    case STATUE_SEARCH_STATUS_CODES.CONNECTION_ERROR:
      console.error('The search failed due to a database connectivity issue', payload.error);
      break;
    default:
      console.warn('Unexpected status code', payload.status);
  }

  console.dir(payload.results, { depth: null });
};

run().catch((error) => {
  console.error('Failed to execute statue search example', error);
  process.exit(1);
});
