'use client';

// hooks
import { useState } from 'react';

// components
import { Container } from '@mui/material';

// custom components
import ArtifactsUpload from '@/app/search/components/ArtifactsUpload';
import SearchForm from '@/app/search/components/SearchForm';

export default function SearchPage() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 6 }}>
      <ArtifactsUpload onUploadComplete={() => setShowSearch(true)} />
      <SearchForm show={showSearch} />
    </Container>
  );
}
