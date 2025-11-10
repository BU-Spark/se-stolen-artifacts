'use client';

import { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import PendingImageCard, { PendingImage } from './components/PendingImageCard';

type PendingImagesResponse = {
  images: PendingImage[];
  error?: string;
};

export default function AdminReviewPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [images, setImages] = useState<PendingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadInFlight, setDownloadInFlight] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchPendingImages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/pending-images', {
          credentials: 'include',
        });
        const payload = (await response.json()) as PendingImagesResponse;
        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load pending images.');
        }
        setImages(payload.images ?? []);
        if (process.env.NODE_ENV !== 'production') {
          console.log('Fetched pending images:', payload.images);
        }
        setError(null);
      } catch (fetchError: unknown) {
        const message = fetchError instanceof Error ? fetchError.message : 'An unknown error occurred.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingImages();
  }, [isLoaded, isSignedIn]);

  const handleDownload = useCallback(async (imageId: string) => {
    try {
      setDownloadInFlight(imageId);
      const response = await fetch(`/api/download/${encodeURIComponent(imageId)}`);
      if (!response.ok) {
        throw new Error('Could not download image.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${imageId}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (downloadError: unknown) {
      const message = downloadError instanceof Error ? downloadError.message : 'Could not download image.';
      setError(message);
    } finally {
      setDownloadInFlight((current) => (current === imageId ? null : current));
    }
  }, []);

  const handleSaveMetadata = useCallback(async (imageId: string, metadata: PendingImage['metadata']) => {
    // TODO: API call to update metadata
    console.log('Saving metadata for', imageId, metadata);

    try {
      // TODO: Add API call here
      // await fetch('/api/admin/update-metadata', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ imageId, metadata }),
      // });

      // Update local state with new metadata
      setImages((prev) => prev.map((img) => (img.internal_reference_number === imageId ? { ...img, metadata } : img)));
    } catch (error) {
      console.error('Failed to save metadata:', error);
      setError('Failed to save metadata');
    }
  }, []);

  const handleApprove = useCallback(async (imageId: string, folderId: string, metadata: PendingImage['metadata']) => {
    // TODO: Integrate with approve endpoint
    console.log(`Approving ${imageId} and moving to folder ${folderId}`, metadata);

    try {
      // TODO: Add API call here
      // await fetch('/api/admin/approve', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ imageId, folderId, metadata }),
      // });

      // Remove from local state after successful approval
      setImages((prev) => prev.filter((img) => img.internal_reference_number !== imageId));
    } catch (error) {
      console.error('Failed to approve image:', error);
      setError('Failed to approve image');
    }
  }, []);

  const handleAddToNew = useCallback(async (imageId: string, metadata: PendingImage['metadata']) => {
    // TODO: Integrate with create new folder endpoint
    console.log(`Creating new folder and adding ${imageId}`, metadata);

    try {
      // TODO: Add API call here
      // await fetch('/api/admin/add-to-new', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ imageId, metadata }),
      // });

      // Remove from local state after successful addition
      setImages((prev) => prev.filter((img) => img.internal_reference_number !== imageId));
    } catch (error) {
      console.error('Failed to add image to new folder:', error);
      setError('Failed to add image to new folder');
    }
  }, []);

  const handleDeny = useCallback(async (imageId: string) => {
    // TODO: Integrate with deny endpoint
    console.log(`Denying ${imageId}`);

    try {
      // TODO: Add API call here
      // await fetch('/api/admin/deny', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ imageId }),
      // });

      // Remove from local state after successful denial
      setImages((prev) => prev.filter((img) => img.internal_reference_number !== imageId));
    } catch (error) {
      console.error('Failed to deny image:', error);
      setError('Failed to deny image');
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="main"
        sx={{
          pt: { xs: 12, md: 14 },
          pb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} mb={4}>
            <Typography component="h1" variant="h4" fontWeight={700} color="text.primary">
              Pending Image Review
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review submissions awaiting approval. Approve images to publish them to the database or deny to remove
              them from the review queue.
            </Typography>
            {error ? (
              <Typography variant="body2" color="error.main">
                {error}
              </Typography>
            ) : null}
          </Stack>

          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '50vh' }}>
              <CircularProgress color="secondary" />
            </Stack>
          ) : images.length === 0 ? (
            <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: '40vh' }}>
              <Typography variant="h6" color="text.secondary">
                No pending images to review right now.
              </Typography>
            </Stack>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                alignItems: 'start',
              }}
            >
              {images.map((image) => (
                <PendingImageCard
                  key={image.internal_reference_number}
                  image={image}
                  downloadInFlight={downloadInFlight === image.internal_reference_number}
                  onDownload={handleDownload}
                  onSaveMetadata={handleSaveMetadata}
                  onApprove={handleApprove}
                  onAddToNew={handleAddToNew}
                  onDeny={handleDeny}
                />
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
