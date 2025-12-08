'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Box, Button, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { Storage } from '@mui/icons-material';
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
        setImages(payload.images?.filter((img) => img !== null && img !== undefined) ?? []);
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

  const handleDownload = useCallback(async (internalReferenceNumber: string) => {
    try {
      setDownloadInFlight(internalReferenceNumber);
      const response = await fetch(`/api/download/${encodeURIComponent(internalReferenceNumber)}`);
      if (!response.ok) {
        throw new Error('Could not download image.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${internalReferenceNumber}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (downloadError: unknown) {
      const message = downloadError instanceof Error ? downloadError.message : 'Could not download image.';
      setError(message);
    } finally {
      setDownloadInFlight((current) => (current === internalReferenceNumber ? null : current));
    }
  }, []);

  const handleSaveMetadata = useCallback(
    async (internalReferenceNumber: string, metadata: PendingImage['metadata']) => {
      // TODO: API call to update metadata
      console.log('Saving metadata for', internalReferenceNumber, metadata);

      try {
        // TODO: Add API call here
        // await fetch('/api/admin/update-metadata', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ imageId: internalReferenceNumber, metadata }),
        // });

        // Update local state with new metadata
        setImages((prev) =>
          prev.map((img) => (img?.internal_reference_number === internalReferenceNumber ? { ...img, metadata } : img))
        );
      } catch (error) {
        console.error('Failed to save metadata:', error);
        setError('Failed to save metadata');
      }
    },
    []
  );

  const handleApprove = useCallback(
    async (internalReferenceNumber: string, folderId: string, metadata: PendingImage['metadata']) => {
      console.log(`Approving ${internalReferenceNumber} and moving to statue ${folderId}`, metadata);

      try {
        const response = await fetch('/api/admin/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId: internalReferenceNumber, folderId }), // folderId is the statue_id as string
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to approve image');
        }

        // Remove from local state after successful approval
        setImages((prev) => prev.filter((img) => img?.internal_reference_number !== internalReferenceNumber));
      } catch (error) {
        console.error('Failed to approve image:', error);
        setError(error instanceof Error ? error.message : 'Failed to approve image');
      }
    },
    []
  );

  const handleAddToNew = useCallback(async (internalReferenceNumber: string, metadata: PendingImage['metadata']) => {
    console.log(`Creating new statue and adding ${internalReferenceNumber}`, metadata);

    try {
      // First, create a new statue
      const createResponse = await fetch('/api/admin/statues/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.error || 'Failed to create new statue');
      }

      // Then approve the image with the new statue_id
      const approveResponse = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: internalReferenceNumber, folderId: createData.statue.id }),
      });

      const approveData = await approveResponse.json();

      if (!approveResponse.ok) {
        throw new Error(approveData.error || 'Failed to approve image');
      }

      // Remove from local state after successful addition
      setImages((prev) => prev.filter((img) => img?.internal_reference_number !== internalReferenceNumber));
    } catch (error) {
      console.error('Failed to add image to new statue:', error);
      setError(error instanceof Error ? error.message : 'Failed to add image to new statue');
    }
  }, []);

  const handleDeny = useCallback(async (internalReferenceNumber: string) => {
    console.log(`Denying ${internalReferenceNumber}`);

    try {
      const response = await fetch('/api/admin/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: internalReferenceNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deny image');
      }

      // Remove from local state after successful denial
      setImages((prev) => prev.filter((img) => img?.internal_reference_number !== internalReferenceNumber));
    } catch (error) {
      console.error('Failed to deny image:', error);
      setError(error instanceof Error ? error.message : 'Failed to deny image');
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="main"
        sx={{
          pt: { xs: 6, md: 8 },
          pb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} mb={4}>
            <Button
              variant="outlined"
              component={Link}
              href="/admin/db-view"
              startIcon={<Storage />}
              sx={{ alignSelf: 'flex-start' }}
            >
              Database View
            </Button>
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
              {images.map((image, index) => {
                if (!image) {
                  console.error('Encountered null or undefined image:', image);
                  return null; // Skip rendering for invalid images
                }
                return (
                  <PendingImageCard
                    key={image.internal_reference_number || image.image_id || `image-${index}`}
                    image={image}
                    downloadInFlight={downloadInFlight === image.internal_reference_number}
                    onDownload={handleDownload}
                    onSaveMetadata={handleSaveMetadata}
                    onApprove={handleApprove}
                    onAddToNew={handleAddToNew}
                    onDeny={handleDeny}
                  />
                );
              })}
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
