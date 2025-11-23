'use client';

import Link from 'next/link';
import { Button, Container, Stack } from '@mui/material';

import SearchForm from '@/app/search/components/SearchForm';

export default function SearchPage() {
  return (
    <Container component="main" maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="outlined" component={Link} href="/upload">
            Upload Another Image
          </Button>
        </Stack>
        <SearchForm show />
      </Stack>
    </Container>
  );
}
