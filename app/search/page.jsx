'use client';

import { Box, Stack } from '@mui/material';

import SearchForm from '@/app/search/components/SearchForm';
import StatueFolderList from '@/app/search/components/StatueFolderList';

export default function SearchPage() {
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
        py: 6,
      }}
    >
      <Stack spacing={3} sx={{ maxWidth: '100%' }}>
        <Stack direction="row" spacing={2} sx={{ height: 'calc(100vh - 180px)', minHeight: 600, width: '100%' }}>
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
            <SearchForm show />
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
            <StatueFolderList />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
