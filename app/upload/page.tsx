'use client';

import { useCallback, useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useRouter } from 'next/navigation';

import ArtifactsUpload from '@/app/upload/components/ArtifactsUpload';

export default function UploadPage() {
  const router = useRouter();
  const [redirectPending, setRedirectPending] = useState(false);

  useEffect(() => {
    if (!redirectPending) return;

    const timer = setTimeout(() => {
      router.push('/search');
    }, 2000);

    return () => clearTimeout(timer);
  }, [redirectPending, router]);

  const handleUploadComplete = useCallback(() => {
    setRedirectPending(true);
  }, []);

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 6 }}>
      <ArtifactsUpload onUploadComplete={handleUploadComplete} />
    </Container>
  );
}
