import { executeStatueSearch } from './statueSearchQueryBuilder';
import type { StatueSearchFilters } from './statueSearchQueryBuilder';

async function demo() {
  // Build filters as needed; empty object returns all (non-deleted) statues
  const filters: StatueSearchFilters = {
    main: {
      subject: 'Vishnu',
      suspectedCurrentLocation: 'Getty',
      repatriated: false,
      yearFirstKnownAppearance: { start: 1900, end: 1999 },
    },
    advanced: {
      material: 'Sandstone',
      imageSource: 'Museum',
      basePresent: true,
      limbsPresent: ['Head', 'Torso'],
    },
  };

  const results = await executeStatueSearch(filters);
  console.log(`Found ${results.length} statues`);
  console.dir(results, { depth: null });
}

demo().catch((err) => {
  console.error('Search failed:', err);
});
