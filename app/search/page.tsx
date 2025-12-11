'use client';

import { useCallback, useEffect, useState } from 'react';
import { Box, Stack } from '@mui/material';

import SearchForm from '@/app/search/components/SearchForm';
import StatueFolderList from '@/app/search/components/StatueFolderList';
import type { StatueSearchFilters, StatueSearchRow } from '@/lib/db/statueSearch.types';
import { STATUE_SEARCH_STATUS_CODES, type StatueSearchResponsePayload } from '@/lib/search/statueSearchStatus';

export default function SearchPage() {
  const [results, setResults] = useState<StatueSearchRow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastFilters, setLastFilters] = useState<StatueSearchFilters | null>(null);

  const executeSearch = useCallback(async (filters: StatueSearchFilters) => {
    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch('/api/statue-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters ?? {}),
      });

      if (!response.ok) {
        throw new Error(`Search request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as StatueSearchResponsePayload;

      if (payload.status === STATUE_SEARCH_STATUS_CODES.CONNECTION_ERROR) {
        throw new Error(payload.error ?? 'Unable to search statues.');
      }

      if (payload.status === STATUE_SEARCH_STATUS_CODES.EXCEED_Limit) {
        setResults(payload.results ?? []);
        setError('Too many results matched these filters. Please refine your search.');
        return;
      }

      setResults(payload.results ?? []);
      setError(null);
    } catch (searchError) {
      const message = searchError instanceof Error ? searchError.message : 'Unable to search statues.';
      setResults([]);
      setError(message);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSubmit = useCallback(
    (filters: StatueSearchFilters) => {
      const snapshot = JSON.parse(JSON.stringify(filters ?? {})) as StatueSearchFilters;
      setHasSearched(true);
      setLastFilters(snapshot);
      executeSearch(snapshot);
    },
    [executeSearch]
  );

  const handleRetry = useCallback(() => {
    if (lastFilters) {
      executeSearch(lastFilters);
    }
  }, [executeSearch, lastFilters]);

  useEffect(() => {
    if (!hasSearched && !isSearching && results.length === 0) {
      handleSubmit({});
    }
  }, [handleSubmit, hasSearched, isSearching, results.length]);

  return (
    <Box
      sx={{
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        width: '100vw',
        px: 4,
        py: 3,
      }}
    >
      <Stack spacing={3} sx={{ maxWidth: '100%' }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ height: 'calc(100vh - 140px)', minHeight: { xs: 500, md: 600, lg: 700 }, width: '100%' }}
        >
          <Box
            sx={{
              flex: '0 0 40%',
              minWidth: 0,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SearchForm show onSubmit={handleSubmit} />
          </Box>
          <Box
            sx={{
              flex: '0 0 60%',
              minWidth: 0,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              p: 3,
              height: '100%',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                },
              },
            }}
          >
            <StatueFolderList
              statues={results}
              isLoading={isSearching}
              error={error}
              hasSearched={hasSearched}
              onRetry={lastFilters ? handleRetry : undefined}
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
