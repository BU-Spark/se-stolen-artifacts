'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useUser } from '@clerk/nextjs';
import MainNavbar from '@/app/components/MainNavbar';

type PendingImage = {
  internal_reference_number: string;
  image_url?: string | null;
  title?: string | null;
  description?: string | null;
};

type PendingImagesResponse = {
  images: PendingImage[];
  error?: string;
};

/**
 * Renders the admin "Pending Image Review" page that lets administrators review, approve or deny, and download pending image submissions.
 *
 * The component displays loading, empty, and error states, fetches and shows the list of pending images, and tracks per-image download progress to prevent duplicate downloads.
 *
 * @returns The JSX element for the admin pending image review page
 */
export default function AdminReviewPage() {
  const { isLoaded, isSignedIn } = useUser();
  // const { isLoaded, isSignedIn, user } = useUser();
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

  const handleDecisionClick = useCallback((imageId: string, decision: 'approve' | 'deny') => {
    // TODO: Integrate with approve/deny endpoints when available.
    console.log(`Admin decision for ${imageId}: ${decision}`);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <MainNavbar />
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
              }}
            >
              {images.map((image) => {
                const { internal_reference_number, image_url, title, description } = image;
                return (
                  <Box key={internal_reference_number} sx={{ display: 'flex' }}>
                    <Card sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <CardMedia
                        component="img"
                        image={image_url || '/placeholder-image.png'}
                        alt={title || `Pending image ${internal_reference_number}`}
                        sx={{ height: 280, objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Stack spacing={1}>
                          <Typography variant="h6" color="text.primary">
                            {title || `Image ${internal_reference_number}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Reference ID: {internal_reference_number}
                          </Typography>
                          {description ? (
                            <Typography variant="body2" color="text.secondary">
                              {description}
                            </Typography>
                          ) : null}
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ px: 3, pb: 3 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleDecisionClick(internal_reference_number, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleDecisionClick(internal_reference_number, 'deny')}
                        >
                          Deny
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(internal_reference_number)}
                          disabled={downloadInFlight === internal_reference_number}
                        >
                          {downloadInFlight === internal_reference_number ? 'Downloading...' : 'Download'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}